import { ethers } from "hardhat";
import fs from "fs";

// This script deployed the contestFactory address

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying ContestFactory with account:", deployer.address);


  const entropyAddress = "0x4821932D0CDd71225A6d914706A621e0389D7061";
  const pythContract = "0x0708325268dF9F66270F1401206434524814508b";

  const ContestFactory = await ethers.getContractFactory("ContestFactory");
  const factory = await ContestFactory.deploy(entropyAddress, pythContract, {
    gasLimit: 5_000_000,
  });

  await factory.deployed();

  console.log("✅ ContestFactory deployed at:", factory.address);

  // Save to deployed.json
  const deployedInfo = {
    contestFactory: factory.address,
  };

  fs.writeFileSync("./deployed.json", JSON.stringify(deployedInfo, null, 2));
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
