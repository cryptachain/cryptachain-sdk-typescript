import type { Address } from './common';

/** Token metadata. */
export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: Address;
  chainId?: number;
  logoUrl?: string;
  coingeckoId?: string;
  /** Whether this token is a stablecoin pegged to USD. */
  isStablecoin: boolean;
  /** Total supply in smallest unit. */
  totalSupply?: string;
  /** Market cap in USD if available. */
  marketCapUsd?: string;
}
