import { ethers } from "hardhat";
import { encodeBytes32String, Contract, JsonRpcProvider, ContractRunner } from "ethers";
import fs from "fs";


function toContractRunner(signer: any): ContractRunner {
  return signer as ContractRunner;
}

// ABI fragment for IEntropy with getFee method
const entropyAbi = [
  "function getFee(address provider) external view returns (uint256)"
];

// Simple delay helper
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Poll getWinner until success or timeout
async function waitForWinner(contract: Contract, maxRetries = 10, intervalMs = 5000) {
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
  const [owner] = await ethers.getSigners();
  const { contestFactory } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  const entropyProvider = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344"; // default EntropyProvider
  const Factory = await ethers.getContractAt("ContestFactory", contestFactory);

    const provider = ethers.provider;

  // connect owner signer explicitly to provider
  const ownerWithProvider = owner.connect(provider);

  console.log("Creating contest from factory...");
  const tx = await Factory.createNewContest(
    "123456789012345678",                // _twitterStatusId
    "Testing the Pyth Entropy logic",   // _description
    Math.floor(Date.now() / 1000) + 30  // _endTimeContest (now + 30s)
  );
  await tx.wait();

  const contestId = await Factory.contestId();
  // ethers v6 uses subtract instead of sub
  const newContestAddress = await Factory.contestAddress(contestId - 1n);

  console.log("🎯 New Contest deployed at:", newContestAddress);

  const Contest = await ethers.getContractAt("Contest", newContestAddress);

  // Proceed with original logic
  const handles = ["alice123", "bob456", "charlie789"];

  for (const handle of handles) {
    const contestWithOwner = Contest.connect(ownerWithProvider);
    console.log(`Registering handle '${handle}' from owner ${owner.address}...`);
    const tx = await contestWithOwner.register(handle);
    await tx.wait();
    console.log(`Registered '${handle}' successfully.`);
  }

  // Wait for 20 seconds before ending the contest
  console.log("⏳ Waiting 25 seconds before contest finishes...");
  await delay(25_000); // 20 seconds

  const generatedSeed = ethers.encodeBytes32String("random-seed");

  console.log("Ending contest and requesting random number...");
 

  const endTx = await Contest.endContest(generatedSeed, { value: 150000000000000 });
  await endTx.wait();

  console.log("Contest ended, waiting for winner...");
  const winner = await waitForWinner(Contest);

  console.log("Winner info:", winner);
  console.log("Winning number:", winner.id.toString());
}

main().catch((error) => {
  console.error("❌ Interaction failed:", error);
  process.exit(1);
});
