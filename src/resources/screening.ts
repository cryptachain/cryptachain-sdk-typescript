import type { HttpClient } from '../client';
import type {
  ScreeningResult,
  BulkScreeningRequest,
  BulkScreeningResponse,
  ScreenAddressParams,
} from '../types/screening';

/**
 * Resource class for address risk screening endpoints.
 *
 * Proxies to CryptaScreen for sanctions checking, risk scoring,
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
    return this.http.get<ScreeningResult>('/api/v1/screen/address', {
      address: params.address,
      chain_id: params.chainId,
    });
  }

  /**
   * Screen multiple addresses in a single request.
   *
   * @param request - Bulk screening request with array of address/chainId pairs
   * @returns Bulk response with results and per-address errors
   *
   * @example
   * ```ts
   * const bulk = await client.screening.screenBulk({
   *   addresses: [
   *     { address: '0xabc...', chainId: 1 },
   *     { address: '0xdef...', chainId: 137 },
   *   ],
   * });
   * console.log(`Screened: ${bulk.results.length}, Errors: ${bulk.errors.length}`);
   * ```
   */
  async screenBulk(request: BulkScreeningRequest): Promise<BulkScreeningResponse> {
    return this.http.post<BulkScreeningResponse>('/api/v1/screen/bulk', request);
  }
}
