import { useMemo } from "react";
import { Abi, Address, getAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

import ContestFactory from "@/abi/ContestFactory.json";
import ContestAbi from "@/abi/Contest.json";
import { ContestData } from "@/types/contest";
import { ContestModel } from "@/models/ContestModel";

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
      abi: ContestAbi.abi,
    };
  }, [contestAddress]);

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      { ...commonConfig, functionName: "twitterStatusId" },
      { ...commonConfig, functionName: "description" },
      { ...commonConfig, functionName: "startTimeContest" },
      { ...commonConfig, functionName: "endTimeContest" },
      { ...commonConfig, functionName: "owner" },
    ],
    query: {
      enabled: !!contestAddress, // Only enable when address exists
    },
  });

  const structuredData: ContestData = {
    twitterStatusId: (data?.[0]?.result as string) ?? null,
    description: (data?.[1]?.result as string) ?? null,
    startTimeContest: (data?.[2]?.result as number) ?? null,
    endTimeContest: (data?.[3]?.result as number) ?? null,
    owner: (data?.[4]?.result as string) ?? null,
  };

  const contest = useMemo(
    () => new ContestModel(structuredData),
    [structuredData]
  );

  return { data: contest, isLoading, error };
}
