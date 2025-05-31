import fetch from "node-fetch";

/**
 * Fetches a serialized price update from Hermes for a given Pyth price feed ID.
 * Docs: https://docs.pyth.network/price-feeds/fetch-price-updates
 */
export async function getPythPriceUpdate(priceId: string): Promise<string> {
  const url = `https://hermes.pyth.network/v2/updates/price/latest`;
  const body = {
    ids: [priceId],
    binary: true, // Request the update in base64-encoded binary
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Failed to fetch price update from Hermes: ${errorText}`);
}
  const json:any= await response.json();
  const base64Update: string = json.binary;

  // ethers.js expects bytes, not base64, so decode it
  const updateBytes = Buffer.from(base64Update, "base64").toString("hex");
  return "0x" + updateBytes;
}
