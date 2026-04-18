import { CryptaChain, weiToEth } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  // Get a single page of transfer history
  const page = await client.wallets.getHistory(address, {
    chainId: 1,
    limit: 10,
    sort: 'desc',
  });

  console.log(`Showing ${page.transfers.length} of ${page.pagination.total ?? '?'} transfers\n`);

  for (const tx of page.transfers) {
    const value = tx.type === 'NATIVE' ? weiToEth(tx.value) + ' ETH' : tx.value;
    console.log(`[${tx.timestamp}] ${tx.type} ${tx.from} -> ${tx.to} (${value})`);
  }

  // Or iterate through ALL transfers (auto-paginates)
  console.log('\n--- All ERC-20 transfers ---');
  let count = 0;
  for await (const tx of client.wallets.getAllTransfers(address, { chainId: 1 })) {
    if (tx.type === 'ERC20') {
      console.log(`${tx.tokenSymbol}: ${tx.value} (${tx.hash})`);
      count++;
    }
    if (count >= 20) break; // Stop after 20 for demo
  }
}

main().catch(console.error);
