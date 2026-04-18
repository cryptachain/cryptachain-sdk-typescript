import type { HttpClient } from '../client';
import type {
  PriceResponse,
  PriceBatchRequest,
  PriceBatchResponse,
  PriceAtResponse,
  PriceBySymbolParams,
  PriceByContractParams,
  PriceAtParams,
} from '../types/price';

/**
 * Resource class for crypto asset pricing endpoints.
 *
 * Supports single lookups by symbol or contract, batch requests (up to 500),
 * and point-in-time pricing with 1-minute precision via ClickHouse.
 */
export class PriceResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get the price of a crypto asset by its ticker symbol.
   *
   * @param params - Symbol, date, and optional target currency
   * @returns Price response with VWAP data, quality score, and IFRS fair value level
   *
   * @example
   * ```ts
   * const price = await client.prices.bySymbol({
   *   symbol: 'BTC',
   *   date: '2026-01-15',
   *   currency: 'EUR',
   * });
   * console.log(`BTC: ${price.price} ${price.currency}`);
   * ```
   */
  async bySymbol(params: PriceBySymbolParams): Promise<PriceResponse> {
    return this.http.get<PriceResponse>('/prices/by-symbol', {
      symbol: params.symbol,
      date: params.date,
      currency: params.currency,
    });
  }

  /**
   * Get the price of a token by its contract address and chain.
   *
   * @param params - Chain ID, contract address, date, and optional target currency
   * @returns Price response
   *
   * @example
   * ```ts
   * const price = await client.prices.byContract({
   *   chainId: 1,
   *   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
   *   date: '2026-01-15',
   * });
   * console.log(`USDC: $${price.priceUsd}`);
   * ```
   */
  async byContract(params: PriceByContractParams): Promise<PriceResponse> {
    return this.http.get<PriceResponse>('/prices/by-contract', {
      chain_id: params.chainId,
      address: params.address,
      date: params.date,
      currency: params.currency,
    });
  }

  /**
   * Fetch prices for multiple assets in a single request.
   *
   * Supports up to 500 items per batch. Each item can use either symbol or
   * chain + contract address to identify the asset.
   *
   * @param request - Batch request containing up to 500 price lookups
   * @returns Batch response with results and per-item errors
   *
   * @example
   * ```ts
   * const batch = await client.prices.batch({
   *   requests: [
   *     { symbol: 'BTC', date: '2026-01-15', currency: 'EUR' },
   *     { symbol: 'ETH', date: '2026-01-15', currency: 'EUR' },
   *     { chainId: 1, contractAddress: '0xA0b8...', date: '2026-01-15' },
   *   ],
   * });
   * console.log(`Got ${batch.results.length} prices, ${batch.errors.length} errors`);
   * ```
   */
  async batch(request: PriceBatchRequest): Promise<PriceBatchResponse> {
    return this.http.post<PriceBatchResponse>('/prices/batch', request);
  }

  /**
   * Get the price of a crypto asset at a specific timestamp with 1-minute precision.
   *
   * Uses ClickHouse for high-precision historical lookups. Ideal for
   * transaction-level cost basis calculations.
   *
   * @param params - Symbol, Unix timestamp, and optional target currency
   * @returns Price response with exact timestamp and optional block number
   *
   * @example
   * ```ts
   * const price = await client.prices.at({
   *   symbol: 'ETH',
   *   timestamp: '2026-01-15T14:30:00Z',
   *   currency: 'USD',
   * });
   * console.log(`ETH at ${price.timestamp}: $${price.priceUsd}`);
   * ```
   */
  async at(params: PriceAtParams): Promise<PriceAtResponse> {
    return this.http.get<PriceAtResponse>('/prices/at', {
      symbol: params.symbol,
      timestamp: params.timestamp,
      currency: params.currency,
    });
  }
}
