#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'
import { ethers } from 'ethers'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import {
  suiItsPackageId,
  suiItsObjectId,
  gasServiceObjectId,
  gatewayPackageId,
  gasServicePackageId,
  gatewayObjectId,
  SUI_CLOCK_OBJECT_ID,
} from '../utils/constants.js'

async function run(args) {
  const {
    coinPackageId,
    tokenId,
    destinationChain,
    destinationAddress,
    amount,
    coinObjectId,
  } = args

  const coinType = `${coinPackageId}::my_custom_coin::MY_CUSTOM_COIN`

  // Decode key
  const [keypair, client] = getWallet()

  // Create new transaction for interchain transfer
  const interchainTransferTx = new Transaction()

  const tokenIdObj = interchainTransferTx.moveCall({
    target: `${suiItsPackageId}::token_id::from_u256`,
    arguments: [interchainTransferTx.pure.u256(tokenId)],
  })

  const gatewayChannelId = interchainTransferTx.moveCall({
    target: `${gatewayPackageId}::channel::new`,
  })

  const [coinsToSend] = interchainTransferTx.splitCoins(coinObjectId, [amount])

  const destRaw = ethers.utils.arrayify(destinationAddress) // Uint8Array, length === 20

  // Get ticket for the transfer
  const ticket = interchainTransferTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::prepare_interchain_transfer`,
    typeArguments: [coinType],
    arguments: [
      tokenIdObj,
      coinsToSend,
      interchainTransferTx.pure.string(destinationChain),
      interchainTransferTx.pure.vector('u8', destRaw),
      interchainTransferTx.pure.string('0x'),
      gatewayChannelId,
    ],
  })

  // Execute interchain transfer
  const interchainTransferTicket = interchainTransferTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::send_interchain_transfer`,
    typeArguments: [coinType],
    arguments: [
      interchainTransferTx.object(suiItsObjectId),
      ticket,
      interchainTransferTx.object(SUI_CLOCK_OBJECT_ID),
    ],
  })

  console.log('🚀 interchain transfer via ITS')

  const unitAmountGas = ethers.utils.parseUnits('1', 9).toBigInt()

  const [gas] = interchainTransferTx.splitCoins(interchainTransferTx.gas, [
    unitAmountGas,
  ])

  interchainTransferTx.moveCall({
    target: `${gasServicePackageId}::gas_service::pay_gas`,
    typeArguments: [SUI_TYPE_ARG],
    arguments: [
      interchainTransferTx.object(gasServiceObjectId),
      interchainTransferTicket,
      gas,
      interchainTransferTx.object(keypair.getPublicKey().toSuiAddress()),
      interchainTransferTx.pure.string(''),
    ],
  })

  interchainTransferTx.moveCall({
    target: `${gatewayPackageId}::gateway::send_message`,
    arguments: [
      interchainTransferTx.object(gatewayObjectId), // &Gateway
      interchainTransferTicket, // MessageTicket
    ],
  })

  interchainTransferTx.moveCall({
    target: `${gatewayPackageId}::channel::destroy`,
    arguments: [interchainTransferTx.object(gatewayChannelId)],
  })

  const receipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: interchainTransferTx,
    options: { showObjectChanges: true },
  })

  console.log('🧾 Transaction digest:', receipt.digest)
}

const interchainTransferCommand = new Command()
interchainTransferCommand
  .description('Transfer coin from Sui to Ethereum with ITS')
  .requiredOption('--coinPackageId <coinPackageId>', 'Coin Package Id')

  .requiredOption('--tokenId <tokenId>', 'The ITS token id')
  .requiredOption(
    '--destinationChain <destinationChain>',
    'The destination chain'
  )
  .requiredOption(
    '--destinationAddress <destinationAddress>',
    'The destination address'
  )
  .requiredOption('--amount <amount>', 'The amount of coins to be sent')
  .requiredOption('--coinObjectId <coinObjectId>', 'The coin object Id')
  .action(async (opts) => {
    try {
      await run(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

interchainTransferCommand.parse(process.argv)
