import { ethers } from "hardhat";
import fs from "fs";
import axios from "axios"

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
  const { address } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  // Connect contract to owner signer
  const ContestFactory = await ethers.getContractAt("ContestFactory", address, owner);

  console.log("Creating contest...");
  await (await ContestFactory.connect(owner).createContest()).wait();

  const handles = ["alice123", "bob456", "charlie789"];
  const signers = [account2, account3, account4];

  for (let i = 0; i < signers.length; i++) {
    await (await ContestFactory.connect(signers[i]).register(handles[i])).wait();
    console.log(`Registered ${handles[i]} from ${signers[i].address}`);
  }

  const entropyProvider = "0x4821932D0CDd71225A6d914706A621e0389D7061";
  const dummyEntropy = ethers.utils.formatBytes32String("random-seed");
  console.log(dummyEntropy)

  // Get fee for entropy request

console.log("Ending contest and requesting random number...");

const fee = await ContestFactory.getEntropyFee(entropyProvider);
await (await ContestFactory.endContest(dummyEntropy, { value: 100000000000000 })).wait();

console.log("Contest ended, waiting for winner...");


  // Wait and poll for winner
  const winner = await waitForWinner(ContestFactory);
  console.log("Winner info:", winner);
  console.log("Winning number:", winner.id.toString());

  // Requesting priceFeeds
  const priceIds = [
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
  ];

const priceIdsQuery = priceIds.join(",");

const url = `https://xc-testnet.pyth.network/api/latest_price_feed_update_data?ids=${priceIdsQuery}`;

const response = await axios.get(url, {
  responseType: "arraybuffer",  // To receive raw binary data
});


  const updateData = [ethers.utils.hexlify(response.data)];

    const feeForPrice = await ContestFactory.pyth().getUpdateFee(updateData);

    const tx = await ContestFactory.exampleMethod(updateData, {
    value: fee,
    gasLimit: 2_000_000, // optionally specify gas limit
  });

  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();

  // Parse logs to find the PriceUpdated event
  const event = receipt.logs
    .map((log:any): any => {
      try {
        return ContestFactory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed:any) => parsed && parsed.name === "PriceUpdated");

  if (event) {
    const { price, confidence, publishTime } = event.args;
    console.log(`Price: ${price.toString()}`);
    console.log(`Confidence: ${confidence.toString()}`);
    console.log(`Published at: ${publishTime.toString()}`);
  } else {
    console.log("PriceUpdated event not found.");
  }
}

main().catch((error) => {
  console.error("❌ Interaction failed:", error);
  process.exit(1);
});
