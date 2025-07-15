# Checkpoint 2

At this point you should be able to deploy your compiled Sui coin on the Sui testnet

Deploy Coin:

```bash
node scripts/deploy.js
```

The deploy script should emit the following logs

```bash
UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git
INCLUDING DEPENDENCY Sui
INCLUDING DEPENDENCY MoveStdlib
BUILDING my_coin
🚀 Sending publish transaction…
✅ Publish succeeded!
📦 Published package ID: 0x1f5d309ac962e444cc58e8ef268b319123199c762856cef23dcdf4303eb37258
💰 Treasury cap: 0x218d0c8546e9c694fc9946e51bdcedcdba7e3b42b6b3c61d1c095f8df5846b6e
```