import type { Address, DateTimeString, Pagination, SortDirection } from './common';

/** A single token transfer event. */
export interface Transfer {
  hash: string;
  blockNumber: number;
  timestamp: DateTimeString;
  from: Address;
  to: Address;
  value: string;
  tokenAddress?: Address;
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenName?: string;
  type: TransferType;
  chainId: number;
  logIndex?: number;
  gasUsed?: string;
  gasPrice?: string;
  status: 'SUCCESS' | 'FAILED';
}

/** Transfer type classification. */
export type TransferType =
  | 'NATIVE'
  | 'ERC20'
  | 'ERC721'
  | 'ERC1155'
  | 'INTERNAL';

/** Token balance for a wallet. */
export interface TokenBalance {
  tokenAddress: Address;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  balance: string;
  chainId: number;
  /** USD value if available. */
  valueUsd?: string;
}

/** Native balance for a wallet. */
export interface NativeBalance {
  address: Address;
  chainId: number;
  balance: string;
  symbol: string;
  decimals: number;
  valueUsd?: string;
}

/** Wallet address summary. */
export interface WalletSummary {
  address: Address;
  chainId: number;
  firstTransactionAt?: DateTimeString;
  lastTransactionAt?: DateTimeString;
  totalTransactions: number;
  totalTokenTransfers: number;
  totalNftTransfers: number;
  nativeBalance: string;
  tokenCount: number;
  nftCount: number;
}

/** Transfer history response. */
export interface TransferHistoryResponse {
  transfers: Transfer[];
  pagination: Pagination;
}

/** Parameters for fetching wallet transfer history. */
export interface WalletHistoryParams {
  chainId: number;
  cursor?: string;
  limit?: number;
  sort?: SortDirection;
  fromBlock?: number;
  toBlock?: number;
  fromDate?: string;
  toDate?: string;
}

/** Parameters for fetching wallet balances. */
export interface WalletBalancesParams {
  chainId: number;
}

/** Parameters for fetching ERC-20 transfers. */
export interface Erc20TransfersParams extends WalletHistoryParams {
  tokenAddress?: Address;
}

/** Parameters for fetching NFT transfers. */
export interface NftTransfersParams extends WalletHistoryParams {
  tokenAddress?: Address;
  tokenId?: string;
}

/** Parameters for fetching native transfers. */
export interface NativeTransfersParams extends WalletHistoryParams {}
