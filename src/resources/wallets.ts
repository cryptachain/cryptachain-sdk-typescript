import type { HttpClient } from '../client';
import type { Address } from '../types/common';
import type {
  Transfer,
  TransferHistoryResponse,
  TokenBalance,
  NativeBalance,
  WalletSummary,
  WalletHistoryParams,
  WalletBalancesParams,
  Erc20TransfersParams,
  NftTransfersParams,
  NativeTransfersParams,
} from '../types/wallet';
import { paginate } from '../pagination';

/**
 * Resource class for wallet-related API endpoints.
 *
 * Provides methods to query transfer history, token balances, and
 * wallet summaries across supported chains.
 */
export class WalletResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get paginated transfer history for a wallet address.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required), cursor, limit, sort, date/block filters
   * @returns Paginated transfer history
   *
   * @example
   * ```ts
   * const history = await client.wallets.getHistory('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', {
   *   chainId: 1,
   *   limit: 50,
   *   sort: 'desc',
   * });
   * console.log(`Found ${history.transfers.length} transfers`);
   * ```
   */
  async getHistory(address: Address, params: WalletHistoryParams): Promise<TransferHistoryResponse> {
    return this.http.get<TransferHistoryResponse>(`/wallets/${address}/transfers`, {
      chain_id: params.chainId,
      cursor: params.cursor,
      limit: params.limit,
      sort: params.sort,
      from_block: params.fromBlock,
      to_block: params.toBlock,
      from_date: params.fromDate,
      to_date: params.toDate,
    });
  }

  /**
   * Async generator that yields all transfers across all pages.
   *
   * Automatically handles cursor-based pagination. Use this to process
   * large transfer histories without loading everything into memory.
   *
   * @param address - Wallet address
   * @param params - Query parameters (same as getHistory, minus cursor)
   * @returns Async generator yielding individual Transfer objects
   *
   * @example
   * ```ts
   * let count = 0;
   * for await (const transfer of client.wallets.getAllTransfers('0x...', { chainId: 1 })) {
   *   count++;
   *   if (transfer.type === 'ERC20') {
   *     console.log(`ERC-20: ${transfer.tokenSymbol} ${transfer.value}`);
   *   }
   * }
   * console.log(`Total: ${count}`);
   * ```
   */
  getAllTransfers(address: Address, params: Omit<WalletHistoryParams, 'cursor'>): AsyncGenerator<Transfer> {
    return paginate((cursor) =>
      this.getHistory(address, { ...params, cursor }).then((res) => ({
        items: res.transfers,
        pagination: res.pagination,
      })),
    );
  }

  /**
   * Get token balances for a wallet address on a specific chain.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required)
   * @returns Array of token balances
   *
   * @example
   * ```ts
   * const balances = await client.wallets.getBalances('0x...', { chainId: 1 });
   * for (const token of balances) {
   *   console.log(`${token.tokenSymbol}: ${token.balance}`);
   * }
   * ```
   */
  async getBalances(address: Address, params: WalletBalancesParams): Promise<TokenBalance[]> {
    return this.http.get<TokenBalance[]>(`/wallets/${address}/balances`, {
      chain_id: params.chainId,
    });
  }

  /**
   * Get native token balance for a wallet address.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required)
   * @returns Native balance details
   *
   * @example
   * ```ts
   * const native = await client.wallets.getNativeBalance('0x...', { chainId: 1 });
   * console.log(`${native.symbol}: ${native.balance}`);
   * ```
   */
  async getNativeBalance(address: Address, params: WalletBalancesParams): Promise<NativeBalance> {
    return this.http.get<NativeBalance>(`/wallets/${address}/native-balance`, {
      chain_id: params.chainId,
    });
  }

  /**
   * Get ERC-20 token transfers for a wallet address.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required), optional tokenAddress filter
   * @returns Paginated ERC-20 transfer history
   *
   * @example
   * ```ts
   * const erc20 = await client.wallets.getErc20Transfers('0x...', {
   *   chainId: 1,
   *   tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
   * });
   * ```
   */
  async getErc20Transfers(address: Address, params: Erc20TransfersParams): Promise<TransferHistoryResponse> {
    return this.http.get<TransferHistoryResponse>(`/wallets/${address}/erc20-transfers`, {
      chain_id: params.chainId,
      cursor: params.cursor,
      limit: params.limit,
      sort: params.sort,
      token_address: params.tokenAddress,
      from_block: params.fromBlock,
      to_block: params.toBlock,
      from_date: params.fromDate,
      to_date: params.toDate,
    });
  }

  /**
   * Get NFT transfers for a wallet address.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required), optional tokenAddress and tokenId filters
   * @returns Paginated NFT transfer history
   *
   * @example
   * ```ts
   * const nfts = await client.wallets.getNftTransfers('0x...', { chainId: 1 });
   * ```
   */
  async getNftTransfers(address: Address, params: NftTransfersParams): Promise<TransferHistoryResponse> {
    return this.http.get<TransferHistoryResponse>(`/wallets/${address}/nft-transfers`, {
      chain_id: params.chainId,
      cursor: params.cursor,
      limit: params.limit,
      sort: params.sort,
      token_address: params.tokenAddress,
      token_id: params.tokenId,
      from_block: params.fromBlock,
      to_block: params.toBlock,
      from_date: params.fromDate,
      to_date: params.toDate,
    });
  }

  /**
   * Get native token transfers for a wallet address.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required)
   * @returns Paginated native transfer history
   *
   * @example
   * ```ts
   * const native = await client.wallets.getNativeTransfers('0x...', { chainId: 1 });
   * ```
   */
  async getNativeTransfers(address: Address, params: NativeTransfersParams): Promise<TransferHistoryResponse> {
    return this.http.get<TransferHistoryResponse>(`/wallets/${address}/native-transfers`, {
      chain_id: params.chainId,
      cursor: params.cursor,
      limit: params.limit,
      sort: params.sort,
      from_block: params.fromBlock,
      to_block: params.toBlock,
      from_date: params.fromDate,
      to_date: params.toDate,
    });
  }

  /**
   * Get a summary overview for a wallet address on a specific chain.
   *
   * @param address - Wallet address
   * @param params - Query parameters including chainId (required)
   * @returns Wallet summary with transaction counts and balance overview
   *
   * @example
   * ```ts
   * const summary = await client.wallets.getSummary('0x...', { chainId: 1 });
   * console.log(`Total txs: ${summary.totalTransactions}`);
   * ```
   */
  async getSummary(address: Address, params: WalletBalancesParams): Promise<WalletSummary> {
    return this.http.get<WalletSummary>(`/wallets/${address}/summary`, {
      chain_id: params.chainId,
    });
  }
}
