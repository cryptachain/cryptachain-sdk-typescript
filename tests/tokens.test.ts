import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { CryptaChain } from '../src';
import { createMockFetch } from './mocks/responses';

const originalFetch = globalThis.fetch;

describe('TokenResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getMetadata calls GET /v1/prices/tokens/{symbol} and returns the recorded shape', async () => {
    const body = JSON.parse(readFileSync(new URL('./fixtures/token.json', import.meta.url), 'utf8'));
    const fetchSpy = vi.fn(createMockFetch(body));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    const token = await client.tokens.getMetadata('BTC');

    expect(new URL(fetchSpy.mock.calls[0][0] as string).pathname).toBe('/v1/prices/tokens/BTC');
    expect(token.tokenId).toBe(1);
    expect(token.category).toBe('LAYER1');
    expect(token.coingeckoId).toBe('bitcoin');
  });
});
