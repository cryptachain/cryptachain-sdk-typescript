import type { ApiErrorResponse, ChainNotServedResponse } from './types/common';

/**
 * Base error class for all CryptaChain SDK errors.
 */
export class CryptaChainError extends Error {
  /** HTTP status code, if applicable. */
  readonly status?: number;
  /** Raw API error response body, if available. */
  readonly response?: ApiErrorResponse;

  constructor(message: string, status?: number, response?: ApiErrorResponse) {
    super(message);
    this.name = 'CryptaChainError';
    this.status = status;
    this.response = response;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns 429 Too Many Requests.
 * Contains the `retryAfter` value in seconds from the Retry-After header.
 */
export class RateLimitError extends CryptaChainError {
  /** Seconds to wait before retrying. */
  readonly retryAfter: number;

  constructor(retryAfter: number, response?: ApiErrorResponse) {
    super(`Rate limited. Retry after ${retryAfter}s`, 429, response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns 401 Unauthorized.
 * Typically means the API key is missing or invalid.
 */
export class AuthenticationError extends CryptaChainError {
  constructor(message?: string, response?: ApiErrorResponse) {
    super(message ?? 'Authentication failed. Check your API key.', 401, response);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns 404 for a chain endpoint.
 */
export class ChainNotFoundError extends CryptaChainError {
  /** The chain ID that was not found. */
  readonly chainId?: number;

  constructor(chainId?: number, response?: ApiErrorResponse) {
    super(chainId ? `Chain ${chainId} not found` : 'Chain not found', 404, response);
    this.name = 'ChainNotFoundError';
    this.chainId = chainId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns 501 with `code: "CHAIN_NOT_SERVED"` — the chain is advertised
 * (it appears in `/chains-supported`, addresses validate against it) but has no indexed data
 * behind it, so the API refuses rather than answering.
 *
 * **This is not a "not found" and not an empty result.** It sits deliberately apart from
 * {@link ChainNotFoundError}: a 404 asserts the chain does not exist, which is false. And before
 * the API adopted this contract the same request produced an empty 200, which read as "this wallet
 * has no activity on this chain" — the same bytes, the opposite meaning.
 *
 * **Do not retry it.** 501 is permanent by definition here; nothing changes by waiting. See the
 * note on `withRetry` in `retry.ts`.
 *
 * @example
 * ```ts
 * try {
 *   await client.wallets.getBalances(addr, { chain: 'polygon' });
 * } catch (e) {
 *   if (e instanceof ChainNotServedError) {
 *     // Do NOT render this as "no assets". Offer e.servedChains instead.
 *     console.warn(`${e.chain} is not indexed. Try one of: ${e.servedChains.join(', ')}`);
 *   }
 * }
 * ```
 */
export class ChainNotServedError extends CryptaChainError {
  /** Slug the caller asked for, lowercased. */
  readonly chain: string;
  /** Numeric id of that chain. */
  readonly chainId: number;
  /** Slugs the API can actually serve. */
  readonly servedChains: readonly string[];

  constructor(response: ChainNotServedResponse) {
    super(response.message, 501, response);
    this.name = 'ChainNotServedError';
    this.chain = response.chain;
    this.chainId = response.chainId;
    this.servedChains = Object.freeze([...(response.servedChains ?? [])]);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns 402 Payment Required.
 * Indicates the API quota has been exceeded.
 */
export class QuotaExceededError extends CryptaChainError {
  constructor(message?: string, response?: ApiErrorResponse) {
    super(message ?? 'API quota exceeded. Upgrade your plan.', 402, response);
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
