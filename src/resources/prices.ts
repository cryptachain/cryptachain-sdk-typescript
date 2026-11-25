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
import { resolveChainSlug } from '../utils/chain';

/**
 * Resource class for crypto asset pricing endpoints.
 *
 * Supports single lookups by symbol or contract, batch requests (up to 500),
 * and point-in-time pricing with 1-minute precision.
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
    return this.http.get<PriceResponse>(`/prices/${encodeURIComponent(params.symbol)}/fair-value`, {
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
   *   chain: 'ethereum',
   *   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
   *   date: '2026-01-15',
   * });
   * console.log(`USDC: $${price.priceUsd}`);
   * ```
   */
  async byContract(params: PriceByContractParams): Promise<PriceResponse> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<PriceResponse>(
      `/prices/by-contract/${encodeURIComponent(chain)}/${encodeURIComponent(params.address)}/fair-value`,
      { date: params.date, currency: params.currency },
    );
  }

  /**
   * Fetch prices for multiple assets in a single request.
   *
   * Up to 500 symbols for ONE date. A symbol that has no price on that date is absent from the result.
   * (GET /v1/prices/batch; for contracts use POST /v1/prices/by-contract/batch, not wrapped yet.)
   *
   * @param request - Symbols (max 500), date and optional currency
   * @returns Map from symbol to price
   *
   * @example
   * ```ts
   * const batch = await client.prices.batch({
   *   symbols: ['BTC', 'ETH'],
   *   date: '2026-01-15',
   *   currency: 'EUR',
   * });
   * console.log(batch.BTC.price, Object.keys(batch).length);
   * ```
   */
  async batch(request: PriceBatchRequest): Promise<PriceBatchResponse> {
    if (request.symbols.length === 0 || request.symbols.length > 500) {
      throw new Error('prices.batch takes 1 to 500 symbols');
    }
    return this.http.get<PriceBatchResponse>('/prices/batch', {
      symbols: request.symbols.join(','),
      date: request.date,
      currency: request.currency,
    });
  }

  /**
   * Get the price of a crypto asset at a specific timestamp with 1-minute precision.
   *
   * Uses minute-resolution data for high-precision historical lookups. Ideal for
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
    return this.http.get<PriceAtResponse>(`/prices/${encodeURIComponent(params.symbol)}/at`, {
      timestamp: params.timestamp,
      currency: params.currency,
    });
  }
}
