# @cryptachain/sdk

Official TypeScript SDK for the [CryptaChain API](https://docs.cryptachain.com) — blockchain data, pricing, FX rates, and address screening.

- Zero external runtime dependencies (uses native `fetch`)
- Node.js 18+ and browser compatible
- ESM + CJS dual output
- Full TypeScript types
- Automatic pagination, retry with exponential backoff, and rate limit handling

## Installation

```bash
npm install @cryptachain/sdk
```

```bash
yarn add @cryptachain/sdk
```

```bash
pnpm add @cryptachain/sdk
```

## Quick Start

```typescript
import { CryptaChain } from '@cryptachain/sdk';

const client = new CryptaChain({
  apiKey: 'your-api-key',
});

// Get a BTC price
const price = await client.prices.bySymbol({
  symbol: 'BTC',
  date: '2026-01-15',
  currency: 'EUR',
});
console.log(`BTC: ${price.price} EUR`);

// Get wallet balances
const balances = await client.wallets.getBalances(
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  { chainId: 1 },
);

// Screen an address
const screen = await client.screening.screenAddress({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  chainId: 1,
});
console.log(`Risk: ${screen.riskLevel}`);
```

## Configuration

```typescript
const client = new CryptaChain({
  apiKey: 'your-api-key',       // Required
  baseUrl: 'https://api.cryptachain.com', // Default
  version: 'v1',                // Default
  timeout: 30000,               // Request timeout in ms (default: 30s)
  retries: 3,                   // Max retries on transient errors (default: 3)
  retryDelay: 1000,             // Base retry delay in ms (default: 1s)
  onRateLimit: (retryAfter) => {
    console.log(`Rate limited, retrying in ${retryAfter}s`);
  },
});
```

## API Reference

### Prices

```typescript
// By ticker symbol
const price = await client.prices.bySymbol({ symbol: 'ETH', date: '2026-01-15', currency: 'EUR' });

// By contract address
const price = await client.prices.byContract({
  chainId: 1,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  date: '2026-01-15',
});

// Batch (up to 500)
const batch = await client.prices.batch({
  requests: [
    { symbol: 'BTC', date: '2026-01-15' },
    { symbol: 'ETH', date: '2026-01-15' },
  ],
});

// Point-in-time (1-minute precision)
const price = await client.prices.at({ symbol: 'ETH', timestamp: '2026-01-15T14:30:00Z' });
```

### FX Rates

```typescript
// Single rate
const rate = await client.fx.getRate({ from: 'EUR', to: 'USD', date: '2026-01-15' });

// Daily history
const history = await client.fx.getHistory({ currency: 'EUR', from: '2026-01-01', to: '2026-01-31' });

// IAS 21 monthly average
const avg = await client.fx.getMonthlyAverage({ currency: 'EUR', year: 2026, month: 1 });

// List all 36 supported currencies
const { currencies } = await client.fx.listCurrencies();
```

### Wallets

```typescript
// Transfer history (single page)
const page = await client.wallets.getHistory('0x...', { chainId: 1, limit: 50, sort: 'desc' });

// Auto-paginate all transfers (async generator)
for await (const transfer of client.wallets.getAllTransfers('0x...', { chainId: 1 })) {
  console.log(transfer.hash);
}

// Token balances
const balances = await client.wallets.getBalances('0x...', { chainId: 1 });

// Native balance
const native = await client.wallets.getNativeBalance('0x...', { chainId: 1 });

// ERC-20 / NFT / native transfers
const erc20 = await client.wallets.getErc20Transfers('0x...', { chainId: 1 });
const nfts = await client.wallets.getNftTransfers('0x...', { chainId: 1 });
const native = await client.wallets.getNativeTransfers('0x...', { chainId: 1 });

// Wallet summary
const summary = await client.wallets.getSummary('0x...', { chainId: 1 });
```

### Screening

```typescript
// Single address
const result = await client.screening.screenAddress({ address: '0x...', chainId: 1 });
console.log(`Risk: ${result.riskLevel}, Sanctioned: ${result.isSanctioned}`);

// Bulk screening
const bulk = await client.screening.screenBulk({
  addresses: [
    { address: '0xabc...', chainId: 1 },
    { address: '0xdef...', chainId: 137 },
  ],
});
```

### Blockchain

```typescript
const block = await client.blockchain.getBlock({ chainId: 1, blockNumber: 19000000 });
const tx = await client.blockchain.getTransaction({ chainId: 1, hash: '0x...' });
const receipt = await client.blockchain.getReceipt({ chainId: 1, hash: '0x...' });
const traces = await client.blockchain.getTraces({ chainId: 1, hash: '0x...' });
const logs = await client.blockchain.getLogs({ chainId: 1, fromBlock: 19000000, toBlock: 19000100 });
```

### Tokens

```typescript
const token = await client.tokens.getMetadata('USDC');
console.log(`${token.name}: ${token.decimals} decimals`);
```

### Health & Status

```typescript
const status = await client.health.getSystemStatus();
const chains = await client.health.getChainStatus();
const allChains = await client.health.listChains();
const methodology = await client.health.getMethodology();
```

## Pagination

The SDK provides three approaches for paginated endpoints:

```typescript
// 1. Manual pagination
let cursor: string | undefined;
do {
  const page = await client.wallets.getHistory('0x...', { chainId: 1, cursor });
  process.stdout.write(`Page with ${page.transfers.length} items\n`);
  cursor = page.pagination.hasMore ? page.pagination.cursor : undefined;
} while (cursor);

// 2. Built-in async generator (recommended for large datasets)
for await (const tx of client.wallets.getAllTransfers('0x...', { chainId: 1 })) {
  // Processes one transfer at a time, auto-fetches next pages
}

// 3. Collect all into array (convenience, loads into memory)
import { collectAll } from '@cryptachain/sdk';
const all = await collectAll((cursor) =>
  client.wallets.getHistory('0x...', { chainId: 1, cursor })
    .then(res => ({ items: res.transfers, pagination: res.pagination }))
);
```

## Error Handling

```typescript
import {
  CryptaChainError,
  AuthenticationError,
  RateLimitError,
  QuotaExceededError,
  ChainNotFoundError,
} from '@cryptachain/sdk';

try {
  const price = await client.prices.bySymbol({ symbol: 'BTC', date: '2026-01-15' });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof QuotaExceededError) {
    console.error('Upgrade your plan');
  } else if (err instanceof ChainNotFoundError) {
    console.error('Chain not supported');
  } else if (err instanceof CryptaChainError) {
    console.error(`API error ${err.status}: ${err.message}`);
  }
}
```

## Utilities

```typescript
import {
  weiToEth,
  ethToWei,
  fromSmallestUnit,
  toSmallestUnit,
  isValidEvmAddress,
  normalizeAddress,
  chainIdToSlug,
  slugToChainId,
  formatWithSeparators,
} from '@cryptachain/sdk';

weiToEth('1000000000000000000');     // '1.0'
ethToWei('1.5');                      // '1500000000000000000'
fromSmallestUnit('1500000', 6);       // '1.5' (USDC)
isValidEvmAddress('0xd8dA...');       // true
chainIdToSlug(137);                   // 'polygon'
formatWithSeparators('1234567.89');   // '1,234,567.89'
```

## License

MIT
