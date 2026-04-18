import { CryptaChain, fromSmallestUnit } from '@cryptachain/sdk';

async function main() {
  const client = new CryptaChain({
    apiKey: process.env.CRYPTACHAIN_API_KEY!,
  });

  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  // Get native balance
  const native = await client.wallets.getNativeBalance(address, { chainId: 1 });
  console.log(`Native: ${fromSmallestUnit(native.balance, native.decimals)} ${native.symbol}`);
  if (native.valueUsd) {
    console.log(`  USD value: $${native.valueUsd}`);
  }

  // Get all token balances
  const tokens = await client.wallets.getBalances(address, { chainId: 1 });
  console.log(`\n${tokens.length} tokens found:\n`);

  for (const token of tokens) {
    const formatted = fromSmallestUnit(token.balance, token.tokenDecimals);
    console.log(`  ${token.tokenSymbol}: ${formatted}`);
    if (token.valueUsd) {
      console.log(`    USD value: $${token.valueUsd}`);
    }
  }

  // Get wallet summary
  const summary = await client.wallets.getSummary(address, { chainId: 1 });
  console.log(`\nWallet summary:`);
  console.log(`  Total transactions: ${summary.totalTransactions}`);
  console.log(`  Token types held: ${summary.tokenCount}`);
  console.log(`  NFTs held: ${summary.nftCount}`);
  console.log(`  First tx: ${summary.firstTransactionAt}`);
  console.log(`  Last tx: ${summary.lastTransactionAt}`);
}

main().catch(console.error);
