import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const Contest = await ethers.getContractFactory("Contest");
  const contract = await Contest.deploy(
    "0x4821932D0CDd71225A6d914706A621e0389D7061",
    "0x0708325268dF9F66270F1401206434524814508b",
    { gasLimit: 5_000_000 }
  );

  await contract.deployed();

  console.log("✅ Contract deployed at:", contract.address);

  fs.writeFileSync(
    "./deployed.json",
    JSON.stringify({ address: contract.address }, null, 2)
  );
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
