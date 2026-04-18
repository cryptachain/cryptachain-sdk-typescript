/** Well-known chain ID to slug mapping. */
const CHAIN_MAP: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  56: 'bsc',
  100: 'gnosis',
  137: 'polygon',
  250: 'fantom',
  324: 'zksync',
  8453: 'base',
  42161: 'arbitrum',
  42220: 'celo',
  43114: 'avalanche',
  59144: 'linea',
  534352: 'scroll',
  7777777: 'zora',
};

/** Reverse mapping: slug to chain ID. */
const SLUG_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(CHAIN_MAP).map(([id, slug]) => [slug, Number(id)]),
);

/**
 * Convert a chain ID to its human-readable slug.
 *
 * @param chainId - Numeric chain ID
 * @returns Chain slug (e.g. 'ethereum'), or `undefined` if not in the built-in map
 *
 * @example
 * ```ts
 * chainIdToSlug(1);     // 'ethereum'
 * chainIdToSlug(137);   // 'polygon'
 * chainIdToSlug(99999); // undefined
 * ```
 */
export function chainIdToSlug(chainId: number): string | undefined {
  return CHAIN_MAP[chainId];
}

/**
 * Convert a chain slug to its numeric chain ID.
 *
 * @param slug - Chain slug (e.g. 'ethereum', 'polygon')
 * @returns Numeric chain ID, or `undefined` if not in the built-in map
 *
 * @example
 * ```ts
 * slugToChainId('ethereum'); // 1
 * slugToChainId('polygon');  // 137
 * slugToChainId('unknown');  // undefined
 * ```
 */
export function slugToChainId(slug: string): number | undefined {
  return SLUG_MAP[slug.toLowerCase()];
}

/**
 * Check if a chain ID is an EVM-compatible chain.
 *
 * This is a heuristic based on the built-in chain map. For chains not in the
 * map, this returns `true` as most supported chains are EVM-compatible.
 *
 * @param chainId - Numeric chain ID
 * @returns `true` if the chain is (likely) EVM-compatible
 *
 * @example
 * ```ts
 * isEvmChain(1);   // true
 * isEvmChain(137); // true
 * ```
 */
export function isEvmChain(chainId: number): boolean {
  // All chains in our built-in map are EVM
  // Non-EVM chains (TRON, Solana, BTC, Cosmos) use different ID schemes
  return chainId > 0;
}
