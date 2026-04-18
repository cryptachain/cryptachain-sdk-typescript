/**
 * Convert a value in the smallest unit (e.g. wei) to the human-readable
 * unit (e.g. ETH) given the number of decimals.
 *
 * Uses string-based arithmetic to avoid floating-point precision issues
 * with large numbers.
 *
 * @param value - Value in smallest unit as a string (e.g. '1000000000000000000')
 * @param decimals - Number of decimal places (e.g. 18 for ETH, 6 for USDC)
 * @returns Formatted string with decimal point (e.g. '1.0')
 *
 * @example
 * ```ts
 * fromSmallestUnit('1000000000000000000', 18); // '1.0'
 * fromSmallestUnit('1500000', 6);               // '1.5'
 * fromSmallestUnit('100', 2);                   // '1.0'
 * fromSmallestUnit('1', 18);                    // '0.000000000000000001'
 * ```
 */
export function fromSmallestUnit(value: string, decimals: number): string {
  if (decimals === 0) return value;

  const isNegative = value.startsWith('-');
  let abs = isNegative ? value.slice(1) : value;

  // Pad with leading zeros if shorter than decimals
  while (abs.length <= decimals) {
    abs = '0' + abs;
  }

  const integerPart = abs.slice(0, abs.length - decimals);
  const fractionalPart = abs.slice(abs.length - decimals);

  // Remove trailing zeros from fractional part, keep at least one
  const trimmed = fractionalPart.replace(/0+$/, '') || '0';

  const result = `${integerPart}.${trimmed}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Convert a human-readable value to the smallest unit string.
 *
 * @param value - Value with decimal point (e.g. '1.5')
 * @param decimals - Number of decimal places (e.g. 18 for ETH, 6 for USDC)
 * @returns Value in smallest unit as a string
 *
 * @example
 * ```ts
 * toSmallestUnit('1.0', 18);  // '1000000000000000000'
 * toSmallestUnit('1.5', 6);   // '1500000'
 * toSmallestUnit('0.1', 18);  // '100000000000000000'
 * ```
 */
export function toSmallestUnit(value: string, decimals: number): string {
  if (decimals === 0) return value.split('.')[0];

  const isNegative = value.startsWith('-');
  const abs = isNegative ? value.slice(1) : value;

  const [intPart, fracPart = ''] = abs.split('.');

  // Truncate or pad fractional part to match decimals
  const padded = fracPart.padEnd(decimals, '0').slice(0, decimals);
  const raw = intPart + padded;

  // Remove leading zeros
  const result = raw.replace(/^0+/, '') || '0';
  return isNegative ? `-${result}` : result;
}

/**
 * Shorthand: convert wei to ETH (18 decimals).
 *
 * @param wei - Value in wei
 * @returns Value in ETH
 *
 * @example
 * ```ts
 * weiToEth('1000000000000000000'); // '1.0'
 * weiToEth('500000000000000000');  // '0.5'
 * ```
 */
export function weiToEth(wei: string): string {
  return fromSmallestUnit(wei, 18);
}

/**
 * Shorthand: convert ETH to wei (18 decimals).
 *
 * @param eth - Value in ETH
 * @returns Value in wei
 *
 * @example
 * ```ts
 * ethToWei('1.0'); // '1000000000000000000'
 * ethToWei('0.5'); // '500000000000000000'
 * ```
 */
export function ethToWei(eth: string): string {
  return toSmallestUnit(eth, 18);
}

/**
 * Format a number string with thousands separators.
 *
 * @param value - Numeric string
 * @param separator - Separator character (default: ',')
 * @returns Formatted string
 *
 * @example
 * ```ts
 * formatWithSeparators('1234567.89'); // '1,234,567.89'
 * ```
 */
export function formatWithSeparators(value: string, separator = ','): string {
  const [intPart, fracPart] = value.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fracPart !== undefined ? `${formatted}.${fracPart}` : formatted;
}
