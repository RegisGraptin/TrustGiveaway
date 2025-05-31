import { ethers } from "hardhat";
import fs from "fs";
import { getPythPriceUpdate } from "./utils/getPriceUpdate";
import { BigNumber } from "ethers";

async function main() {
  const [owner] = await ethers.getSigners();
  const { contestFactory } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  const Factory = await ethers.getContractAt("ContestFactory", contestFactory, owner);

  console.log("Creating contest from factory...");
  const endTime = Math.floor(Date.now() / 1000) + 60; // contest ends in 60s

  const tx = await Factory.createNewContest(
    "123456789012345678",                 // _twitterStatusId
    "Testing the Pyth PriceFeed logic",   // _description
    endTime                                // _endTimeContest
  );
  await tx.wait();

  const contestId: BigNumber = await Factory.contestId();
  const newContestAddress: string = await Factory.contestAddress(contestId.sub(1));

  console.log("🎯 New Contest deployed at:", newContestAddress);

  const Contest = await ethers.getContractAt("Contest", newContestAddress, owner);

  // --- PYTH SECTION ---
  const priceFeedId =
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD

  const priceUpdate = await getPythPriceUpdate(priceFeedId);

  // Get fee required for the update
  const pythContractAddress = "0x0708325268dF9F66270F1401206434524814508b"; // Pyth PriceFeed OP Sepolia
  const pyth = await ethers.getContractAt("IPyth", pythContractAddress, owner);

  const fee = await pyth.getUpdateFee([priceUpdate]);
  console.log("💰 Update fee:", ethers.utils.formatEther(fee), "ETH");

  const updateTx = await Contest.exampleMethod([priceUpdate], {
    value: fee,
  });
  const receipt = await updateTx.wait();

  // Listen for the PriceUpdated event
  const event = receipt.events?.find((e:any) => e.event === "PriceUpdated");
  if (event) {
    const [price, conf, publishTime] = event.args!;
    console.log(`📈 Price: ${price}, Confidence: ${conf}, Published At: ${publishTime}`);
  } else {
    console.error("❌ PriceUpdated event not emitted");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
