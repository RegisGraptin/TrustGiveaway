import { ethers } from "hardhat";
import { formatEther } from "ethers";
import fs from "fs";
import { getPythPriceUpdate } from "./utils/getPriceUpdate";

async function main() {
  // Get signer from Hardhat runtime environment's ethers provider
  const [owner] = await ethers.getSigners();

  const { contestFactory } = JSON.parse(fs.readFileSync("./deployed.json", "utf-8"));

  // ethers.getContractAt returns Contract directly (no need to await)
  const Factory = await ethers.getContractAt("ContestFactory", contestFactory);

  console.log("Creating contest from factory...");
  const endTime = Math.floor(Date.now() / 1000) + 60; // contest ends in 60s

  const tx = await Factory.createNewContest(
    "123456789012345678",                 // _twitterStatusId
    "Testing the Pyth PriceFeed logic",  // _description
    endTime                              // _endTimeContest
  );

  const receipt = await tx.wait();

  // contestId is BigNumber - ethers v6 still supports .sub
  const contestId = await Factory.contestId();
  const newContestAddress: string = await Factory.contestAddress(contestId -1n);

  console.log("🎯 New Contest deployed at:", newContestAddress);

  const Contest = await ethers.getContractAt("Contest", newContestAddress);

  // --- PYTH SECTION ---
  const priceFeedId =
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD

  const priceUpdate = await getPythPriceUpdate(priceFeedId);

  // Pyth PriceFeed OP Sepolia
  const pythContractAddress = "0x0708325268dF9F66270F1401206434524814508b";
  const pyth = await ethers.getContractAt("IPyth", pythContractAddress);

  const fee = await pyth.getUpdateFee([priceUpdate]);
  console.log("💰 Update fee:", formatEther(fee), "ETH");

  const updateTx = await Contest.getETHPriceForUSD([priceUpdate], {
    value: fee,
  });

  const updateReceipt = await updateTx.wait();

  // Find event - ethers v6 event args are typed better but still accessed similarly
const event = updateReceipt.events?.find((e:any) => e.event === "PriceUpdated");
if (event && event.args) {
  // event.args is typically a Result object (array-like + object)
  const [price, conf, publishTime] = event.args;
  console.log(`📈 Price: ${price}, Confidence: ${conf}, Published At: ${publishTime}`);
} else {
  console.error("❌ PriceUpdated event not emitted");
}
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
