#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'
import { suiItsPackageId, suiItsObjectId } from '../utils/constants.js'

async function run(args) {
  const { coinPackageId, treasuryCap } = args

  // Decode key
  const [keypair, client] = getWallet()

  const registerCoinTx = new Transaction()
  
  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

  //no longer call this, just pass in the params to register_coin_from_info()
  const coinInfo = registerCoinTx.moveCall({
    target: `${suiItsPackageId}::coin_info::from_info`,
    typeArguments: [coinType],
    arguments: [
      registerCoinTx.object('My Custom Token'),
      registerCoinTx.object('MCC'),
      registerCoinTx.object('6'),
    ],
  })



  const coinManagement = registerCoinTx.moveCall({
    target: `${suiItsPackageId}::coin_management::new_with_cap`,
    typeArguments: [coinType],
    arguments: [treasuryCap],
  })

  const gatewayChannelId = registerCoinTx.moveCall({
    target: `${gatewayPackageId}::channel::new`,
  })

  //add distributor
//   TODO:
//   await txBuilder.moveCall({
//     target: `${ITS.address}::coin_management::add_distributor`,
//     typeArguments: [coinType],
//     arguments: [coinManagement, gatewayChannelId],
//   });

  registerCoinTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::register_coin`,
    typeArguments: [coinType],
    arguments: [
      registerCoinTx.object(suiItsObjectId),
      registerCoinTx.object(coinInfo),
      registerCoinTx.object(coinManagement),
    ],
  })

  registerCoinTx.moveCall({
    target: `${gatewayPackageId}::channel::destroy`,
    arguments: [interchainTransferTx.object(gatewayChannelId)],
  })

  const deployReceipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: registerCoinTx,
    options: { showObjectChanges: true, showEvents: true },
  })

  console.log('✅ Coin registration completed:')

  const coinRegisteredEvent = deployReceipt.events.find((event) =>
    event.type.includes('CoinRegistered')
  )

  const tokenId = coinRegisteredEvent.parsedJson.token_id.id
  console.log('🎯 Token ID:', tokenId)

  return deployReceipt
}

const registerCoinCommand = new Command()
registerCoinCommand
  .description('Register Sui coin with ITS')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')
  .requiredOption('--treasuryCap <treasuryCap>', 'Treasury Cap')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

registerCoinCommand.parse(process.argv)
