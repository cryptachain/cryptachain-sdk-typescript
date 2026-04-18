import { CryptaChain } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  // Screen a single address
  const result = await client.screening.screenAddress({
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    chainId: 1,
  });

  console.log(`Address: ${result.address}`);
  console.log(`Risk level: ${result.riskLevel}`);
  console.log(`Risk score: ${result.riskScore}`);
  console.log(`Sanctioned: ${result.isSanctioned}`);

  if (result.labels.length > 0) {
    console.log(`Labels: ${result.labels.join(', ')}`);
  }

  if (result.sanctionsMatches.length > 0) {
    console.log(`\nSanctions matches:`);
    for (const match of result.sanctionsMatches) {
      console.log(`  ${match.listName}: ${match.entityName} (score: ${match.matchScore})`);
    }
  }

  // Bulk screening
  const bulk = await client.screening.screenBulk({
    addresses: [
      { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', chainId: 1 },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chainId: 1 },
    ],
  });

  console.log(`\nBulk screening: ${bulk.results.length} results, ${bulk.errors.length} errors`);
  for (const r of bulk.results) {
    console.log(`  ${r.address}: ${r.riskLevel} (score: ${r.riskScore})`);
  }
}

main().catch(console.error);
