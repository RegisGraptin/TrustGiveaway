"use client";

import { useState } from "react";
import { ContestCard } from "../contest/ContestCard";

export function MyContest() {
  const [isLoading, setIsLoading] = useState(false);
  const [contests, setContests] = useState([
    {
      id: "1",
      title: "NFT Giveaway",
      tweetText: "Win this amazing NFT! Follow and RT to enter! #NFTGiveaway",
      participants: 142,
      endDate: "2023-12-15",
      ended: false,
      winner: null,
    },
    {
      id: "2",
      title: "Crypto Art Contest",
      tweetText:
        "Show us your best crypto art! The most creative wins 1 ETH! #CryptoArt",
      participants: 87,
      endDate: "2023-12-20",
      ended: false,
      winner: null,
    },
    {
      id: "3",
      title: "DeFi Education",
      tweetText:
        "Share your best DeFi learning resource! Top 3 get $500 in crypto! #DeFi",
      participants: 56,
      endDate: "2023-12-10",
      ended: true,
      winner: "@crypto_learner",
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Contests</h2>
        <p className="text-gray-600">{contests.length} contests created</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            {/* <TwitterIcon className="h-8 w-8 text-gray-500" /> */}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No contests created yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first contest to start engaging with the community
          </p>
          <button
            onClick={() => setActiveTab("create")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Contest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              isParticipated={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
