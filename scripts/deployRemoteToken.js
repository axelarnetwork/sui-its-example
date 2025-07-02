#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'
import { getWallet } from '../utils/index.js'
import { ethers } from 'ethers'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'

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

  const { tokenId, coinPackageId } = args

  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

  // Decode key
  const [keypair, client] = getWallet()

  const deployRemoteToken = new Transaction()


  const tokenIdObj = deployRemoteToken.moveCall({
    target: `${suiItsPackageId}::token_id::from_u256`,
    arguments: [deployRemoteToken.pure.u256(tokenId)],
  })

  const deployRemoteTokenTicket = deployRemoteToken.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::deploy_remote_interchain_token`,
    arguments: [
      deployRemoteToken.object(suiItsObjectId),
      tokenIdObj,
      deployRemoteToken.pure.string('ethereum-sepolia'),
    ],
    typeArguments: [coinType],
  })

  console.log('🚀 Deploying remote interchain token...')

  const unitAmount = ethers.utils.parseUnits('1', 9).toBigInt()

  const [gas] = deployRemoteToken.splitCoins(deployRemoteToken.gas, [
    unitAmount,
  ])

  deployRemoteToken.moveCall({
    target: `${gasServicePackageId}::gas_service::pay_gas`,
    typeArguments: [SUI_TYPE_ARG],
    arguments: [
      deployRemoteToken.object(gasServiceObjectId),
      deployRemoteTokenTicket,
      gas,
      deployRemoteToken.object(keypair.getPublicKey().toSuiAddress()),
      deployRemoteToken.pure.string(""),
    ],
  })

  deployRemoteToken.moveCall({
    target: `${gatewayPackageId}::gateway::send_message`,
    arguments: [
      deployRemoteToken.object(gatewayObjectId), // &Gateway
      deployRemoteTokenTicket, // MessageTicket
    ],
  })

  const deployReceipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: deployRemoteToken,
    options: { showObjectChanges: true, showEvents: true },
  })

  console.log('✅ Remote token deployment completed:', deployReceipt)
}

const registerCoinCommand = new Command()
registerCoinCommand
  .description('Register Sui coin with ITS')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')
  .requiredOption('--tokenId <tokenId>', 'Token Id')
  .action(async (opts) => {
    try {
      await registerCoinWithIts(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

registerCoinCommand.parse(process.argv)
