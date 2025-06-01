import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Load deployed factory address from deployed.json
  const deployed = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));
  const contestFactoryAddress = deployed.contestFactory;
  const myTokenAddress = deployed.myToken;

  if (!contestFactoryAddress) {
    throw new Error("contestFactory address not found in deployed.json");
  }
  if (!myTokenAddress) {
    throw new Error("myToken address not found in deployed.json");
  }

  // Attach to the factory contract
  const ContestFactory = await ethers.getContractFactory("ContestFactory");
  const contestFactory = ContestFactory.attach(contestFactoryAddress);

  // Attach to the token contract
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = MyToken.attach(myTokenAddress);

  const tokenSymbol = "WETH";
  const decimals = 18;

  // Get current contestId before creation
  let currentContestId = await contestFactory.contestId();


  // Call createNewContest - example params
  const twitterStatusId = "1234567890";
  const description = "My First Contest";
  const endTimeContest = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  console.log("Creating new contest...");
  const txCreate = await contestFactory.createNewContest(twitterStatusId, description, endTimeContest);
  await txCreate.wait();
  console.log("Contest created!");

  // The new contest address is stored at contestAddress[currentContestId]
  const newContestAddress = await contestFactory.contestAddress(currentContestId);

  console.log("New contest address:", newContestAddress);

  // Check the token balance of the new contest contract
  const balance = await myToken.balanceOf(newContestAddress);
  console.log(`Contest contract's token balance: ${ethers.formatUnits(balance, decimals)} ${tokenSymbol}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
