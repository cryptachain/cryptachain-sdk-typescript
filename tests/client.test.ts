import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CryptaChain, CryptaChainError, AuthenticationError, RateLimitError, QuotaExceededError } from '../src';
import { createMockFetch } from './mocks/responses';

describe('CryptaChain Client', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should throw if apiKey is empty', () => {
    expect(() => new CryptaChain({ apiKey: '' })).toThrow('apiKey is required');
  });

  it('should create client with default config', () => {
    const client = new CryptaChain({ apiKey: 'test-key' });
    expect(client.wallets).toBeDefined();
    expect(client.tokens).toBeDefined();
    expect(client.blockchain).toBeDefined();
    expect(client.prices).toBeDefined();
    expect(client.fx).toBeDefined();
    expect(client.screening).toBeDefined();
    expect(client.health).toBeDefined();
  });

  it('should set X-API-Key header on requests', async () => {
    const fetchSpy = vi.fn(createMockFetch({ status: 'ok' }));
    globalThis.fetch = fetchSpy;

    const client = new CryptaChain({ apiKey: 'my-secret-key' });
    await client.health.getSystemStatus();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers['X-API-Key']).toBe('my-secret-key');
  });

  it('should use custom baseUrl', async () => {
    const fetchSpy = vi.fn(createMockFetch({ status: 'ok' }));
    globalThis.fetch = fetchSpy;

    const client = new CryptaChain({
      apiKey: 'key',
      baseUrl: 'https://custom.api.com',
    });
    await client.health.getSystemStatus();

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain('https://custom.api.com/v1/');
  });

  it('should throw AuthenticationError on 401', async () => {
    globalThis.fetch = createMockFetch(
      { error: 'Unauthorized', message: 'Invalid API key', status: 401 },
      401,
    );

    const client = new CryptaChain({ apiKey: 'bad-key', retries: 0 });
    await expect(client.health.getSystemStatus()).rejects.toThrow(AuthenticationError);
  });

  it('should throw QuotaExceededError on 402', async () => {
    globalThis.fetch = createMockFetch(
      { error: 'Payment Required', message: 'Quota exceeded', status: 402 },
      402,
    );

    const client = new CryptaChain({ apiKey: 'key', retries: 0 });
    await expect(client.health.getSystemStatus()).rejects.toThrow(QuotaExceededError);
  });

  it('should throw RateLimitError on 429 with retryAfter', async () => {
    globalThis.fetch = createMockFetch(
      { error: 'Too Many Requests', message: 'Rate limited', status: 429 },
      429,
      { 'Retry-After': '30' },
    );

    const client = new CryptaChain({ apiKey: 'key', retries: 0 });
    try {
      await client.health.getSystemStatus();
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfter).toBe(30);
    }
  });

  it('should throw CryptaChainError on 500', async () => {
    globalThis.fetch = createMockFetch(
      { error: 'Internal Server Error', message: 'Something broke', status: 500 },
      500,
    );

    const client = new CryptaChain({ apiKey: 'key', retries: 0 });
    await expect(client.health.getSystemStatus()).rejects.toThrow(CryptaChainError);
  });

  it('should handle timeout via AbortController', async () => {
    globalThis.fetch = async (_url: string | URL | Request, init?: RequestInit) => {
      // Simulate a request that takes too long by waiting for abort
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }
      });
    };

    const client = new CryptaChain({ apiKey: 'key', timeout: 50, retries: 0 });
    await expect(client.health.getSystemStatus()).rejects.toThrow('timed out');
  });
});
