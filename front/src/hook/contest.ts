import { Abi, Address, getAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

import ContestFactory from "@/abi/ContestFactory.json";
import Contest from "@/abi/Contest.json";
import { useMemo } from "react";

export function uselastContestId() {
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

export function useContestDetail(contestAddress: Address | string | undefined) {
  const commonConfig = useMemo(() => {
    if (!contestAddress) return null;
    return {
      address: getAddress(contestAddress as string),
      abi: Contest.abi,
    };
  }, [contestAddress]);

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      { ...commonConfig, functionName: "twitterStatusId" },
      { ...commonConfig, functionName: "description" },
      { ...commonConfig, functionName: "endTimeContest" },
      { ...commonConfig, functionName: "owner" },
    ],
    query: {
      enabled: !!contestAddress, // Only enable when address exists
    },
  });

  const structuredData = {
    twitterStatusId: data?.[0]?.result ?? null,
    description: data?.[1]?.result ?? null,
    endTimeContest: data?.[2]?.result ?? null,
    owner: data?.[3]?.result ?? null,
  };

  return { data: structuredData, isLoading, error };
}
