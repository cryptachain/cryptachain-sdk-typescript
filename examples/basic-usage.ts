import { CryptaChain } from '@cryptachain/sdk';

async function main() {
  // Initialize the client with your API key
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
    // Optional configuration:
    // baseUrl: 'https://api.cryptachain.com',
    // timeout: 30000,
    // retries: 3,
    // onRateLimit: (retryAfter) => console.log(`Rate limited, retry in ${retryAfter}s`),
  });

  // Check system health
  const status = await client.health.getSystemStatus();
  console.log(`System status: ${status.status}`);

  // List supported chains
  const chains = await client.health.listChains();
  console.log(`${chains.length} chains supported`);

  // Get a BTC price
  const price = await client.prices.bySymbol({
    symbol: 'BTC',
    date: '2026-01-15',
    currency: 'EUR',
  });
  console.log(`BTC: ${price.price} ${price.currency} (${price.source})`);

  // Get an FX rate
  const fxRate = await client.fx.getRate({
    from: 'EUR',
    to: 'USD',
    date: '2026-01-15',
  });
  console.log(`EUR/USD: ${fxRate.rate}`);
}

main().catch(console.error);
