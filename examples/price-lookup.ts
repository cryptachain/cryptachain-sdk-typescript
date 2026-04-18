import { CryptaChain } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  // Price by symbol
  const btcPrice = await client.prices.bySymbol({
    symbol: 'BTC',
    date: '2026-01-15',
    currency: 'EUR',
  });
  console.log(`BTC: ${btcPrice.price} EUR`);
  console.log(`  Source: ${btcPrice.source}`);
  console.log(`  Quality: ${btcPrice.qualityScore}`);
  console.log(`  Fair value level: ${btcPrice.fairValueLevel}`);
  console.log(`  FX rate used: ${btcPrice.fxRate} (${btcPrice.fxSource})`);

  // Price by contract address (e.g., USDC on Ethereum)
  const usdcPrice = await client.prices.byContract({
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    date: '2026-01-15',
    currency: 'USD',
  });
  console.log(`\nUSDC: $${usdcPrice.priceUsd} (stablecoin: ${usdcPrice.stablecoinPegged})`);

  // Batch pricing — up to 500 in one request
  const batch = await client.prices.batch({
    requests: [
      { symbol: 'BTC', date: '2026-01-15', currency: 'EUR' },
      { symbol: 'ETH', date: '2026-01-15', currency: 'EUR' },
      { symbol: 'SOL', date: '2026-01-15', currency: 'EUR' },
      { chainId: 1, contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', date: '2026-01-15' },
    ],
  });
  console.log(`\nBatch: ${batch.results.length} prices, ${batch.errors.length} errors`);
  for (const result of batch.results) {
    console.log(`  ${result.symbol}: ${result.price} ${result.currency}`);
  }

  // Point-in-time price (1-minute precision)
  const ethAtTime = await client.prices.at({
    symbol: 'ETH',
    timestamp: '2026-01-15T14:30:00Z',
    currency: 'USD',
  });
  console.log(`\nETH at ${ethAtTime.timestamp}: $${ethAtTime.priceUsd}`);
}

main().catch(console.error);
