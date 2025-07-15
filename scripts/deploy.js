import { execSync } from 'child_process'
import { Command } from 'commander'
import { Transaction } from '@mysten/sui/transactions'
import { getWallet } from '../utils/index.js'

async function run() {
  // Decode key
  const [keypair, client] = getWallet()
  const myAddress = keypair.getPublicKey().toSuiAddress()

  // Build the Move package
  console.log('📦 Building Move package')
  const buildOutput = execSync(`sui move build --dump-bytecode-as-base64`, {
    encoding: 'utf-8',
  })

  const { modules, dependencies } = JSON.parse(buildOutput)

  // Prepare & publish
  const tx = new Transaction()
  const [upgradeCap] = tx.publish({ modules, dependencies })

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
  console.log('💰 Treasury cap:', treasuryCapId)
}

const program = new Command()
program.description('Deploy Sui Coin').action(async () => {
  try {
    await run()
  } catch (err) {
    console.error('❌ Error:', err.message || err)
    process.exit(1)
  }
})

program.parse(process.argv)
