/** Overall system status. */
export interface SystemStatus {
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  version: string;
  uptime: number;
  services: ServiceStatus[];
  timestamp: string;
}

/** Individual service status. */
export interface ServiceStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  latencyMs?: number;
  lastChecked: string;
  message?: string;
}

/** Chain sync status. */
export interface ChainStatus {
  chainId: number;
  name: string;
  slug: string;
  status: 'SYNCED' | 'SYNCING' | 'BEHIND' | 'DOWN';
  latestBlock: number;
  syncedBlock: number;
  lagBlocks: number;
  lagSeconds: number;
  lastUpdated: string;
}

/** Chain status list response. */
export interface ChainStatusResponse {
  chains: ChainStatus[];
  timestamp: string;
}

/** Pricing methodology document. */
export interface MethodologyResponse {
  version: string;
  title: string;
  content: string;
  lastUpdated: string;
}
