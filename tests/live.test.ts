import { describe, it, expect } from 'vitest';
import { CryptaChain } from '../src';

/**
 * Runs against a NON-PRODUCTION API stack only. Set CRYPTAPRICE_DEV_URL (for example http://localhost:8090) and
 * CRYPTAPRICE_DEV_KEY (a key of that stack). Skipped otherwise, so CI and a plain `npm test` never call a network.
 * The dev stack serves fixture data; the dates below exist in it.
 */
const url = process.env.CRYPTAPRICE_DEV_URL;
const key = process.env.CRYPTAPRICE_DEV_KEY;
const live = url && key ? describe : describe.skip;

live('against the non-production endpoint', () => {
  const client = () => new CryptaChain({ apiKey: key as string, baseUrl: url as string, retries: 0 });

  it('prices.bySymbol / batch / at answer with the recorded shape', async () => {
    const c = client();
    const p = await c.prices.bySymbol({ symbol: 'BTC', date: '2026-11-10', currency: 'EUR' });
    expect(p.currency).toBe('EUR');
    expect(p.fxSource).toBe('ECB');
    expect(typeof p.priceUsd).toBe('number');
    const b = await c.prices.batch({ symbols: ['BTC', 'ETH', 'NOPE'], date: '2026-11-10' });
    expect(Object.keys(b).sort()).toEqual(['BTC', 'ETH']);
    const at = await c.prices.at({ symbol: 'BTC', timestamp: '2026-11-10T12:00:00Z' });
    expect(at.date).toBe('2026-11-10');
    // prices.byContract resolves the contract through the ClickHouse registry, which the dev stack does not have: not exercised here.
  }, 90_000); // each symbol lookup waits for the dev stack's unreachable ClickHouse client to give up (about 5 s)

  it('fx and tokens answer with the recorded shape', async () => {
    const c = client();
    const r = await c.fx.getRate({ from: 'EUR', to: 'USD', date: '2026-11-10' });
    expect(r.toCurrency).toBe('USD');
    const h = await c.fx.getHistory({ currency: 'EUR', from: '2026-11-02', to: '2026-11-06' });
    expect(h.rates.length).toBeGreaterThan(0);
    const m = await c.fx.getMonthlyAverage({ currency: 'EUR', month: '2026-10' });
    expect(m.month).toBe(10);
    const cur = await c.fx.listCurrencies();
    expect(cur.currencies).toContain('EUR');
    const t = await c.tokens.getMetadata('BTC');
    expect(t.symbol).toBe('BTC');
  });
});
