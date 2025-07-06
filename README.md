node scripts/deploy.js

```
📦 Published package ID: 0x2cf7c8771961dad0ab9b0676bb3a919e3ac387c3d6252e187304d4058be5823e
0xeba7b92db9f606ac6b5dce206fe4fee172c738df3f066edfff601f027e6a4e2a  the treasury cap id
0xf1290561142ae7dcf66af78b56537ec45c67581dae7d080b9bf30eb30c54660c metadata
```


node scripts/mint.js --coinPackageId 0x2cf7c8771961dad0ab9b0676bb3a919e3ac387c3d6252e187304d4058be5823e --treasury 0xeba7b92db9f606ac6b5dce206fe4fee172c738df3f066edfff601f027e6a4e2a

```
🚀 Sending mint transaction…
💰 my token balance 1
```


node scripts/integrateAxelar.js --coinPackageId 0x2cf7c8771961dad0ab9b0676bb3a919e3ac387c3d6252e187304d4058be5823e --treasury 0xeba7b92db9f606ac6b5dce206fe4fee172c738df3f066edfff601f027e6a4e2a

```
Token ID: 0x583c8d749f49f78ef4d498975381c578cb2007d9d3a045f2036c8e01f04ef1ac
```

node scripts/deployRemoteToken.js --coinPackageId 0x2cf7c8771961dad0ab9b0676bb3a919e3ac387c3d6252e187304d4058be5823e --tokenId 0x583c8d749f49f78ef4d498975381c578cb2007d9d3a045f2036c8e01f04ef1ac

```
  digest: 'AiRUDnzRMMmXuDNRHDopKy6Gk7K9uUymGfMiv6sfGdf3',
```


node scripts/interchainTransfer.js --coinPackageId 0x2cf7c8771961dad0ab9b0676bb3a919e3ac387c3d6252e187304d4058be5823e --tokenId 0x583c8d749f49f78ef4d498975381c578cb2007d9d3a045f2036c8e01f04ef1ac --destinationChain "ethereum-sepolia" --destinationAddress "0xc5DcAC3e02f878FE995BF71b1Ef05153b71da8BE" --treasuryCap 0xeba7b92db9f606ac6b5dce206fe4fee172c738df3f066edfff601f027e6a4e2a --amount 1

```
  digest: 'BcmwG7P98JYyzVMKbG7JwQRvvdVqd7CX7qiA5i5xJZmc',
```
