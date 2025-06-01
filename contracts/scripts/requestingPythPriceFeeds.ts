import { ethers } from "hardhat";
import { formatEther } from "ethers";
import fs from "fs";
import { getPythPriceUpdate } from "./utils/getPriceUpdate";

async function main() {
  const [owner] = await ethers.getSigners();

  const { contestFactory } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  const Factory = await ethers.getContractAt("ContestFactory", contestFactory);

  console.log("Creating contest from factory...");
  const endTime = Math.floor(Date.now() / 1000) + 60;

  const tx = await Factory.createNewContest(
    "123456789012345678",
    "Testing the Pyth PriceFeed logic",
    endTime
  );
  const receipt = await tx.wait();

  const contestId = await Factory.contestId();
  const newContestAddress: string = await Factory.contestAddress(contestId - 1n);

  console.log("🎯 New Contest deployed at:", newContestAddress);

  const Contest = await ethers.getContractAt("Contest", newContestAddress);

  const priceFeedId =
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

  const priceUpdate = await getPythPriceUpdate(priceFeedId);

  const pythContractAddress = "0x0708325268dF9F66270F1401206434524814508b";
  const pyth = await ethers.getContractAt("IPyth", pythContractAddress);

  const fee = await pyth.getUpdateFee([priceUpdate]);
  console.log("💰 Update fee:", formatEther(fee), "ETH");

  const updateTx = await Contest.updateETHPrice([priceUpdate], { value: fee });
  const updateReceipt = await updateTx.wait();

  // Manually compute event topic hash
  const eventSignature = "PriceUpdated(int64,uint64,uint256)";
  const priceUpdatedEventSig = ethers.id(eventSignature);

  // Minimal ABI for decoding the event
  const eventAbi = [
    "event PriceUpdated(int64 price, uint64 confidence, uint256 publishTime)"
  ];
  const iface = new ethers.Interface(eventAbi);

  // Filter logs by event topic
  const priceUpdatedLogs = updateReceipt.logs.filter(
    (log: any) => log.topics[0] === priceUpdatedEventSig
  );

  for (const log of priceUpdatedLogs) {
    try {
      const parsed = iface.parseLog(log);
      const [price, confidence, publishTime] = parsed.args;
      console.log(
        `📈 Price: ${price.toString()}, Confidence: ${confidence.toString()}, Published At: ${publishTime.toString()}`
      );
    } catch (error) {
      console.error("⚠️ Failed to parse log:", error);
    }
  }
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});
