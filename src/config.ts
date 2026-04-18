/** Configuration options for the CryptaChain client. */
export interface CryptaChainConfig {
  /** Your CryptaChain API key. Required. */
  apiKey: string;
  /** Base URL of the API. @default 'https://api.cryptachain.com' */
  baseUrl?: string;
  /** API version prefix. @default 'v1' */
  version?: string;
  /** Request timeout in milliseconds. @default 30000 */
  timeout?: number;
  /** Maximum number of retries on transient errors. @default 3 */
  retries?: number;
  /** Base delay between retries in milliseconds (exponential backoff). @default 1000 */
  retryDelay?: number;
  /** Callback invoked when a 429 rate-limit response is received. */
  onRateLimit?: (retryAfter: number) => void;
}

/** Resolved configuration with all defaults applied. */
export interface ResolvedConfig {
  apiKey: string;
  baseUrl: string;
  version: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  onRateLimit?: (retryAfter: number) => void;
}

/** Apply defaults to user-supplied config. */
export function resolveConfig(config: CryptaChainConfig): ResolvedConfig {
  return {
    apiKey: config.apiKey,
    baseUrl: (config.baseUrl ?? 'https://api.cryptachain.com').replace(/\/+$/, ''),
    version: config.version ?? 'v1',
    timeout: config.timeout ?? 30_000,
    retries: config.retries ?? 3,
    retryDelay: config.retryDelay ?? 1_000,
    onRateLimit: config.onRateLimit,
  };
}
