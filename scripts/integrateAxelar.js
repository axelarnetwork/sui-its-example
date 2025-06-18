#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { TxBuilder } = require('@axelar-network/axelar-cgp-sui')

async function run(args) {
  const suiItsPackageId =
    '0xe7818984af6b3e322a6d999ca291a125fc3f82e13e5e6d9affc3a712f96bc7ce'

  const suiItsObjectId =
    '0x55fcd94e5293ff04c512a23c835d79b75e52611f66496e2d02cca439b84fa73c'

  const { coinPackageId, treasury, metadata } = args

  // Decode key
  const [keypair, client] = getWallet()

  const myAddress = keypair.getPublicKey().toSuiAddress()

  // const registerCoinTx = new Transaction()
  const txBuilder = new TxBuilder(client)
  const tx = txBuilder.tx

  // const coinInfo = registerCoinTx.moveCall({
  //   target: `${suiItsPackageId}::coin_info::from_info`,
  //   // typeArguments: [coinType],
  //   arguments: [
  //     registerCoinTx.object("My Custom Token"),
  //     registerCoinTx.object("MCC"),
  //     registerCoinTx.object("6"),
  //   ],
  // })

  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

  console.log(coinType, 'coin type')

  const coinManagement = await txBuilder.moveCall({
    target: `${suiItsPackageId}::coin_management::new_locked`,
    typeArguments: [coinType],
    arguments: [],
  })

  console.log(coinManagement, 'the coin management')

  const coinInfo = await txBuilder.moveCall({
    target: `${suiItsPackageId}::coin_info::from_info`,
    typeArguments: [coinType],
    arguments: [
      "My Custom Token",
      "MCC",
      "6",
    ],
  });


  //CALL REGISTER COIN HERE
  await txBuilder.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::register_coin`,
    typeArguments: [coinType],
    arguments: [suiItsObjectId, coinInfo, coinManagement],
  })

  console.log('🚀 registering coin with ITS')

  // await client.moveCall({
  //   target:
  //   signer: keypair,
  //   transaction: txBuilder,
  //   options: { showObjectChanges: true },
  // })

  const receipt = await txBuilder.signAndExecute(keypair)
  console.log(receipt)
}

const program = new Command()
program
  .description('Register Sui coin with ITS')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')
  .requiredOption('--treasury <treasury>', 'Treasury')
  .requiredOption('--metadata <metadata>', 'Metadata')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

program.parse(process.argv)
