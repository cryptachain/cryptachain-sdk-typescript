import { describe, it, expect, vi, afterEach } from 'vitest';
import { CryptaChain } from '../src';
import { createMockFetch, mockFxRate, mockCurrencies } from './mocks/responses';

const originalFetch = globalThis.fetch;

describe('FxResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should fetch single FX rate', async () => {
    globalThis.fetch = createMockFetch(mockFxRate);
    const client = new CryptaChain({ apiKey: 'key' });

    const rate = await client.fx.getRate({
      from: 'EUR',
      to: 'USD',
      date: '2026-01-15',
    });

    expect(rate.currency).toBe('EUR');
    expect(rate.rate).toBe('1.0842');
    expect(rate.source).toBe('FRANKFURTER_ECB');
  });

  it('should pass FX rate query params correctly', async () => {
    const fetchSpy = vi.fn(createMockFetch(mockFxRate));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    await client.fx.getRate({ from: 'EUR', to: 'USD', date: '2026-01-15' });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain('from=EUR');
    expect(url).toContain('to=USD');
    expect(url).toContain('date=2026-01-15');
  });

  it('should fetch FX history', async () => {
    const historyResponse = {
      currency: 'EUR',
      from: '2026-01-01',
      to: '2026-01-31',
      rates: [mockFxRate],
    };
    globalThis.fetch = createMockFetch(historyResponse);
    const client = new CryptaChain({ apiKey: 'key' });

    const history = await client.fx.getHistory({
      currency: 'EUR',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(history.rates).toHaveLength(1);
    expect(history.currency).toBe('EUR');
  });

  it('should fetch monthly average', async () => {
    const avgResponse = {
      currency: 'EUR',
      year: 2026,
      month: 1,
      averageRate: '1.0815',
      daysInMonth: 31,
      businessDays: 22,
      source: 'FRANKFURTER_ECB',
      computedAt: '2026-02-01T00:00:00Z',
    };
    globalThis.fetch = createMockFetch(avgResponse);
    const client = new CryptaChain({ apiKey: 'key' });

    const avg = await client.fx.getMonthlyAverage({
      currency: 'EUR',
      year: 2026,
      month: 1,
    });

    expect(avg.averageRate).toBe('1.0815');
    expect(avg.businessDays).toBe(22);
  });

  it('should list currencies', async () => {
    globalThis.fetch = createMockFetch(mockCurrencies);
    const client = new CryptaChain({ apiKey: 'key' });

    const result = await client.fx.listCurrencies();
    expect(result.count).toBe(3);
    expect(result.currencies[0].code).toBe('USD');
  });
});
