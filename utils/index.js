import { ethers } from 'ethers';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import 'dotenv/config';

/**
 * Convert a human-readable amount into its atomic unit representation.
 * @param {string} amount - The amount as a decimal string, e.g. "1.5"
 * @param {number} [decimals=9] - Number of decimal places (defaults to 9 for SUI)
 * @returns {bigint} The amount in atomic units
 */
export function getUnitAmount(amount, decimals = 9) {
  return ethers.utils.parseUnits(amount, decimals).toBigInt();
}

/**
 * Load the user's Ed25519 keypair and initialize a SuiClient
 * @returns {[Ed25519Keypair, SuiClient]}
 */
export function getWallet() {
  const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

  const rawKey = process.env.PRIVATE_KEY;
  if (!rawKey) {
    console.error('PRIVATE_KEY not set in your .env');
    process.exit(1);
  }

  const keypair = Ed25519Keypair.fromSecretKey(rawKey);
  return [keypair, client];
}
