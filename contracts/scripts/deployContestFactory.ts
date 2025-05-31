import { ethers, run } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying ContestFactory with account:", deployer.address);

  // Deploy proof verifier
  const TwitterProver = await ethers.getContractFactory("TwitterProver");
  const twitterProver = await TwitterProver.deploy();
  await twitterProver.waitForDeployment();

  const TwitterAccountVerifier = await ethers.getContractFactory("TwitterAccountVerifier");
  const twitterAccountVerifier = await TwitterAccountVerifier.deploy("" + twitterProver.address);
  await twitterAccountVerifier.waitForDeployment();


  // FIXME: add doc link - opitmism sepolia I guess
  const entropyAddress = "0x4821932D0CDd71225A6d914706A621e0389D7061";
  const pythContract = "0x0708325268dF9F66270F1401206434524814508b";

  const ContestFactory = await ethers.getContractFactory("ContestFactory");
  const factory = await ContestFactory.deploy(
    twitterProver.address,
    twitterAccountVerifier.address,
    entropyAddress, 
    pythContract, 
  );

  await factory.waitForDeployment();

  console.log("✅ ContestFactory deployed at:", factory.address);

  // Wait a bit to ensure the deployment is indexed
  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30s delay

  // Contract verification
  try {
    await run("verify:verify", {
      address: factory.address,
      constructorArguments: [entropyAddress, pythContract],
    });
    console.log("🔍 Contract verified successfully");
  } catch (err) {
    console.error("❌ Verification failed:", err);
  }

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
