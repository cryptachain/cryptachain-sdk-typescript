import type { Address, DateTimeString } from './common';

/** Block data. */
export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: DateTimeString;
  miner: Address;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;
  transactionCount: number;
  chainId: number;
}

/** Transaction data. */
export interface Transaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: DateTimeString;
  from: Address;
  to?: Address;
  value: string;
  gasUsed: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: number;
  status: 'SUCCESS' | 'FAILED';
  input?: string;
  chainId: number;
  type?: number;
}

/** Transaction receipt. */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: Address;
  to?: Address;
  status: 'SUCCESS' | 'FAILED';
  gasUsed: string;
  effectiveGasPrice: string;
  cumulativeGasUsed: string;
  logs: Log[];
  contractAddress?: Address;
  chainId: number;
}

/** Internal transaction trace. */
export interface Trace {
  transactionHash: string;
  blockNumber: number;
  from: Address;
  to: Address;
  value: string;
  type: 'CALL' | 'CREATE' | 'DELEGATECALL' | 'STATICCALL' | 'SELFDESTRUCT';
  gas: string;
  gasUsed: string;
  input?: string;
  output?: string;
  error?: string;
  traceAddress: number[];
  chainId: number;
}

/** Event log. */
export interface Log {
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  address: Address;
  topics: string[];
  data: string;
  removed: boolean;
  chainId: number;
}

/** Parameters for fetching block data. */
export interface GetBlockParams {
  chainId: number;
  blockNumber: number;
}

/** Parameters for fetching transaction data. */
export interface GetTransactionParams {
  chainId: number;
  hash: string;
}

/** Parameters for fetching traces. */
export interface GetTracesParams {
  chainId: number;
  hash: string;
}

/** Parameters for fetching logs. */
export interface GetLogsParams {
  chainId: number;
  fromBlock: number;
  toBlock: number;
  address?: Address;
  topics?: (string | null)[];
}
