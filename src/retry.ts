import {
  CryptaChainError,
  AuthenticationError,
  QuotaExceededError,
  RateLimitError,
} from './errors';

/** Options for the retry wrapper. */
export interface RetryOptions {
  /** Maximum number of retries. */
  retries: number;
  /** Base delay in ms (doubled on each attempt). */
  retryDelay: number;
  /** Optional callback when rate-limited. */
  onRateLimit?: (retryAfter: number) => void;
}

/**
 * Execute an async function with exponential backoff retry logic.
 *
 * - Never retries 401 (AuthenticationError) or 402 (QuotaExceededError).
 * - On 429 (RateLimitError), waits for the Retry-After period before retrying.
 * - On other transient errors, uses exponential backoff with jitter.
 *
 * @param fn - The async function to execute.
 * @param options - Retry configuration.
 * @returns The result of the function.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Never retry auth or quota errors
      if (error instanceof AuthenticationError || error instanceof QuotaExceededError) {
        throw error;
      }

      // Last attempt — don't retry
      if (attempt >= options.retries) {
        throw error;
      }

      // Rate limit: wait for Retry-After period
      if (error instanceof RateLimitError) {
        options.onRateLimit?.(error.retryAfter);
        await sleep(error.retryAfter * 1_000);
        continue;
      }

      // Exponential backoff with jitter for other errors
      const baseDelay = options.retryDelay * Math.pow(2, attempt);
      const jitter = Math.random() * baseDelay * 0.1;
      await sleep(baseDelay + jitter);
    }
  }

  // Should not reach here, but TypeScript needs it
  throw lastError ?? new CryptaChainError('Retry failed');
}

/** Promise-based sleep. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
