import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CryptaChain,
  CryptaChainError,
  ChainNotServedError,
  ChainNotFoundError,
  CHAIN_NOT_SERVED,
  isChainNotServedResponse,
} from '../src';
import { createMockFetch, mockTokenBalance } from './mocks/responses';

/**
 * The 501 CHAIN_NOT_SERVED contract, from the client's side.
 *
 * The pairing is the point throughout: each refusal assertion sits beside a case that must NOT
 * become a refusal. Without those, an implementation that mapped every 501 — or every error — to
 * ChainNotServedError would satisfy the interesting half of this file.
 */
describe('CHAIN_NOT_SERVED', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const notServedBody = {
    status: 501,
    error: CHAIN_NOT_SERVED,
    code: CHAIN_NOT_SERVED,
    chain: 'polygon',
    chainId: 137,
    servedChains: ['ethereum', 'ethereum-classic'],
    message:
      "Chain 'polygon' (chainId 137) is advertised by this API but is not indexed, so no data can be served for it.",
    timestamp: '2026-08-10T00:00:00Z',
  };

  it('maps a 501 carrying the marker to ChainNotServedError with the chain detail intact', async () => {
    globalThis.fetch = createMockFetch(notServedBody, 501);
    const client = new CryptaChain({ apiKey: 'k', retries: 0 });

    const err = await client.wallets
      .getBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', { chainId: 137 })
      .then(() => null)
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ChainNotServedError);
    const e = err as ChainNotServedError;
    expect(e.status).toBe(501);
    expect(e.chain).toBe('polygon');
    expect(e.chainId).toBe(137);
    expect(e.servedChains).toEqual(['ethereum', 'ethereum-classic']);
    // A caller catching the base class still works — this is a refinement, not a new hierarchy.
    expect(e).toBeInstanceOf(CryptaChainError);
    // And it is NOT a 404: "we do not serve this chain" and "no such chain" are different claims.
    expect(e).not.toBeInstanceOf(ChainNotFoundError);
  });

  it('leaves a 501 WITHOUT the marker as a plain CryptaChainError', async () => {
    // /approvals and /defi-positions answer 501 as reserved routes, with no `code`. Mapping those
    // to ChainNotServedError would invent a chain and chainId that the server never sent.
    globalThis.fetch = createMockFetch(
      {
        status: 501,
        error: 'Not Implemented',
        message: 'Not implemented.',
      },
      501,
    );
    const client = new CryptaChain({ apiKey: 'k', retries: 0 });

    const err = await client.wallets
      .getBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', { chainId: 1 })
      .then(() => null)
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(CryptaChainError);
    expect(err).not.toBeInstanceOf(ChainNotServedError);
    expect((err as CryptaChainError).status).toBe(501);
  });

  it('does not turn a successful response into a refusal', async () => {
    // The positive control for the whole file.
    globalThis.fetch = vi.fn(createMockFetch([mockTokenBalance], 200));
    const client = new CryptaChain({ apiKey: 'k', retries: 0 });

    await expect(
      client.wallets.getBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', { chainId: 1 }),
    ).resolves.toBeDefined();
  });

  describe('isChainNotServedResponse', () => {
    it('narrows only on the marker, not on the status', () => {
      expect(isChainNotServedResponse(notServedBody)).toBe(true);
      expect(
        isChainNotServedResponse({ status: 501, error: 'Not Implemented', message: 'x' }),
      ).toBe(false);
      expect(isChainNotServedResponse(undefined)).toBe(false);
    });
  });
});
