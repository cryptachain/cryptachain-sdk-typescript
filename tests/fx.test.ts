import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { CryptaChain } from '../src';
import { createMockFetch } from './mocks/responses';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const originalFetch = globalThis.fetch;

// Fixtures are bodies recorded from the live /v1/fx routes.
describe('FxResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getRate calls GET /v1/fx/rate and returns the recorded shape', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('fx_rate')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const rate = await client.fx.getRate({ from: 'EUR', to: 'USD', date: '2026-11-10' });

    const u = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(u.pathname).toBe('/v1/fx/rate');
    expect(u.searchParams.get('from')).toBe('EUR');
    expect(u.searchParams.get('to')).toBe('USD');
    expect(u.searchParams.get('date')).toBe('2026-11-10');
    expect(rate.fromCurrency).toBe('EUR');
    expect(rate.toCurrency).toBe('USD');
    expect(rate.rate).toBe(1.1);
  });

  it('getHistory returns the recorded history shape', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('fx_history')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const history = await client.fx.getHistory({ currency: 'EUR', from: '2026-11-01', to: '2026-11-10' });

    expect(new URL(fetchSpy.mock.calls[0][0] as string).pathname).toBe('/v1/fx/history');
    expect(history.baseCurrency).toBe('USD');
    expect(history.rates[0]).toEqual({ date: '2026-11-01', value: 1.01, carriedForward: false, source: 'ECB' });
  });

  it('getMonthlyAverage sends month=YYYY-MM', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('fx_monthly_average')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const avg = await client.fx.getMonthlyAverage({ currency: 'EUR', month: '2026-11' });

    const u = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(u.pathname).toBe('/v1/fx/monthly-average');
    expect(u.searchParams.get('month')).toBe('2026-11');
    expect(u.searchParams.has('year')).toBe(false);
    expect(avg.avgRate).toBe(1.055);
    expect(avg.daysInAverage).toBe(10);
    expect(avg.isLive).toBe(true);
  });

  it('listCurrencies returns the recorded list', async () => {
    globalThis.fetch = createMockFetch(fixture('fx_currencies'));
    const client = new CryptaChain({ apiKey: 'key' });

    const result = await client.fx.listCurrencies();

    expect(result.total).toBe(35);
    expect(result.currencies).toContain('EUR');
    expect(result.pegged).toContain('AED');
  });
});
