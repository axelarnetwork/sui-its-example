# Axelar Sui Demo

This demo showcases how to register a Sui coin with Axelar's ITS. It starts off with building a (simple) customized token and deploying the token. It then steps through the integration process of ITS and concludes with sending an interchain transfer to Ethereum from Sui. Full explanation can be found on Axelar docs.

node scripts/deploy.js

```
🚀 Sending publish transaction…
✅ Publish succeeded!
📦 Published package ID: 0x2e2b9c9676a313a43765b4b8ca5c1da9e2f887af99673938aac787f32ba2366a
💰 Treasury cap: 0xc2d5d3e597472a87a939e9e70518a7c922aae92efea23dbc36009219dab14fea
```


node scripts/mint.js --coinPackageId 0x2e2b9c9676a313a43765b4b8ca5c1da9e2f887af99673938aac787f32ba2366a --treasury 0xc2d5d3e597472a87a939e9e70518a7c922aae92efea23dbc36009219dab14fea

```
🚀 Sending mint transaction…
💰 my token balance 0
New coin object: 0xf45b53d54aa4aec8ac4c26752ba667acdc050d15c0eb5093bbe77c15d1851a53
```


node scripts/integrateAxelar.js --coinPackageId 0x2e2b9c9676a313a43765b4b8ca5c1da9e2f887af99673938aac787f32ba2366a

```
✅ Coin registration completed:
🎯 Token ID: 0x4ab8d0cf38246b909c12b5eb7ae447adb9736098c578ccf353861b6f19a656d7
```

 node scripts/deployRemoteToken.js --coinPackageId 0x2e2b9c9676a313a43765b4b8ca5c1da9e2f887af99673938aac787f32ba2366a --tokenId 0x4ab8d0cf38246b909c12b5eb7ae447adb9736098c578ccf353861b6f19a656d7

```
🚀 Deploying remote interchain token...
✅ Remote token deployment completed 948bMX2Ceff57Xtof5qhrdaM9eHJZc633EW6BsBspGST
```


node scripts/interchainTransfer.js --coinPackageId 0x2e2b9c9676a313a43765b4b8ca5c1da9e2f887af99673938aac787f32ba2366a --tokenId 0x4ab8d0cf38246b909c12b5eb7ae447adb9736098c578ccf353861b6f19a656d7 --destinationChain "ethereum-sepolia" --destinationAddress "0xc5DcAC3e02f878FE995BF71b1Ef05153b71da8BE" --amount 1 --coinObjectId 0xf38b0b362956c341bfd958fb02eaec7837bbb5de7c2187b4d066d5e61a8b639c
```
🚀 interchain transfer via ITS
🧾 Transaction digest: Eg77T9wozS4i1u6zveuLY51grewrsF5h2Yj8ecsLFiQi
```
