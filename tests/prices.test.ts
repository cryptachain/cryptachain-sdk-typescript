import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { CryptaChain } from '../src';
import { createMockFetch } from './mocks/responses';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const originalFetch = globalThis.fetch;

// The fixtures are bodies recorded from the live routes (GET /v1/prices/{symbol}/fair-value, /at, /batch).
describe('PriceResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('bySymbol calls GET /v1/prices/{symbol}/fair-value and returns the recorded shape', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('price_usd')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const price = await client.prices.bySymbol({ symbol: 'BTC', date: '2026-11-10' });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(new URL(url).pathname).toBe('/v1/prices/BTC/fair-value');
    expect(new URL(url).searchParams.get('date')).toBe('2026-11-10');
    expect(init.method).toBe('GET');
    expect(price.currency).toBe('USD');
    expect(price.fairValueLevel).toBe(1);
    expect(price.closeFinal).toBe('UNKNOWN');
    expect(price.fxRate).toBeNull();
  });

  it('passes the currency and returns the FX fields', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('price_eur')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const price = await client.prices.bySymbol({ symbol: 'ETH', date: '2026-11-10', currency: 'EUR' });

    expect(new URL(fetchSpy.mock.calls[0][0] as string).searchParams.get('currency')).toBe('EUR');
    expect(price.fxSource).toBe('ECB');
    expect(price.fxRate).toBe(1.1);
  });

  it('byContract calls GET /v1/prices/by-contract/{chain}/{address}/fair-value with the chain slug', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('price_usd')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });
    const address = '0xdac17f958d2ee523a2206206994597c13d831ec7';

    await client.prices.byContract({ chain: 'ethereum', address, date: '2026-11-10' });
    await client.prices.byContract({ chainId: 56, address, date: '2026-11-10' });

    expect(new URL(fetchSpy.mock.calls[0][0] as string).pathname).toBe(`/v1/prices/by-contract/ethereum/${address}/fair-value`);
    expect(new URL(fetchSpy.mock.calls[1][0] as string).pathname).toBe(`/v1/prices/by-contract/bsc/${address}/fair-value`);
    await expect(client.prices.byContract({ chainId: 999999, address, date: '2026-11-10' })).rejects.toThrow('Unknown chainId');
    await expect(client.prices.byContract({ address, date: '2026-11-10' })).rejects.toThrow('Pass `chain`');
  });

  it('batch is GET /v1/prices/batch with comma-joined symbols and returns a symbol map', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('price_batch')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const result = await client.prices.batch({ symbols: ['BTC', 'NOPE'], date: '2026-11-10', currency: 'EUR' });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const u = new URL(url);
    expect(init.method).toBe('GET');
    expect(u.pathname).toBe('/v1/prices/batch');
    expect(u.searchParams.get('symbols')).toBe('BTC,NOPE');
    expect(u.searchParams.get('date')).toBe('2026-11-10');
    expect(Object.keys(result)).toEqual(['BTC']);
    expect(result.BTC.currency).toBe('EUR');
    await expect(client.prices.batch({ symbols: [], date: '2026-11-10' })).rejects.toThrow('1 to 500');
  });

  it('at calls GET /v1/prices/{symbol}/at with the timestamp', async () => {
    const fetchSpy = vi.fn(createMockFetch(fixture('price_at')));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const price = await client.prices.at({ symbol: 'BTC', timestamp: '2026-11-10T12:00:00Z' });

    const u = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(u.pathname).toBe('/v1/prices/BTC/at');
    expect(u.searchParams.get('timestamp')).toBe('2026-11-10T12:00:00Z');
    expect(price.precision).toBe('DAILY_FALLBACK');
  });
});
