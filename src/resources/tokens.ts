import type { HttpClient } from '../client';
import type { TokenMetadata } from '../types/token';

/**
 * Resource class for token metadata endpoints.
 */
export class TokenResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get metadata for a token by its symbol.
   *
   * @param symbol - Token symbol (e.g. 'ETH', 'USDC')
   * @returns Token metadata including name, decimals, and contract info
   *
   * @example
   * ```ts
   * const token = await client.tokens.getMetadata('USDC');
   * console.log(`${token.name} — ${token.decimals} decimals`);
   * ```
   */
  async getMetadata(symbol: string): Promise<TokenMetadata> {
    return this.http.get<TokenMetadata>(`/tokens/${encodeURIComponent(symbol)}`);
  }
}
