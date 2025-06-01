import { getAddress } from "viem";
import { useReadContract } from "wagmi";

import ContestFactory from "@/abi/ContestFactory.json";

export function usePrice() {
  return useReadContract({
    address: getAddress(process.env.NEXT_PUBLIC_CONTEST_FACTORY_ADDRESS!),
    abi: ContestFactory.abi,
    functionName: "getLastETHPrice",
    args: [],
  });
}
