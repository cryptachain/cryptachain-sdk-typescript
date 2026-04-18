import type { Pagination } from './types/common';

/**
 * Generic async generator that handles cursor-based pagination.
 *
 * Automatically fetches subsequent pages until `hasMore` is false,
 * yielding each item as it arrives.
 *
 * @param fetchPage - Function that fetches a page given an optional cursor.
 *   Must return an object with an array of items and pagination metadata.
 * @returns An async generator yielding individual items across all pages.
 *
 * @example
 * ```ts
 * const allTransfers = paginate((cursor) =>
 *   client.wallets.getHistory('0x...', { chainId: 1, cursor })
 *     .then(res => ({ items: res.transfers, pagination: res.pagination }))
 * );
 *
 * for await (const transfer of allTransfers) {
 *   console.log(transfer.hash);
 * }
 * ```
 */
export async function* paginate<T>(
  fetchPage: (cursor?: string) => Promise<{ items: T[]; pagination: Pagination }>,
): AsyncGenerator<T, void, undefined> {
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    for (const item of page.items) {
      yield item;
    }
    cursor = page.pagination.hasMore ? page.pagination.cursor : undefined;
  } while (cursor);
}

/**
 * Collect all items from a paginated endpoint into a single array.
 *
 * **Warning**: This loads everything into memory. Use `paginate()` for
 * large datasets to process items incrementally.
 *
 * @param fetchPage - Function that fetches a page given an optional cursor.
 * @returns A promise resolving to all items across all pages.
 *
 * @example
 * ```ts
 * const allTransfers = await collectAll((cursor) =>
 *   client.wallets.getHistory('0x...', { chainId: 1, cursor })
 *     .then(res => ({ items: res.transfers, pagination: res.pagination }))
 * );
 * console.log(`Total: ${allTransfers.length}`);
 * ```
 */
export async function collectAll<T>(
  fetchPage: (cursor?: string) => Promise<{ items: T[]; pagination: Pagination }>,
): Promise<T[]> {
  const results: T[] = [];
  for await (const item of paginate(fetchPage)) {
    results.push(item);
  }
  return results;
}
