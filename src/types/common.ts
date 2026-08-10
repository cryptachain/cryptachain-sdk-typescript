/** Pagination metadata returned by list endpoints. */
export interface Pagination {
  hasMore: boolean;
  cursor?: string;
  total?: number;
}

/** Paginated response wrapper. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/** Supported chain identifier. */
export interface Chain {
  chainId: number;
  name: string;
  slug: string;
  nativeSymbol: string;
  explorerUrl?: string;
  isTestnet: boolean;
  isEvm: boolean;
}

/** Blockchain address string. */
export type Address = string;

/** ISO 8601 date string (YYYY-MM-DD). */
export type DateString = string;

/** ISO 8601 datetime string. */
export type DateTimeString = string;

/** API error response body. */
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
  /**
   * Stable machine-readable marker, present on error bodies that carry one.
   *
   * Distinct from `error`, which for most responses is the HTTP reason phrase and therefore not
   * stable enough to branch on. Where both are present they agree.
   */
  code?: string;
}

/**
 * The marker the API sends when a chain is advertised but not indexed.
 *
 * Branch on this, never on the 501 alone: the API answers 501 for several unrelated reasons
 * (`/approvals` and `/defi-positions` are reserved routes that are also 501), so the status code
 * cannot tell a caller *which* unimplemented thing it hit.
 */
export const CHAIN_NOT_SERVED = 'CHAIN_NOT_SERVED';

/** Literal type of {@link CHAIN_NOT_SERVED}. */
export type ChainNotServedCode = typeof CHAIN_NOT_SERVED;

/**
 * Body of a 501 refusal for an advertised-but-unindexed chain.
 *
 * This is a *refusal to answer*, not an empty result. Before the API adopted it, these chains
 * returned an empty 200 — indistinguishable from "this wallet has no activity on this chain".
 * Treating this as an absence of activity is the specific mistake the type exists to prevent.
 */
export interface ChainNotServedResponse extends ApiErrorResponse {
  status: 501;
  error: ChainNotServedCode;
  code: ChainNotServedCode;
  /** The chain slug the caller asked for, lowercased. */
  chain: string;
  /** Numeric id of that chain. */
  chainId: number;
  /** Slugs the API *can* serve — use these to offer the caller a valid alternative. */
  servedChains: string[];
}

/** Narrows an unknown error body to a {@link ChainNotServedResponse}. */
export function isChainNotServedResponse(
  body: ApiErrorResponse | undefined,
): body is ChainNotServedResponse {
  return body?.code === CHAIN_NOT_SERVED;
}

/** Sorting direction. */
export type SortDirection = 'asc' | 'desc';

/** Common query parameters for list endpoints. */
export interface ListParams {
  cursor?: string;
  limit?: number;
  sort?: SortDirection;
}
