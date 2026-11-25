# Changelog

## 0.1.2

0.1.1 called routes the API does not serve. Every request below is now checked against the API's own route list
(`tests/route-conformance.test.ts`; on 0.1.1 that test lists 12 unknown routes) and the price, FX and token calls are checked against bodies
recorded from the live routes.

Fixed (breaking where noted, because the old calls never worked):
- `prices.bySymbol` calls `GET /v1/prices/{symbol}/fair-value`; response type is the real body (`price`, `priceUsd`, `fxRate`, `fairValueLevel` as 1/2/3, `closeFinal`, ...).
- `prices.byContract` calls `GET /v1/prices/by-contract/{chain}/{address}/fair-value`; give `chain` (slug); `chainId` is still accepted for known chains.
- `prices.batch` is `GET /v1/prices/batch` (symbols, one date); it takes `{ symbols, date, currency? }` and returns a map symbol -> price. (breaking)
- `prices.at` calls `GET /v1/prices/{symbol}/at`.
- `tokens.getMetadata` calls `GET /v1/prices/tokens/{symbol}`; the type is the real record. (breaking)
- `fx.getMonthlyAverage` takes `month: 'YYYY-MM'`; the FX response types are the real bodies. (breaking)
- `health.getSystemStatus` calls `GET /v1/status`.
- `blockchain.*` call `/v1/chains/{chain}/...`; wallets and screening send `chain` (slug) instead of `chain_id`.
- `screening.screenAddress` / `screenBulk` use `POST` with `{address, chain}`; `screenBulk` returns an array.

Removed (the API has no such route): `wallets.getSummary`, `health.listChains`. Unsupported query parameters (`sort`, date filters, token filters) are no longer sent.

Not verified: the response shapes of wallets, blockchain, screening, status and methodology (no recorded fixtures for them); their routes are verified, their types are unchanged from 0.1.1.
