#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'

async function run(args) {
  const { coinPackageId, treasury } = args

  // Decode key
  const [keypair, client] = getWallet()

  const myAddress = keypair.getPublicKey().toSuiAddress()

  const mintTx = new Transaction()

  mintTx.moveCall({
    target: `${coinPackageId}::my_custom_coin::mint`,
    arguments: [
      mintTx.object(treasury), // the cap you extracted
      mintTx.pure.u64(1), // BigInt for u64
      mintTx.pure.address(myAddress), // Sui address of the recipient
    ],
  })

  console.log('🚀 Sending mint transaction…')

  await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: mintTx,
    options: { showObjectChanges: true },
  })

  const balance = await client.getBalance({
    owner: myAddress,
    coinType: `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`,
  })

  console.log(`💰 my token balance ${balance.totalBalance}`)
}

const program = new Command()
program
  .description('Build and publish a Sui coin')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')
  .requiredOption('--treasury <treasury>', 'Treasury')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

program.parse(process.argv)
