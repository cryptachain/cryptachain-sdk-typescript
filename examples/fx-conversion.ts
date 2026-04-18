import { CryptaChain } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  // Single FX rate
  const rate = await client.fx.getRate({
    from: 'EUR',
    to: 'USD',
    date: '2026-01-15',
  });
  console.log(`EUR/USD on ${rate.date}: ${rate.rate}`);
  console.log(`  Source: ${rate.source}`);
  console.log(`  Business day: ${rate.isBusinessDay}`);

  // FX history for a month
  const history = await client.fx.getHistory({
    currency: 'EUR',
    from: '2026-01-01',
    to: '2026-01-31',
  });
  console.log(`\nEUR/USD history: ${history.rates.length} days`);
  const rates = history.rates.map((r) => parseFloat(r.rate));
  console.log(`  Min: ${Math.min(...rates).toFixed(4)}`);
  console.log(`  Max: ${Math.max(...rates).toFixed(4)}`);

  // IAS 21 monthly average (for financial statements)
  const avg = await client.fx.getMonthlyAverage({
    currency: 'EUR',
    year: 2026,
    month: 1,
  });
  console.log(`\nIAS 21 monthly average for Jan 2026:`);
  console.log(`  Rate: ${avg.averageRate}`);
  console.log(`  Business days: ${avg.businessDays}/${avg.daysInMonth}`);

  // List all supported currencies
  const { currencies, count } = await client.fx.listCurrencies();
  console.log(`\n${count} supported currencies:`);
  for (const c of currencies) {
    const peg = c.peggedToUsd ? ` (pegged ${c.pegRatio})` : '';
    console.log(`  ${c.code} — ${c.name} [${c.source}]${peg}`);
  }
}

main().catch(console.error);
