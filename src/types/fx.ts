/** Source codes of an FX rate on the old routes (FRANKFURTER_ECB: an ECB rate; HARDCODED_PEG: a fixed peg). */
export type FxRateSource = 'FRANKFURTER_ECB' | 'HARDCODED_PEG' | 'USD_BASE' | string;

/** `GET /v1/fx/rate`: one rate, `from` -> `to` on `date` (recorded from the live route). */
export interface FxRate {
  fromCurrency: string;
  toCurrency: string;
  date: string;
  rate: number;
  source: FxRateSource;
}

/** One day of an FX history: USD per 1 unit of `currency`. */
export interface FxHistoryPoint {
  date: string;
  value: number;
  /** true when the day had no rate of its own and the previous one was carried forward. */
  carriedForward: boolean;
  source: string;
}

/** `GET /v1/fx/history`. */
export interface FxHistoryResponse {
  currency: string;
  baseCurrency: string;
  from: string;
  to: string;
  rates: FxHistoryPoint[];
}

/** `GET /v1/fx/monthly-average`: IAS 21 monthly average. `isLive` is true for a month that is not finished. */
export interface FxMonthlyAverageResponse {
  currency: string;
  baseCurrency: string;
  year: number;
  month: number;
  avgRate: number;
  daysInAverage: number;
  isLive: boolean;
}

/** `GET /v1/fx/currencies`. */
export interface CurrenciesResponse {
  currencies: string[];
  ecbCount: number;
  pegged: string[];
  peggedCount: number;
  total: number;
}

/** Parameters for fetching a single FX rate. */
export interface FxRateParams {
  from: string;
  to: string;
  date: string;
}

/** Parameters for fetching FX history. */
export interface FxHistoryParams {
  currency: string;
  from: string;
  to: string;
}

/** Parameters for fetching monthly average FX rate. */
export interface FxMonthlyAverageParams {
  currency: string;
  /** Month as `YYYY-MM`. */
  month: string;
}
