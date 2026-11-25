import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { CryptaChain } from '../src';

/**
 * Every request the SDK can make must be a route the API really serves. `fixtures/server-routes.txt` is the public route list
 * exported from the API's own OpenAPI document ("METHOD /v1/path/{param}"). A method that calls a route that is not in the
 * list (the defect of 0.1.1) fails here.
 */
const routes = readFileSync(new URL('./fixtures/server-routes.txt', import.meta.url), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((r) => {
    const [method, path] = r.split(' ');
    return { method, re: new RegExp('^' + path.replace(/\{[^/}]+\}/g, '[^/]+') + '$') };
  });

const originalFetch = globalThis.fetch;
const A = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const H = '0x' + 'ab'.repeat(32);

describe('every SDK request is a route the API serves', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('prices, fx, tokens, health, blockchain, wallets, screening', async () => {
    const seen: string[] = [];
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      seen.push(`${init?.method ?? 'GET'} ${new URL(String(url)).pathname}`);
      return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), json: async () => ({}), text: async () => '{}' } as Response;
    }) as typeof fetch;
    const c = new CryptaChain({ apiKey: 'key', retries: 0 });
    const calls: Array<() => Promise<unknown>> = [
      () => c.prices.bySymbol({ symbol: 'BTC', date: '2026-11-10' }),
      () => c.prices.byContract({ chain: 'ethereum', address: A, date: '2026-11-10' }),
      () => c.prices.batch({ symbols: ['BTC'], date: '2026-11-10' }),
      () => c.prices.at({ symbol: 'BTC', timestamp: '2026-11-10T12:00:00Z' }),
      () => c.fx.getRate({ from: 'EUR', to: 'USD', date: '2026-11-10' }),
      () => c.fx.getHistory({ currency: 'EUR', from: '2026-11-01', to: '2026-11-10' }),
      () => c.fx.getMonthlyAverage({ currency: 'EUR', month: '2026-11' }),
      () => c.fx.listCurrencies(),
      () => c.tokens.getMetadata('BTC'),
      () => c.health.getSystemStatus(),
      () => c.health.getChainStatus(),
      () => c.health.getMethodology(),
      () => c.blockchain.getBlock({ chain: 'ethereum', blockNumber: 1 }),
      () => c.blockchain.getTransaction({ chain: 'ethereum', hash: H }),
      () => c.blockchain.getReceipt({ chain: 'ethereum', hash: H }),
      () => c.blockchain.getTraces({ chain: 'ethereum', hash: H }),
      () => c.blockchain.getLogs({ chain: 'ethereum', fromBlock: 1, toBlock: 2 }),
      () => c.wallets.getHistory(A, { chain: 'ethereum' }),
      () => c.wallets.getBalances(A, { chain: 'ethereum' }),
      () => c.wallets.getNativeBalance(A, { chain: 'ethereum' }),
      () => c.wallets.getErc20Transfers(A, { chain: 'ethereum' }),
      () => c.wallets.getNftTransfers(A, { chain: 'ethereum' }),
      () => c.wallets.getNativeTransfers(A, { chain: 'ethereum' }),
      () => c.screening.screenAddress({ address: A, chainId: 1 } as never),
      () => c.screening.screenBulk({ addresses: [{ address: A, chainId: 1 }] } as never),
    ];
    for (const call of calls) await call().catch(() => undefined);
    expect(seen.length).toBeGreaterThanOrEqual(calls.length - 2);
    const unknown = seen.filter((r) => {
      const [m, p] = r.split(' ');
      return !routes.some((x) => x.method === m && x.re.test(p));
    });
    expect(unknown, `SDK calls routes the API does not serve: ${unknown.join(', ')}`).toEqual([]);
  });
});
