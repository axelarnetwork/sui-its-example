#!/usr/bin/env node
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'
import { ethers } from 'ethers'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'

const SUI_PACKAGE_ID = '0x2'
const CLOCK_PACKAGE_ID = '0x6'

async function interchainTransferWithIts(args) {
  const suiItsPackageId =
    '0xe7818984af6b3e322a6d999ca291a125fc3f82e13e5e6d9affc3a712f96bc7ce'

  const suiItsObjectId =
    '0x55fcd94e5293ff04c512a23c835d79b75e52611f66496e2d02cca439b84fa73c'

  const gateway =
    '0x6ddfcdd14a1019d13485a724db892fa0defe580f19c991eaabd690140abb21e4'

  const gatewayObjectId =
    '0x6fc18d39a9d7bf46c438bdb66ac9e90e902abffca15b846b32570538982fb3db'

  const gasServiceObjectId =
    '0xac1a4ad12d781c2f31edc2aa398154d53dbda0d50cb39a4319093e3b357bc27d'

  const gasServicePackageId =
    '0xddf711b99aec5c72594e5cf2da4014b2d30909850a759d2e8090add1088dbbc9'

  const {
    coinPackageId,
    tokenId,
    destinationChain,
    destinationAddress,
    treasuryCap,
    amount,
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

  const coinObj = interchainTransferTx.moveCall({
    target: `${SUI_PACKAGE_ID}::coin::mint`,
    arguments: [
      interchainTransferTx.object(treasuryCap),
      interchainTransferTx.pure.u256(amount),
    ],
    typeArguments: [coinType],
  })

  const gatewayChannelId = interchainTransferTx.moveCall({
    target: `${gateway}::channel::new`,
    arguments: [],
  })

  // Get ticket for the transfer
  const ticket = interchainTransferTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::prepare_interchain_transfer`,
    typeArguments: [coinType],
    arguments: [
      interchainTransferTx.object(tokenIdObj),
      interchainTransferTx.object(coinObj),
      interchainTransferTx.pure.string('ethereum-sepolia'),
      interchainTransferTx.object(destinationAddress),
      interchainTransferTx.pure.string('0x'),
      interchainTransferTx.object(gatewayChannelId),
    ],
  })

  // Execute interchain transfer
  interchainTransferTx.moveCall({
    target: `${suiItsPackageId}::interchain_token_service::send_interchain_transfer`,
    typeArguments: [coinType],
    arguments: [
      interchainTransferTx.object(suiItsObjectId),
      ticket,
      interchainTransferTx.object(CLOCK_PACKAGE_ID),
    ],
  })

  console.log('🚀 interchain transfer via ITS')

  const unitAmount = ethers.utils.parseUnits('1', 9).toBigInt()

  const [gas] = interchainTransferTx.splitCoins(interchainTransferTx.gas, [
    unitAmount,
  ])

  interchainTransferTx.moveCall({
    target: `${gasServicePackageId}::gas_service::pay_gas`,
    typeArguments: [SUI_TYPE_ARG],
    arguments: [
      interchainTransferTx.object(gasServiceObjectId),
      ticket,
      gas,
      interchainTransferTx.object(keypair.getPublicKey().toSuiAddress()),
      interchainTransferTx.pure.string(''),
    ],
  })

  interchainTransferTx.moveCall({
    target: `${gateway}::gateway::send_message`,
    arguments: [
      interchainTransferTx.object(gatewayObjectId), // &Gateway
      ticket, // MessageTicket
    ],
  })

  interchainTransferTx.moveCall({
    target: `${gateway}::channel::destroy`,
    arguments: [gatewayChannelId],
  })

  const receipt = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: interchainTransferTx,
    options: { showObjectChanges: true },
  })

  console.log('🧾 Transaction receipt:', receipt)
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
  .requiredOption(
    '--treasuryCap <treasuryCap>',
    'The treasury cap for the coin'
  )
  .requiredOption('--amount <amount>', 'The amount of coins to be sent')
  .action(async (opts) => {
    try {
      await interchainTransferWithIts(opts)
    } catch (err) {
      console.error('❌ Error:', err.message || err)
      process.exit(1)
    }
  })

interchainTransferCommand.parse(process.argv)
