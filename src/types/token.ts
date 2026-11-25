/** Token record of `GET /v1/prices/tokens/{symbol}` and `GET /v1/prices/tokens` (recorded from the live route). */
export interface TokenMetadata {
  tokenId: number;
  symbol: string;
  name: string;
  /** Registry category, for example LAYER1, STABLECOIN, DEFI. */
  category: string | null;
  previousSymbols: string[] | null;
  isActive: boolean;
  isDelisted: boolean;
  coingeckoId: string | null;
}
