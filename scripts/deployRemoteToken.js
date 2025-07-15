#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'
import { ethers } from 'ethers'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import {
  suiItsPackageId,
  suiItsObjectId,
  gasServicePackageId,
  gasServiceObjectId,
  gatewayPackageId,
  gatewayObjectId,
} from '../utils/constants.js'

async function run(args) {
  const { tokenId, coinPackageId } = args

  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

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
      deployRemoteToken.pure.string(''),
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

  console.log(`✅ Remote token deployment completed ${deployReceipt.digest}`)
}

const registerCoinCommand = new Command()
registerCoinCommand
  .description('Register Sui coin with ITS')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')
  .requiredOption('--tokenId <tokenId>', 'Token Id')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

registerCoinCommand.parse(process.argv)
