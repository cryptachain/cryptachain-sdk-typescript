import type { HttpClient } from '../client';
import { resolveChainSlug } from '../utils/chain';
import type {
  Block,
  Transaction,
  TransactionReceipt,
  Trace,
  Log,
  GetBlockParams,
  GetTransactionParams,
  GetTracesParams,
  GetLogsParams,
} from '../types/blockchain';

/**
 * Resource class for low-level blockchain data endpoints.
 *
 * Provides access to blocks, transactions, receipts, traces, and event logs.
 */
export class BlockchainResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get block data by chain ID and block number.
   *
   * @param params - Chain ID and block number
   * @returns Block data including hash, timestamp, gas info, and transaction count
   *
   * @example
   * ```ts
   * const block = await client.blockchain.getBlock({ chainId: 1, blockNumber: 19000000 });
   * console.log(`Block ${block.number} mined at ${block.timestamp}`);
   * ```
   */
  async getBlock(params: GetBlockParams): Promise<Block> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<Block>(`/chains/${encodeURIComponent(chain)}/blocks/${encodeURIComponent(String(params.blockNumber))}`);
  }

  /**
   * Get transaction data by chain ID and transaction hash.
   *
   * @param params - Chain ID and transaction hash
   * @returns Full transaction data
   *
   * @example
   * ```ts
   * const tx = await client.blockchain.getTransaction({
   *   chainId: 1,
   *   hash: '0xabc...',
   * });
   * console.log(`From: ${tx.from}, Value: ${tx.value}`);
   * ```
   */
  async getTransaction(params: GetTransactionParams): Promise<Transaction> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<Transaction>(`/chains/${encodeURIComponent(chain)}/transactions/${encodeURIComponent(params.hash)}`);
  }

  /**
   * Get a transaction receipt by chain ID and transaction hash.
   *
   * @param params - Chain ID and transaction hash
   * @returns Receipt with status, gas used, and event logs
   *
   * @example
   * ```ts
   * const receipt = await client.blockchain.getReceipt({
   *   chainId: 1,
   *   hash: '0xabc...',
   * });
   * console.log(`Status: ${receipt.status}, Logs: ${receipt.logs.length}`);
   * ```
   */
  async getReceipt(params: GetTransactionParams): Promise<TransactionReceipt> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<TransactionReceipt>(`/chains/${encodeURIComponent(chain)}/transactions/${encodeURIComponent(params.hash)}/receipt`);
  }

  /**
   * Get internal transaction traces (call tree) for a transaction.
   *
   * @param params - Chain ID and transaction hash
   * @returns Array of trace entries
   *
   * @example
   * ```ts
   * const traces = await client.blockchain.getTraces({
   *   chainId: 1,
   *   hash: '0xabc...',
   * });
   * for (const trace of traces) {
   *   console.log(`${trace.type}: ${trace.from} -> ${trace.to} (${trace.value})`);
   * }
   * ```
   */
  async getTraces(params: GetTracesParams): Promise<Trace[]> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<Trace[]>(`/chains/${encodeURIComponent(chain)}/transactions/${encodeURIComponent(params.hash)}/traces`);
  }

  /**
   * Get event logs for a block range, optionally filtered by address and topics.
   *
   * @param params - Chain ID, block range, optional address and topic filters
   * @returns Array of event logs
   *
   * @example
   * ```ts
   * const logs = await client.blockchain.getLogs({
   *   chainId: 1,
   *   fromBlock: 19000000,
   *   toBlock: 19000100,
   *   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
   * });
   * ```
   */
  async getLogs(params: GetLogsParams): Promise<Log[]> {
    const chain = resolveChainSlug(params.chain, params.chainId);
    return this.http.get<Log[]>(`/chains/${encodeURIComponent(chain)}/logs`, {
      from_block: params.fromBlock,
      to_block: params.toBlock,
      address: params.address,
      topics: params.topics ? params.topics.join(',') : undefined,
    });
  }
}
