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
  console.log(`  Quality: ${btcPrice.qualityScore}`);
  console.log(`  Fair value level: ${btcPrice.fairValueLevel}`);
  console.log(`  FX rate used: ${btcPrice.fxRate} (${btcPrice.fxSource})`);

  // Price by contract address (e.g., USDC on Ethereum)
  const usdcPrice = await client.prices.byContract({
    chain: 'ethereum',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    date: '2026-01-15',
    currency: 'USD',
  });
  console.log(`\nUSDC: $${usdcPrice.priceUsd} (close ${usdcPrice.closeFinal})`);

  // Batch pricing — up to 500 in one request
  const batch = await client.prices.batch({ symbols: ['BTC', 'ETH', 'SOL'], date: '2026-01-15', currency: 'EUR' });
  console.log(`\nBatch: ${Object.keys(batch).length} prices`);
  for (const [symbol, result] of Object.entries(batch)) {
    console.log(`  ${symbol}: ${result.price} ${result.currency}`);
  }

  // Point-in-time price (1-minute precision)
  const ethAtTime = await client.prices.at({
    symbol: 'ETH',
    timestamp: '2026-01-15T14:30:00Z',
    currency: 'USD',
  });
  console.log(`\nETH at 2026-01-15T14:30:00Z: $${ethAtTime.priceUsd} (${ethAtTime.precision})`);
}

main().catch(console.error);
