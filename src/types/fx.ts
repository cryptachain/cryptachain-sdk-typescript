/** FX rate source type. */
export type FxRateSource = 'FRANKFURTER_ECB' | 'HARDCODED_PEG' | 'GAP_FILL_CARRY_FORWARD';

/** Single FX rate entry. */
export interface FxRate {
  currency: string;
  date: string;
  rate: string;
  source: FxRateSource;
  isBusinessDay: boolean;
  ratedate: string;
}

/** FX history response. */
export interface FxHistoryResponse {
  currency: string;
  from: string;
  to: string;
  rates: FxRate[];
}

/** IAS 21 monthly average FX rate response. */
export interface FxMonthlyAverageResponse {
  currency: string;
  year: number;
  month: number;
  averageRate: string;
  daysInMonth: number;
  businessDays: number;
  source: string;
  computedAt: string;
}

/** Currency information. */
export interface CurrencyInfo {
  code: string;
  name: string;
  source: 'FRANKFURTER_ECB' | 'HARDCODED_PEG' | 'BASE_USD';
  peggedToUsd: boolean;
  pegRatio?: string;
}

/** List of supported currencies. */
export interface CurrenciesResponse {
  currencies: CurrencyInfo[];
  count: number;
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
  year: number;
  month: number;
}
