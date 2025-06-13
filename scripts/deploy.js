import { execSync } from 'child_process'
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'

async function run() {
  // Decode key
  const [keypair, client] = getWallet()

  // Build the Move package
  console.log('📦 Building Move package')
  const buildOutput = execSync(`sui move build --dump-bytecode-as-base64`, {
    encoding: 'utf-8',
  })

  const { modules, dependencies } = JSON.parse(buildOutput)

  // Prepare & publish
  const tx = new Transaction()
  const [upgradeCap] = tx.publish({ modules, dependencies })

  const myAddress = keypair.getPublicKey().toSuiAddress()
  tx.transferObjects([upgradeCap], myAddress)

  console.log('🚀 Sending publish transaction…')
  const response = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showObjectChanges: true },
  })
  console.log('✅ Publish succeeded!')

  // Extract published package ID
  const publishedChange = response.objectChanges.find(
    (c) => c.type === 'published'
  )

  const treasuryChange = response.objectChanges.find(
    (c) =>
      c.type === 'created' && c.objectType.startsWith('0x2::coin::TreasuryCap')
  )

  const packageId = publishedChange?.packageId
  console.log('📦 Published package ID:', packageId)

  const treasuryCapId = treasuryChange.objectId
  console.log(treasuryCapId, ' the treasury cap id')

  // const mintTx = new Transaction()

  // mintTx.moveCall({
  //   target:
  //     '0xf80bdd0ebb2fb53213de3e3de34a15becc06568f873b99e3614720491c90ef17::my_custom_coin::mint',
  //   arguments: [
  //     mintTx.object(
  //       '0x5a600a3d9b40406e500bb29ba31c7766d6ce972cb1bc615cb87d854948b10c8f'
  //     ), // the cap you extracted
  //     mintTx.pure.u64(1), // BigInt for u64
  //     mintTx.pure.address(myAddress), // Sui address of the recipient
  //   ],
  // })

  // console.log('🚀 Sending mint transaction…')

  // const mintRes = await client.signAndExecuteTransaction({
  //   signer: keypair,
  //   transaction: mintTx,
  //   options: { showObjectChanges: true },
  // })

  // console.log(mintRes, 'the mint res')
}

const program = new Command()
program.description('Build and publish a Sui coin').action(async (opts) => {
  try {
    await run(opts)
  } catch (err) {
    console.error('❌ Error:', err.message || err)
    process.exit(1)
  }
})

program.parse(process.argv)
