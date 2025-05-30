"use client";

import { useState } from "react";
import { ContestCard } from "../contest/ContestCard";

export function ParticipatedContest() {
  const [isLoading, setIsLoading] = useState(false);
  const [participatedContests, setParticipatedContests] = useState([
    {
      id: "4",
      title: "Web3 Hackathon",
      tweetText:
        "Join our Web3 hackathon! Build something awesome and win big! #Web3Hackathon",
      participants: 210,
      endDate: "2023-12-18",
      ended: false,
      winner: null,
    },
    {
      id: "5",
      title: "DAO Governance",
      tweetText:
        "Share your ideas for DAO governance improvements! Best idea wins governance tokens! #DAO",
      participants: 92,
      endDate: "2023-12-05",
      ended: true,
      winner: "@dao_enthusiast",
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Contests I've Participated In
        </h2>
        <p className="text-gray-600">
          {participatedContests.length} contests joined
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : participatedContests.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {/* <TwitterIcon className="h-8 w-8 text-blue-500" /> */}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No contests joined yet
          </h3>
          <p className="text-gray-600 mb-6">
            Browse active contests and participate to win exciting prizes
          </p>
          <button
            // onClick={() => setActiveTab("my-contests")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Contests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participatedContests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              isParticipated={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
