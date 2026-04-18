import type { HttpClient } from '../client';
import type { Chain } from '../types/common';
import type {
  SystemStatus,
  ChainStatusResponse,
  MethodologyResponse,
} from '../types/health';

/**
 * Resource class for system health and status endpoints.
 */
export class HealthResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get overall system/service health status.
   *
   * @returns System status with individual service statuses
   *
   * @example
   * ```ts
   * const status = await client.health.getSystemStatus();
   * console.log(`System: ${status.status}`);
   * status.services.forEach(s => console.log(`  ${s.name}: ${s.status}`));
   * ```
   */
  async getSystemStatus(): Promise<SystemStatus> {
    return this.http.get<SystemStatus>('/status/services');
  }

  /**
   * Get sync status for all supported chains.
   *
   * @returns Chain-by-chain sync status with block lag information
   *
   * @example
   * ```ts
   * const { chains } = await client.health.getChainStatus();
   * const behind = chains.filter(c => c.status === 'BEHIND');
   * console.log(`${behind.length} chains behind`);
   * ```
   */
  async getChainStatus(): Promise<ChainStatusResponse> {
    return this.http.get<ChainStatusResponse>('/status/chains');
  }

  /**
   * List all supported blockchain networks.
   *
   * @returns Array of supported chains with metadata
   *
   * @example
   * ```ts
   * const chains = await client.health.listChains();
   * const evm = chains.filter(c => c.isEvm);
   * console.log(`${evm.length} EVM chains supported`);
   * ```
   */
  async listChains(): Promise<Chain[]> {
    return this.http.get<Chain[]>('/chains');
  }

  /**
   * Get the pricing methodology document.
   *
   * @returns Methodology version and content
   *
   * @example
   * ```ts
   * const methodology = await client.health.getMethodology();
   * console.log(`Methodology v${methodology.version}`);
   * ```
   */
  async getMethodology(): Promise<MethodologyResponse> {
    return this.http.get<MethodologyResponse>('/methodology');
  }
}
