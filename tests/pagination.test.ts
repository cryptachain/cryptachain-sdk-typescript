import { describe, it, expect } from 'vitest';
import { paginate, collectAll } from '../src';

describe('paginate', () => {
  it('should yield all items across multiple pages', async () => {
    const pages = [
      { items: [1, 2, 3], pagination: { hasMore: true, cursor: 'page2' } },
      { items: [4, 5], pagination: { hasMore: true, cursor: 'page3' } },
      { items: [6], pagination: { hasMore: false } },
    ];
    let callIndex = 0;

    const items: number[] = [];
    for await (const item of paginate(async (_cursor) => {
      return pages[callIndex++];
    })) {
      items.push(item);
    }

    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(callIndex).toBe(3);
  });

  it('should handle single page', async () => {
    const items: string[] = [];
    for await (const item of paginate(async () => ({
      items: ['a', 'b'],
      pagination: { hasMore: false },
    }))) {
      items.push(item);
    }
    expect(items).toEqual(['a', 'b']);
  });

  it('should handle empty first page', async () => {
    const items: string[] = [];
    for await (const item of paginate(async () => ({
      items: [],
      pagination: { hasMore: false },
    }))) {
      items.push(item);
    }
    expect(items).toEqual([]);
  });
});

describe('collectAll', () => {
  it('should collect all items into an array', async () => {
    const pages = [
      { items: [1, 2], pagination: { hasMore: true, cursor: 'p2' } },
      { items: [3, 4], pagination: { hasMore: false } },
    ];
    let i = 0;

    const result = await collectAll(async () => pages[i++]);
    expect(result).toEqual([1, 2, 3, 4]);
  });
});
