import type { CryptaChainConfig } from './config';
import { resolveConfig, type ResolvedConfig } from './config';
import {
  CryptaChainError,
  AuthenticationError,
  RateLimitError,
  ChainNotFoundError,
  QuotaExceededError,
} from './errors';
import { withRetry } from './retry';
import type { ApiErrorResponse } from './types/common';
import { WalletResource } from './resources/wallets';
import { TokenResource } from './resources/tokens';
import { BlockchainResource } from './resources/blockchain';
import { PriceResource } from './resources/prices';
import { FxResource } from './resources/fx';
import { ScreeningResource } from './resources/screening';
import { HealthResource } from './resources/health';

/**
 * Internal HTTP client used by all resource classes.
 * Handles URL construction, authentication, JSON parsing, error mapping,
 * timeout, and retry logic. Uses native `fetch` (Node 18+ / browser).
 */
export class HttpClient {
  private readonly config: ResolvedConfig;

  constructor(config: ResolvedConfig) {
    this.config = config;
  }

  /**
   * Make a GET request.
   * @param path - API path (e.g. '/wallets/0x.../balances')
   * @param params - Query parameters
   */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * Make a POST request with JSON body.
   * @param path - API path
   * @param body - Request body (will be JSON-serialized)
   * @param params - Query parameters
   */
  async post<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Paths starting with '/api/' bypass the default version prefix (e.g. screening: /api/v1/screen/...)
    const base = path.startsWith('/api/')
      ? `${this.config.baseUrl}${path}`
      : `${this.config.baseUrl}/${this.config.version}${path}`;
    if (!params) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    return withRetry(
      () => this.doFetch<T>(url, init),
      {
        retries: this.config.retries,
        retryDelay: this.config.retryDelay,
        onRateLimit: this.config.onRateLimit,
      },
    );
  }

  private async doFetch<T>(url: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'X-API-Key': this.config.apiKey,
          'Accept': 'application/json',
          'User-Agent': '@cryptachain/sdk-typescript/0.1.0',
          ...init.headers,
        },
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof CryptaChainError) throw error;

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CryptaChainError(`Request timed out after ${this.config.timeout}ms`);
      }

      throw new CryptaChainError(
        error instanceof Error ? error.message : 'Unknown network error',
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleError(response: Response): Promise<never> {
    let body: ApiErrorResponse | undefined;
    try {
      body = (await response.json()) as ApiErrorResponse;
    } catch {
      // Response body may not be JSON
    }

    const message = body?.message ?? response.statusText ?? 'Unknown error';

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, body);
      case 402:
        throw new QuotaExceededError(message, body);
      case 404:
        throw new ChainNotFoundError(undefined, body);
      case 429: {
        const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60', 10);
        throw new RateLimitError(retryAfter, body);
      }
      default:
        throw new CryptaChainError(message, response.status, body);
    }
  }
}

/**
 * Main CryptaChain SDK client.
 *
 * Provides access to all API resources: wallets, tokens, blockchain,
 * prices, FX rates, screening, and health.
 *
 * @example
 * ```ts
 * import { CryptaChain } from '@cryptachain/sdk';
 *
 * const client = new CryptaChain({ apiKey: 'your-api-key' });
 *
 * // Get wallet balances
 * const balances = await client.wallets.getBalances('0x...', { chainId: 1 });
 *
 * // Get a price
 * const price = await client.prices.bySymbol({ symbol: 'BTC', date: '2026-01-15' });
 * ```
 */
export class CryptaChain {
  /** Wallet transfer history and balances. */
  readonly wallets: WalletResource;
  /** Token metadata lookup. */
  readonly tokens: TokenResource;
  /** Block, transaction, receipt, trace, and log queries. */
  readonly blockchain: BlockchainResource;
  /** Crypto asset pricing (VWAP, batch, point-in-time). */
  readonly prices: PriceResource;
  /** Fiat exchange rates (ECB-sourced, IAS 21 compliant). */
  readonly fx: FxResource;
  /** Address risk screening (sanctions, labels). */
  readonly screening: ScreeningResource;
  /** System and chain health status. */
  readonly health: HealthResource;

  constructor(config: CryptaChainConfig) {
    if (!config.apiKey) {
      throw new CryptaChainError('apiKey is required');
    }
    const resolved = resolveConfig(config);
    const httpClient = new HttpClient(resolved);
    this.wallets = new WalletResource(httpClient);
    this.tokens = new TokenResource(httpClient);
    this.blockchain = new BlockchainResource(httpClient);
    this.prices = new PriceResource(httpClient);
    this.fx = new FxResource(httpClient);
    this.screening = new ScreeningResource(httpClient);
    this.health = new HealthResource(httpClient);
  }
}
