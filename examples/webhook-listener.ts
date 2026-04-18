/**
 * Example: Webhook listener for CryptaChain events.
 *
 * This example shows how to verify and process incoming webhook
 * payloads from CryptaChain. Use with any HTTP framework (Express,
 * Fastify, Hono, etc.).
 *
 * Note: Webhook delivery requires an active CryptaChain subscription
 * with webhook endpoints configured in the dashboard.
 */

import { CryptaChain } from '@cryptachain/sdk';
import type { Transfer } from '@cryptachain/sdk';

// Webhook payload types (these would be delivered to your endpoint)
interface WebhookPayload {
  event: 'transfer.detected' | 'transfer.confirmed' | 'address.activity';
  timestamp: string;
  data: Transfer | AddressActivityPayload;
  signature: string;
}

interface AddressActivityPayload {
  address: string;
  chainId: number;
  transferCount: number;
  period: string;
}

// Initialize client for enrichment lookups
const client = new CryptaChain({
  apiKey: process.env.CRYPTACHAIN_API_KEY!,
});

/**
 * Process an incoming webhook payload.
 *
 * In production, you would:
 * 1. Verify the signature using your webhook secret
 * 2. Process the event
 * 3. Return 200 to acknowledge receipt
 */
async function handleWebhook(payload: WebhookPayload): Promise<void> {
  console.log(`Received event: ${payload.event} at ${payload.timestamp}`);

  switch (payload.event) {
    case 'transfer.detected': {
      const transfer = payload.data as Transfer;
      console.log(`New transfer: ${transfer.hash}`);
      console.log(`  From: ${transfer.from}`);
      console.log(`  To: ${transfer.to}`);
      console.log(`  Value: ${transfer.value}`);

      // Optionally enrich with screening data
      const screen = await client.screening.screenAddress({
        address: transfer.from,
        chainId: transfer.chainId,
      });
      if (screen.riskLevel === 'SEVERE' || screen.isSanctioned) {
        console.warn(`HIGH RISK transfer from ${transfer.from}!`);
        // Trigger alert...
      }
      break;
    }

    case 'transfer.confirmed': {
      const transfer = payload.data as Transfer;
      console.log(`Transfer confirmed: ${transfer.hash} (${transfer.status})`);
      break;
    }

    case 'address.activity': {
      const activity = payload.data as AddressActivityPayload;
      console.log(`Activity on ${activity.address}: ${activity.transferCount} transfers`);
      break;
    }
  }
}

// Simulate processing a webhook
const samplePayload: WebhookPayload = {
  event: 'transfer.detected',
  timestamp: new Date().toISOString(),
  data: {
    hash: '0xabc123',
    blockNumber: 19000000,
    timestamp: new Date().toISOString(),
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    value: '1000000000000000000',
    type: 'NATIVE',
    chainId: 1,
    status: 'SUCCESS',
  },
  signature: 'hmac-sha256-signature-here',
};

handleWebhook(samplePayload).catch(console.error);
