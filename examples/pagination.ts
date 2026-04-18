import { CryptaChain, collectAll, paginate } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  // Option 1: Use the built-in getAllTransfers (async generator)
  console.log('--- Streaming all transfers ---');
  let count = 0;
  for await (const transfer of client.wallets.getAllTransfers(address, { chainId: 1 })) {
    count++;
    if (count <= 5) {
      console.log(`  #${count}: ${transfer.hash} (${transfer.type})`);
    }
  }
  console.log(`  Total: ${count} transfers\n`);

  // Option 2: Use the generic paginate() helper directly
  console.log('--- Using paginate() helper ---');
  const erc20Transfers = paginate((cursor) =>
    client.wallets.getErc20Transfers(address, { chainId: 1, cursor, limit: 100 })
      .then((res) => ({ items: res.transfers, pagination: res.pagination })),
  );

  let erc20Count = 0;
  for await (const tx of erc20Transfers) {
    erc20Count++;
    if (erc20Count <= 3) {
      console.log(`  ${tx.tokenSymbol}: ${tx.value}`);
    }
  }
  console.log(`  Total ERC-20 transfers: ${erc20Count}\n`);

  // Option 3: Collect all into an array (careful with memory)
  console.log('--- Using collectAll() ---');
  const allNativeTransfers = await collectAll((cursor) =>
    client.wallets.getNativeTransfers(address, { chainId: 1, cursor, limit: 100 })
      .then((res) => ({ items: res.transfers, pagination: res.pagination })),
  );
  console.log(`  Collected ${allNativeTransfers.length} native transfers into memory`);
}

main().catch(console.error);
