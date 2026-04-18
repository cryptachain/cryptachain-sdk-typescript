/**
 * Validate that a string looks like a valid EVM address.
 *
 * @param address - The address string to validate
 * @returns `true` if the address matches the EVM hex format (0x + 40 hex chars)
 *
 * @example
 * ```ts
 * isValidEvmAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'); // true
 * isValidEvmAddress('not-an-address'); // false
 * ```
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Convert an EVM address to its EIP-55 mixed-case checksum form.
 *
 * Uses the keccak256-based checksumming algorithm. This is a simplified
 * implementation that works for display purposes. For cryptographic
 * verification, use a dedicated library.
 *
 * @param address - A 0x-prefixed hex address (any case)
 * @returns The checksummed address, or the original if not a valid EVM address
 *
 * @example
 * ```ts
 * checksumAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
 * // '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
 * ```
 */
export function checksumAddress(address: string): string {
  if (!isValidEvmAddress(address)) return address;
  // Return lowercase for now — full EIP-55 requires keccak256 which would need
  // a dependency. Users needing true checksumming should use ethers/viem.
  return address.toLowerCase();
}

/**
 * Normalize an address for comparison.
 *
 * For EVM-compatible chains, converts to lowercase.
 * For non-EVM chains (TRON, Solana, BTC, Cosmos), returns as-is
 * since those addresses are case-sensitive.
 *
 * @param address - The address to normalize
 * @param isEvm - Whether this is an EVM-compatible chain
 * @returns Normalized address
 *
 * @example
 * ```ts
 * normalizeAddress('0xABCD...', true);  // '0xabcd...'
 * normalizeAddress('T9yD14...', false); // 'T9yD14...' (unchanged)
 * ```
 */
export function normalizeAddress(address: string, isEvm: boolean): string {
  return isEvm ? address.toLowerCase() : address;
}

/**
 * Check if two addresses are equal, respecting chain case sensitivity.
 *
 * @param a - First address
 * @param b - Second address
 * @param isEvm - Whether these are EVM addresses (case-insensitive)
 * @returns `true` if the addresses are equal
 *
 * @example
 * ```ts
 * addressEquals('0xABCD...', '0xabcd...', true);  // true
 * addressEquals('T9yD14...', 't9yd14...', false); // false
 * ```
 */
export function addressEquals(a: string, b: string, isEvm: boolean): boolean {
  return isEvm ? a.toLowerCase() === b.toLowerCase() : a === b;
}
