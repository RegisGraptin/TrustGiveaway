import { ethers, run } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying MyToken ERC20 with account:", await deployer.getAddress());

  // Deploy MyToken ERC20 first
  const MyToken = await ethers.getContractFactory("MyToken");
  const tokenName = "Wrapped ETH";
  const tokenSymbol = "WETH";
  const decimals = 18;

  const myToken = await MyToken.deploy(deployer, tokenName, tokenSymbol, decimals);
  await myToken.waitForDeployment();
  console.log("✅ MyToken deployed at:", await myToken.getAddress());

  // Deploy proof verifier
  const TwitterProver = await ethers.getContractFactory("TwitterProver");
  const twitterProver = await TwitterProver.deploy();
  await twitterProver.waitForDeployment();

  const TwitterAccountVerifier = await ethers.getContractFactory("TwitterAccountVerifier");
  const twitterAccountVerifier = await TwitterAccountVerifier.deploy(twitterProver.getAddress());
  await twitterAccountVerifier.waitForDeployment();

  // Addresses for entropy and pyth contracts
  const entropyAddress = "0x4821932D0CDd71225A6d914706A621e0389D7061"; // Pyth Entropy Contract
  const pythContract = "0x0708325268dF9F66270F1401206434524814508b"; // Pyth Price Feeds contract

  // Deploy ContestFactory with myToken address passed
  const ContestFactory = await ethers.getContractFactory("ContestFactory");
  const factory = await ContestFactory.deploy(
    twitterProver.getAddress(),
    twitterAccountVerifier.getAddress(),
    entropyAddress,
    pythContract,
    await myToken.getAddress() // pass myToken address here
  );
  await factory.waitForDeployment();

  console.log("✅ ContestFactory deployed at:", await factory.getAddress());

  // Transfer ownership of MyToken to ContestFactory so it can mint later
  console.log(`Transferring MyToken ownership to ContestFactory at ${await factory.getAddress()}...`);
  const txOwnership = await myToken.transferOwnership(await factory.getAddress());
  await txOwnership.wait();
  console.log("Ownership of MyToken transferred to ContestFactory");

  // Contract verification steps

  try {
    await run("verify:verify", {
      address: await myToken.getAddress(),
      constructorArguments: [deployer.address, tokenName, tokenSymbol, decimals],
    });
    console.log("🔍 MyToken verified successfully");
  } catch (err) {
    console.error("❌ MyToken verification failed:", err);
  }

  try {
    await run("verify:verify", {
      address: await factory.getAddress(),
      constructorArguments: [
        await twitterProver.getAddress(),
        await twitterAccountVerifier.getAddress(),
        entropyAddress,
        pythContract,
        await myToken.getAddress(),
      ],
    });
    console.log("🔍 ContestFactory verified successfully");
  } catch (err) {
    console.error("❌ ContestFactory verification failed:", err);
  }

  // Save deployed addresses to deployed.json
  const deployedInfo = {
    contestFactory: await factory.getAddress(),
    myToken: await myToken.getAddress(),
  };

  fs.writeFileSync("./deployed.json", JSON.stringify(deployedInfo, null, 2));
  console.log("Saved deployed addresses to deployed.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
