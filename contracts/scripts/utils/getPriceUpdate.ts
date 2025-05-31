import { HermesClient } from "@pythnetwork/hermes-client";
import { ethers } from "ethers";

export async function getPythPriceUpdate(priceId: string): Promise<Uint8Array> {
  const hermes = new HermesClient("https://hermes.pyth.network");

  try {
    const updateData = await hermes.getLatestPriceUpdates([priceId]);

    const hexString = updateData.binary?.data?.[0]; // Hermes now returns hex!
    if (!hexString) {
      throw new Error("No valid price update returned from Hermes for: " + priceId);
    }

    return ethers.utils.arrayify("0x" + hexString); // Convert hex → bytes
  } catch (error) {
    console.error("❌ Failed to fetch price update from Hermes:", error);
    throw error;
  }
}
