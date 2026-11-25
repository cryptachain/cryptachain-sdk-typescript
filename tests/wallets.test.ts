import { describe, it, expect, vi, afterEach } from 'vitest';
import { CryptaChain } from '../src';
import {
  createMockFetch,
  createSequentialMockFetch,
  mockTransferHistory,
  mockTransferHistoryPage1,
  mockTransferHistoryPage2,
  mockTokenBalance,
  mockNativeBalance,
} from './mocks/responses';

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const originalFetch = globalThis.fetch;

describe('WalletResource', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should fetch transfer history', async () => {
    globalThis.fetch = createMockFetch(mockTransferHistory);
    const client = new CryptaChain({ apiKey: 'key' });

    const result = await client.wallets.getHistory(ADDRESS, { chainId: 1, limit: 50 });
    expect(result.transfers).toHaveLength(1);
    expect(result.transfers[0].hash).toBe('0xabc123def456');
    expect(result.pagination.hasMore).toBe(false);
  });

  it('should pass query parameters correctly', async () => {
    const fetchSpy = vi.fn(createMockFetch(mockTransferHistory));
    globalThis.fetch = fetchSpy;
    const client = new CryptaChain({ apiKey: 'key' });

    await client.wallets.getHistory(ADDRESS, {
      chainId: 1,
      limit: 25,
      fromBlock: 100,
      toBlock: 200,
    });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain('chain=ethereum');
    expect(url).not.toContain('chain_id');
    expect(url).toContain('limit=25');
    expect(url).toContain('from_block=100');
    expect(url).toContain('to_block=200');
  });

  it('should paginate through all transfers with getAllTransfers', async () => {
    globalThis.fetch = createSequentialMockFetch([
      { data: mockTransferHistoryPage1 },
      { data: mockTransferHistoryPage2 },
    ]);
    const client = new CryptaChain({ apiKey: 'key' });

    const transfers = [];
    for await (const transfer of client.wallets.getAllTransfers(ADDRESS, { chainId: 1 })) {
      transfers.push(transfer);
    }

    expect(transfers).toHaveLength(2);
    expect(transfers[0].hash).toBe('0xabc123def456');
    expect(transfers[1].hash).toBe('0xdef789');
  });

  it('should fetch token balances', async () => {
    globalThis.fetch = createMockFetch([mockTokenBalance]);
    const client = new CryptaChain({ apiKey: 'key' });

    const balances = await client.wallets.getBalances(ADDRESS, { chainId: 1 });
    expect(balances).toHaveLength(1);
    expect(balances[0].tokenSymbol).toBe('USDC');
  });

  it('should fetch native balance', async () => {
    globalThis.fetch = createMockFetch(mockNativeBalance);
    const client = new CryptaChain({ apiKey: 'key' });

    const balance = await client.wallets.getNativeBalance(ADDRESS, { chainId: 1 });
    expect(balance.symbol).toBe('ETH');
    expect(balance.balance).toBe('5000000000000000000');
  });
});
