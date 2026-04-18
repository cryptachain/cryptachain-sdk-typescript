/** FX rate source type. */
export type FxSource = 'FRANKFURTER_ECB' | 'HARDCODED_PEG' | 'USD_BASE';

/** Price source type. */
export type PriceSource =
  | 'CRYPTAPRICE_VWAP'
  | 'MANUAL_OVERRIDE'
  | 'STABLECOIN_PEGGED'
  | 'ZERO_VALUE_IFRS_13_B37';

/** IFRS 13 fair value hierarchy level. */
export type FairValueLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

/** Price response from the API. */
export interface PriceResponse {
  symbol: string;
  date: string;
  currency: string;
  price: string;
  priceUsd: string;
  fxRate: string;
  fxSource: FxSource;
  fxDate: string;
  source: PriceSource;
  qualityScore: number;
  fairValueLevel: FairValueLevel;
  sourceCount: number;
  methodologyVersion: string;
  stablecoinPegged: boolean;
  manualOverride: boolean;
  computedAt: string;
}

/** Single request within a batch. */
export interface PriceBatchRequestItem {
  symbol?: string;
  chainId?: number;
  contractAddress?: string;
  date: string;
  currency?: string;
}

/** Batch price request body. */
export interface PriceBatchRequest {
  requests: PriceBatchRequestItem[];
}

/** Batch price response. */
export interface PriceBatchResponse {
  results: PriceResponse[];
  errors: Array<{ index: number; error: string }>;
}

/** Price-at-timestamp response (1-minute precision via ClickHouse). */
export interface PriceAtResponse extends PriceResponse {
  timestamp: string;
  blockNumber?: number;
}

/** Parameters for price-by-symbol lookup. */
export interface PriceBySymbolParams {
  symbol: string;
  date: string;
  currency?: string;
}

/** Parameters for price-by-contract lookup. */
export interface PriceByContractParams {
  chainId: number;
  address: string;
  date: string;
  currency?: string;
}

/** Parameters for price-at-timestamp lookup. */
export interface PriceAtParams {
  symbol: string;
  timestamp: string;
  currency?: string;
}
