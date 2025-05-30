import { Abi, getAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

import ContestFactory from "@/abi/ContestFactory.json";

export function uselastContestId() {
  console.log(process.env.NEXT_PUBLIC_CONTEST_FACTORY_ADDRESS!);

  return useReadContract({
    address: getAddress(process.env.NEXT_PUBLIC_CONTEST_FACTORY_ADDRESS!),
    abi: ContestFactory.abi,
    functionName: "contestId",
    args: [],
  });
}

export function useContests(lastContestId: bigint) {
  return useReadContracts({
    contracts: Array.from({ length: Number(lastContestId) }).map(
      (_, index) => ({
        address: getAddress(process.env.NEXT_PUBLIC_CONTEST_FACTORY_ADDRESS!),
        abi: ContestFactory.abi as Abi,
        functionName: "contestAddress",
        args: [index],
      })
    ),
  });
}
