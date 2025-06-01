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


```bash
npx hardhat run ./scripts/deployContestFactory.ts --network optimism-sepolia
npx hardhat run scripts/testPythRandomNumber.ts --network optimism-sepolia
```

FIXME: Add commands to verify smart contract
FIXME: Add blockscout link direclty!



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
