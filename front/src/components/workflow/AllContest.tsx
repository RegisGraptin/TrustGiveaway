"use client";

import { ContestCard } from "../contest/ContestCard";
import { useContests, uselastContestId } from "@/hooks/contest";
import { TwitterIcon } from "../icon/TwitterIcon";
import { useTwitterAccountVerified } from "@/hooks/useTwitterAccountProof";
import { ProofProvider } from "@vlayer/react";

export function AllContest() {
  const { data: isTwitterAccountVerified } = useTwitterAccountVerified();

  const { data: lastContestId } = uselastContestId();
  const { data: contestAddresses, isLoading } = useContests(
    lastContestId as bigint
  );

  return (
    <ProofProvider
      config={{
        proverUrl: process.env.NEXT_PUBLIC_PROVER_URL,
        wsProxyUrl: process.env.NEXT_PUBLIC_WS_PROXY_URL,
        notaryUrl: process.env.NEXT_PUBLIC_NOTARY_URL,
        token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN_V2,
      }}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Contest</h2>
          <p className="text-gray-600">
            {lastContestId as string} contests created
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contestAddresses && contestAddresses.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <TwitterIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No contests created yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first contest to start engaging with the community
            </p>
            <button
              // onClick={() => setActiveTab("create")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Contest
            </button>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {contestAddresses &&
              contestAddresses.map((contestResult, index) => (
                <ContestCard
                  key={index}
                  contestAddress={contestResult.result as string}
                  joinEnable={isTwitterAccountVerified as boolean}
                />
              ))}
          </div>
        )}
      </div>
    </ProofProvider>
  );
}
