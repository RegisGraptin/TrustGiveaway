# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Deploy on Optimism 


This script deploys the constestFactory contract.
```bash
npx hardhat run scripts/deployContestFactory.ts --network optimism-sepolia
```

With this script you can get a randomNumber with PythEntropy Provider.
```bash
npx hardhat run scripts/testPythRandomNumber.ts --network optimism-sepolia
```

With this script you can update a Pricefeed (ETH/USD) in the Pyth Oracle then you will update the state in the smart contract with the newly given price value.
```bash
npx hardhat run scripts/testingPythPriceFeeds.ts --network optimism-sepolia
```

# Blockscout Verification

We have an automatic verification script written in deployContestFactory.ts from line 53 to line 76.

You can find a verified smartcontract on Blockscout on this link:

https://optimism-sepolia.blockscout.com/address/0x124d572B215eA8156f395Cb2BD3bf9c617e2a998?tab=contract


 In order to verify on blockscout manually, you need to run the following command ( You can find the deployed addresses on deployed.json after you run deploy scripts. EntropyAddress and PythContract address can be found on deployContestFactory.ts).

```bash
npx hardhat verify --network optimism-sepolia contestFactoryAddress _twitterAccountVerifierAddress _twitterProverAddress _entropyAddress _pythContract _myTokenAddress
```

## Deploy on forge

```bash
forge script \
  --rpc-url $ALCHEMY_OPTIMISM_SEPOLIA_URL \
  --private-key $PRIVATE_KEY \
  scripts/ContestFactory.s.sol:ContestFactoryScript \
  --verify \
  --verifier blockscout \
  --verifier-url https://optimism-sepolia.blockscout.com/api/ \
  --broadcast
```

```bash
forge script \
  --rpc-url $ALCHEMY_OPTIMISM_SEPOLIA_URL \
  --private-key $PRIVATE_KEY \
  scripts/ContestFactory.s.sol:ContestFactoryScript \
  --broadcast
```
