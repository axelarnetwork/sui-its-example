#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'
import { getWallet } from '../utils/index.js'
import { ethers } from 'ethers'

async function registerCoinWithIts(args) {
  const suiItsPackageId =
    '0xe7818984af6b3e322a6d999ca291a125fc3f82e13e5e6d9affc3a712f96bc7ce'

  const suiItsObjectId =
    '0x55fcd94e5293ff04c512a23c835d79b75e52611f66496e2d02cca439b84fa73c'

  const gatewayPackageId =
    '0x6ddfcdd14a1019d13485a724db892fa0defe580f19c991eaabd690140abb21e4'

  const gatewayObjectId =
    '0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db'

  const gasServiceObjectId =
    '0xac1a4ad12d781c2f31edc2aa398154d53dbda0d50cb39a4319093e3b357bc27d'

  const gasServicePackageId =
    '0xddf711b99aec5c72594e5cf2da4014b2d30909850a759d2e8090add1088dbbc9'

  const { coinPackageId } = args

  // Decode key
  const [keypair, client] = getWallet()

  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

  const registerCoinTx = new Transaction()

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
    target: `${suiItsPackageId}::coin_management::new_locked`,
    typeArguments: [coinType],
    arguments: [],
  })

  registerCoinTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::register_coin`,
    typeArguments: [coinType],
    arguments: [
      registerCoinTx.object(suiItsObjectId),
      registerCoinTx.object(coinInfo),
      registerCoinTx.object(coinManagement),
    ],
  })

  const deployReceipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: registerCoinTx,
    options: { showObjectChanges: true, showEvents: true },
  })

  console.log('✅ Coin registration completed:', deployReceipt)

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
  .requiredOption('--treasury <treasury>', 'Treasury')
  .action(async (opts) => {
    try {
      await registerCoinWithIts(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

registerCoinCommand.parse(process.argv)



//node scripts/interchainTransfer.js --coinPackageId 0x0488882712ca159de81b43cf2b13fbba123e349e9b45524a0ca6fa95a9d7b012 --tokenId 0x52b1b1524c3db74b65edb88bc9fbe28c551485707cfe8a7bb2776736796061ef --destinationChain "ethereum-sepolia" --destinationAddress "0xc5DcAC3e02f878FE995BF71b1Ef05153b71da8BE" --treasuryCap 0x57b300a8c8bcee3974af0b4e17a569fa3e82b702e54520981431827dbc4d4df7 --amount 1