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
}

/** Sorting direction. */
export type SortDirection = 'asc' | 'desc';

/** Common query parameters for list endpoints. */
export interface ListParams {
  cursor?: string;
  limit?: number;
  sort?: SortDirection;
}
