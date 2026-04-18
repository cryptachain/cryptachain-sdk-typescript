import type { HttpClient } from '../client';
import type {
  FxRate,
  FxHistoryResponse,
  FxMonthlyAverageResponse,
  CurrenciesResponse,
  FxRateParams,
  FxHistoryParams,
  FxMonthlyAverageParams,
} from '../types/fx';

/**
 * Resource class for fiat exchange rate endpoints.
 *
 * All rates are ECB-sourced via Frankfurter. Supports daily rates,
 * historical ranges, IAS 21 monthly averages, and currency metadata.
 */
export class FxResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get a single FX rate between two currencies on a given date.
   *
   * @param params - Source currency, target currency, and date
   * @returns FX rate with source and business day info
   *
   * @example
   * ```ts
   * const rate = await client.fx.getRate({
   *   from: 'EUR',
   *   to: 'USD',
   *   date: '2026-01-15',
   * });
   * console.log(`EUR/USD: ${rate.rate}`);
   * ```
   */
  async getRate(params: FxRateParams): Promise<FxRate> {
    return this.http.get<FxRate>('/fx/rate', {
      from: params.from,
      to: params.to,
      date: params.date,
    });
  }

  /**
   * Get daily FX rate history for a currency pair over a date range.
   *
   * @param params - Currency code and date range (from/to)
   * @returns Array of daily FX rates
   *
   * @example
   * ```ts
   * const history = await client.fx.getHistory({
   *   currency: 'EUR',
   *   from: '2026-01-01',
   *   to: '2026-01-31',
   * });
   * console.log(`${history.rates.length} daily rates`);
   * ```
   */
  async getHistory(params: FxHistoryParams): Promise<FxHistoryResponse> {
    return this.http.get<FxHistoryResponse>('/fx/history', {
      currency: params.currency,
      from: params.from,
      to: params.to,
    });
  }

  /**
   * Get the IAS 21 monthly average FX rate.
   *
   * Used for translating foreign-currency items in financial statements
   * as permitted by IAS 21.22 when rates do not fluctuate significantly.
   *
   * @param params - Currency, year, and month
   * @returns Monthly average rate with business day count
   *
   * @example
   * ```ts
   * const avg = await client.fx.getMonthlyAverage({
   *   currency: 'EUR',
   *   year: 2026,
   *   month: 1,
   * });
   * console.log(`Jan 2026 avg EUR/USD: ${avg.averageRate}`);
   * ```
   */
  async getMonthlyAverage(params: FxMonthlyAverageParams): Promise<FxMonthlyAverageResponse> {
    return this.http.get<FxMonthlyAverageResponse>('/fx/monthly-average', {
      currency: params.currency,
      year: params.year,
      month: params.month,
    });
  }

  /**
   * List all supported fiat currencies.
   *
   * @returns List of currencies with their sources and USD peg info
   *
   * @example
   * ```ts
   * const { currencies, count } = await client.fx.listCurrencies();
   * console.log(`${count} currencies supported`);
   * currencies.forEach(c => console.log(`${c.code}: ${c.name}`));
   * ```
   */
  async listCurrencies(): Promise<CurrenciesResponse> {
    return this.http.get<CurrenciesResponse>('/fx/currencies');
  }
}
