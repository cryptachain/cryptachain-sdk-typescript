import type { Address } from './common';

/** Risk level classification. */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' | 'UNKNOWN';

/** Sanctions list match. */
export interface SanctionsMatch {
  listName: string;
  entityName: string;
  matchScore: number;
  listUrl?: string;
  listedAt?: string;
}

/** Screening result for a single address. */
export interface ScreeningResult {
  address: Address;
  chainId: number;
  riskLevel: RiskLevel;
  riskScore: number;
  sanctionsMatches: SanctionsMatch[];
  categories: string[];
  labels: string[];
  isSanctioned: boolean;
  screenedAt: string;
  source: string;
}

/** Bulk screening request. */
export interface BulkScreeningRequest {
  addresses: Array<{
    address: Address;
    chainId: number;
  }>;
}

/** Bulk screening response. */
export interface BulkScreeningResponse {
  results: ScreeningResult[];
  errors: Array<{
    address: Address;
    chainId: number;
    error: string;
  }>;
}

/** Parameters for screening a single address. */
export interface ScreenAddressParams {
  address: Address;
  chainId: number;
}
