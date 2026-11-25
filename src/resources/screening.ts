import type { HttpClient } from '../client';
import { resolveChainSlug } from '../utils/chain';
import type {
  ScreeningResult,
  BulkScreeningRequest,
  ScreenAddressParams,
} from '../types/screening';

/**
 * Resource class for address risk screening endpoints.
 *
 * Screening endpoints for sanctions checking, risk scoring,
 * and address labeling.
 */
export class ScreeningResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Screen a single blockchain address for risk and sanctions.
   *
   * @param params - Address and chain ID to screen
   * @returns Screening result with risk level, score, sanctions matches, and labels
   *
   * @example
   * ```ts
   * const result = await client.screening.screenAddress({
   *   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
   *   chainId: 1,
   * });
   * console.log(`Risk: ${result.riskLevel} (${result.riskScore})`);
   * if (result.isSanctioned) {
   *   console.warn('ADDRESS IS SANCTIONED');
   * }
   * ```
   */
  async screenAddress(params: ScreenAddressParams): Promise<ScreeningResult> {
    return this.http.post<ScreeningResult>('/screen/address', {
      address: params.address,
      chain: resolveChainSlug(params.chain, params.chainId),
    });
  }

  /**
   * Screen multiple addresses in a single request.
   *
   * @param request - Bulk screening request with array of address/chainId pairs
   * @returns One screening result per address (the API answers with a JSON array)
   *
   * @example
   * ```ts
   * const bulk = await client.screening.screenBulk({
   *   addresses: [
   *     { address: '0xabc...', chainId: 1 },
   *     { address: '0xdef...', chainId: 137 },
   *   ],
   * });
   * console.log(`Screened: ${bulk.length}`);
   * ```
   */
  async screenBulk(request: BulkScreeningRequest): Promise<ScreeningResult[]> {
    return this.http.post<ScreeningResult[]>(
      '/screen/bulk',
      request.addresses.map((a) => ({ address: a.address, chain: resolveChainSlug(a.chain, a.chainId) })),
    );
  }
}
