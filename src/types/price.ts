/**
 * Price source type.
 *
 * `ZERO_VALUE_IFRS_13_B37` is a legacy value that older API versions returned when no price source
 * was available for the asset at the requested timestamp. It is not an IFRS 13 fair-value assessment
 * and says nothing about whether the asset has an observable market.
 *
 * It is no longer returned: a lookup with no source now yields `NO_PRICE_SOURCE` with `fairValueLevel`
 * unset. The member is kept so that responses from older API versions still type-check.
 */
export type PriceSource =
  | 'CRYPTAPRICE_VWAP'
  | 'MANUAL_OVERRIDE'
  | 'STABLECOIN_PEGGED'
  | 'ZERO_VALUE_IFRS_13_B37';

/**
 * Fair-value hierarchy level, as published by the price source that priced the asset.
 * Present only on rows carrying a real price: a row with no price source has no level, so
 * the field is null rather than `LEVEL_3`. "We found no source" is not a determination
 * that the asset's inputs are unobservable.
 */
export type FairValueLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

/** Where the FX rate came from: the ECB, a fixed peg, or (never sent for USD responses today) null. */
export type FxRateSourceCode = 'ECB' | 'PEG' | string;

/** Close finality of a daily close. UNKNOWN is never FINAL. */
export type CloseFinal = 'FINAL' | 'PROVISIONAL' | 'UNKNOWN';

/**
 * Price response of `GET /v1/prices/{symbol}/fair-value` (recorded from the live route).
 * Decimal values arrive as JSON numbers with up to 18 decimals; read them with a decimal library if you need every digit.
 */
export interface PriceResponse {
  /** Price in the requested currency. */
  price: number;
  priceUsd: number;
  currency: string;
  /** USD per 1 unit of `currency`; null when currency is USD. */
  fxRate: number | null;
  fxSource: FxRateSourceCode | null;
  fxDate: string | null;
  date: string;
  sourceCount: number;
  qualityScore: number;
  /** IFRS 13 level of the price source: 1, 2 or 3; null when unset. */
  fairValueLevel: number | null;
  totalVolumeUsd: number | null;
  spreadPct: number | null;
  methodologyVersion: number;
  revision: number;
  priceCloseZone: string;
  /** DAILY for a daily close, DAILY_FALLBACK when the minute price was not available. */
  precision: string;
  closeGrade: string | null;
  closeFinal: CloseFinal;
}

/** `GET /v1/prices/batch`: a map from the requested symbol to its price. Symbols without a price are absent. */
export type PriceBatchResponse = Record<string, PriceResponse>;

/** Batch request: up to 500 symbols for one date. */
export interface PriceBatchRequest {
  symbols: string[];
  date: string;
  currency?: string;
}

/** Price-at-timestamp response (same fields as a daily price; `precision` says which was used). */
export type PriceAtResponse = PriceResponse;

/** Parameters for price-by-symbol lookup. */
export interface PriceBySymbolParams {
  symbol: string;
  date: string;
  currency?: string;
}

/**
 * Parameters for price-by-contract lookup. Give the chain as its slug (`ethereum`, `bsc`, ...);
 * `chainId` is accepted for the chains the SDK knows and converted to the slug.
 */
export interface PriceByContractParams {
  chain?: string;
  chainId?: number;
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
