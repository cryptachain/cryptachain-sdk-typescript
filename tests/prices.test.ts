import { describe, it, expect, vi, afterEach } from 'vitest';
import { CryptaChain } from '../src';
import { createMockFetch, mockPriceResponse } from './mocks/responses';

const originalFetch = globalThis.fetch;

describe('PriceResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should fetch price by symbol', async () => {
    globalThis.fetch = createMockFetch(mockPriceResponse);
    const client = new CryptaChain({ apiKey: 'key' });

    const price = await client.prices.bySymbol({
      symbol: 'BTC',
      date: '2026-01-15',
    });

    expect(price.symbol).toBe('BTC');
    expect(price.price).toBe('105234.56');
    expect(price.source).toBe('CRYPTAPRICE_VWAP');
    expect(price.fairValueLevel).toBe('LEVEL_1');
  });

  it('should pass currency parameter', async () => {
    const fetchSpy = vi.fn(createMockFetch(mockPriceResponse));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    await client.prices.bySymbol({
      symbol: 'BTC',
      date: '2026-01-15',
      currency: 'EUR',
    });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain('currency=EUR');
  });

  it('should fetch price by contract', async () => {
    const fetchSpy = vi.fn(createMockFetch(mockPriceResponse));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    await client.prices.byContract({
      chainId: 1,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      date: '2026-01-15',
    });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain('chain_id=1');
    expect(url).toContain('address=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  });

  it('should send batch price request as POST', async () => {
    const batchResponse = {
      results: [mockPriceResponse],
      errors: [],
    };
    const fetchSpy = vi.fn(createMockFetch(batchResponse));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const result = await client.prices.batch({
      requests: [{ symbol: 'BTC', date: '2026-01-15' }],
    });

    expect(result.results).toHaveLength(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('should fetch price at timestamp', async () => {
    const atResponse = { ...mockPriceResponse, timestamp: '2026-01-15T14:30:00Z', blockNumber: 19000000 };
    globalThis.fetch = createMockFetch(atResponse);
    const client = new CryptaChain({ apiKey: 'key' });

    const price = await client.prices.at({
      symbol: 'ETH',
      timestamp: '2026-01-15T14:30:00Z',
    });

    expect(price.timestamp).toBe('2026-01-15T14:30:00Z');
  });
});
