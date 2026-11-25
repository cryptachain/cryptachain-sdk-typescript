import type { Transfer, TransferHistoryResponse, TokenBalance, NativeBalance } from '../../src/types/wallet';
import type { ScreeningResult } from '../../src/types/screening';

export const mockTransfer: Transfer = {
  hash: '0xabc123def456',
  blockNumber: 19000000,
  timestamp: '2026-01-15T12:00:00Z',
  from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  value: '1000000000000000000',
  type: 'NATIVE',
  chainId: 1,
  gasUsed: '21000',
  gasPrice: '20000000000',
  status: 'SUCCESS',
};

export const mockTransferHistory: TransferHistoryResponse = {
  transfers: [mockTransfer],
  pagination: {
    hasMore: false,
    cursor: undefined,
    total: 1,
  },
};

export const mockTransferHistoryPage1: TransferHistoryResponse = {
  transfers: [mockTransfer],
  pagination: {
    hasMore: true,
    cursor: 'cursor-page-2',
    total: 2,
  },
};

export const mockTransferHistoryPage2: TransferHistoryResponse = {
  transfers: [{ ...mockTransfer, hash: '0xdef789' }],
  pagination: {
    hasMore: false,
    cursor: undefined,
    total: 2,
  },
};

export const mockTokenBalance: TokenBalance = {
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  tokenSymbol: 'USDC',
  tokenName: 'USD Coin',
  tokenDecimals: 6,
  balance: '1000000000',
  chainId: 1,
  valueUsd: '1000.00',
};

export const mockNativeBalance: NativeBalance = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  chainId: 1,
  balance: '5000000000000000000',
  symbol: 'ETH',
  decimals: 18,
  valueUsd: '15000.00',
};

export const mockScreeningResult: ScreeningResult = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  chainId: 1,
  riskLevel: 'LOW',
  riskScore: 5,
  sanctionsMatches: [],
  categories: [],
  labels: ['vitalik.eth'],
  isSanctioned: false,
  screenedAt: '2026-01-15T12:00:00Z',
  source: 'screening',
};

/** Create a mock fetch that returns the given data for any request. */
export function createMockFetch(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return async (_url: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers(headers),
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response;
  };
}

/** Create a mock fetch that returns different responses for sequential calls. */
export function createSequentialMockFetch(responses: Array<{ data: unknown; status?: number }>) {
  let callIndex = 0;
  return async (_url: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    const resp = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return {
      ok: (resp.status ?? 200) >= 200 && (resp.status ?? 200) < 300,
      status: resp.status ?? 200,
      statusText: 'OK',
      headers: new Headers(),
      json: async () => resp.data,
      text: async () => JSON.stringify(resp.data),
    } as Response;
  };
}
