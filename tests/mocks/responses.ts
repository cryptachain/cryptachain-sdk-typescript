import type { PriceResponse } from '../../src/types/price';
import type { FxRate, CurrenciesResponse } from '../../src/types/fx';
import type { Transfer, TransferHistoryResponse, TokenBalance, NativeBalance, WalletSummary } from '../../src/types/wallet';
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

export const mockWalletSummary: WalletSummary = {
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  chainId: 1,
  firstTransactionAt: '2020-01-01T00:00:00Z',
  lastTransactionAt: '2026-01-15T12:00:00Z',
  totalTransactions: 1500,
  totalTokenTransfers: 800,
  totalNftTransfers: 50,
  nativeBalance: '5000000000000000000',
  tokenCount: 25,
  nftCount: 10,
};

export const mockPriceResponse: PriceResponse = {
  symbol: 'BTC',
  date: '2026-01-15',
  currency: 'USD',
  price: '105234.56',
  priceUsd: '105234.56',
  fxRate: '1.0',
  fxSource: 'USD_BASE',
  fxDate: '2026-01-15',
  source: 'CRYPTAPRICE_VWAP',
  qualityScore: 0.95,
  fairValueLevel: 'LEVEL_1',
  sourceCount: 12,
  methodologyVersion: '2.3',
  stablecoinPegged: false,
  manualOverride: false,
  computedAt: '2026-01-15T00:05:00Z',
};

export const mockFxRate: FxRate = {
  currency: 'EUR',
  date: '2026-01-15',
  rate: '1.0842',
  source: 'FRANKFURTER_ECB',
  isBusinessDay: true,
  ratedate: '2026-01-15',
};

export const mockCurrencies: CurrenciesResponse = {
  currencies: [
    { code: 'USD', name: 'US Dollar', source: 'BASE_USD', peggedToUsd: false },
    { code: 'EUR', name: 'Euro', source: 'FRANKFURTER_ECB', peggedToUsd: false },
    { code: 'USDT', name: 'Tether', source: 'HARDCODED_PEG', peggedToUsd: true, pegRatio: '1.0' },
  ],
  count: 3,
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
  source: 'CryptaScreen',
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
