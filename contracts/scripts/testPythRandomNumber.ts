import { ethers } from "hardhat";
import fs from "fs";

const entropyAddress = "0x4821932D0CDd71225A6d914706A621e0389D7061";

// ABI fragment for IEntropy with getFee method
const entropyAbi = [
  "function getFee(address provider) external view returns (uint256)"
];

// Simple delay helper
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Poll getWinner until success or timeout
async function waitForWinner(contract: any, maxRetries = 20, intervalMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const winner = await contract.getWinner();
      return winner;
    } catch {
      console.log(`Winner not chosen yet, retrying... (${i + 1}/${maxRetries})`);
      await delay(intervalMs);
    }
  }

  throw new Error("Timeout waiting for winner");
}

async function main() {
  const [owner, account2, account3, account4] = await ethers.getSigners();
  const { contestFactory } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  const entropyProvider = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344" //default EntropyProvider
  const Factory = await ethers.getContractAt("ContestFactory", contestFactory, owner);

  console.log("Creating contest from factory...");
  const tx = await Factory.createNewContest(
    "123456789012345678",                // _twitterStatusId
    "Testing the Pyth Entropy logic",         // _description
    Math.floor(Date.now() / 1000) + 30   // _endTimeContest (now + 60s)
  );
  await tx.wait();

  const contestId = await Factory.contestId();
  const newContestAddress = await Factory.contestAddress(contestId.sub(1)); // latest contest

  console.log("🎯 New Contest deployed at:", newContestAddress);

  const Contest = await ethers.getContractAt("Contest", newContestAddress, owner);

  // Proceed with original logic
  const handles = ["alice123", "bob456", "charlie789"];
  const signers = [account2, account3, account4];

  for (let i = 0; i < signers.length; i++) {
    (await Contest.connect(signers[i]).register(handles[i])).wait();
    console.log(`Registered ${handles[i]} from ${signers[i].address}`);
  }
  // Wait for 20 seconds before ending the contest
console.log("⏳ Waiting 20 seconds before for contest to be finished...");
await delay(20000); // 20,000 milliseconds = 20 seconds



  const dummyEntropy = ethers.utils.formatBytes32String("random-seed");

  console.log("Ending contest and requesting random number...");
  const fee = await Contest.getEntropyFee(entropyProvider);
  console.log("pythFee: ", fee)
  await (await Contest.endContest(dummyEntropy, { value: fee })).wait();

  console.log("Contest ended, waiting for winner...");
  const winner = await waitForWinner(Contest);

  console.log("Winner info:", winner);
  console.log("Winning number:", winner.id.toString());
}

main().catch((error) => {
  console.error("❌ Interaction failed:", error);
  process.exit(1);
});
