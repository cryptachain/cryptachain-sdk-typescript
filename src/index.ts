// Main client
export { CryptaChain, HttpClient } from './client';
export type { CryptaChainConfig } from './config';

// Error classes
export {
  CryptaChainError,
  RateLimitError,
  AuthenticationError,
  ChainNotFoundError,
  ChainNotServedError,
  QuotaExceededError,
} from './errors';

// CHAIN_NOT_SERVED marker + narrowing helper. Exported as values (not types) because callers
// need them at runtime to distinguish a refusal from an empty result.
export { CHAIN_NOT_SERVED, isChainNotServedResponse } from './types/common';

// Pagination helpers
export { paginate, collectAll } from './pagination';

// Resource classes
export { WalletResource } from './resources/wallets';
export { TokenResource } from './resources/tokens';
export { BlockchainResource } from './resources/blockchain';
export { PriceResource } from './resources/prices';
export { FxResource } from './resources/fx';
export { ScreeningResource } from './resources/screening';
export { HealthResource } from './resources/health';

// All types
export type {
  // Common
  Pagination,
  PaginatedResponse,
  Chain,
  Address,
  DateString,
  DateTimeString,
  ApiErrorResponse,
  ChainNotServedCode,
  ChainNotServedResponse,
  SortDirection,
  ListParams,
  // Wallet
  Transfer,
  TransferType,
  TokenBalance,
  NativeBalance,
  WalletSummary,
  TransferHistoryResponse,
  WalletHistoryParams,
  WalletBalancesParams,
  Erc20TransfersParams,
  NftTransfersParams,
  NativeTransfersParams,
  // Token
  TokenMetadata,
  // Blockchain
  Block,
  Transaction,
  TransactionReceipt,
  Trace,
  Log,
  GetBlockParams,
  GetTransactionParams,
  GetTracesParams,
  GetLogsParams,
  // Screening
  RiskLevel,
  SanctionsMatch,
  ScreeningResult,
  BulkScreeningRequest,
  BulkScreeningResponse,
  ScreenAddressParams,
  // Price
  FxRateSourceCode,
  CloseFinal,
  PriceSource,
  FairValueLevel,
  PriceResponse,
  PriceBatchRequest,
  PriceBatchResponse,
  PriceAtResponse,
  PriceBySymbolParams,
  PriceByContractParams,
  PriceAtParams,
  // FX
  FxRateSource,
  FxRate,
  FxHistoryResponse,
  FxMonthlyAverageResponse,
  FxHistoryPoint,
  CurrenciesResponse,
  FxRateParams,
  FxHistoryParams,
  FxMonthlyAverageParams,
  // Health
  SystemStatus,
  ServiceStatus,
  ChainStatus,
  ChainStatusResponse,
  MethodologyResponse,
} from './types';

// Utility functions
export {
  isValidEvmAddress,
  checksumAddress,
  normalizeAddress,
  addressEquals,
} from './utils/address';
export { chainIdToSlug, slugToChainId, isEvmChain } from './utils/chain';
export {
  fromSmallestUnit,
  toSmallestUnit,
  weiToEth,
  ethToWei,
  formatWithSeparators,
} from './utils/format';
