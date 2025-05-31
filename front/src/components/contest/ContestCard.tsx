import { useContestDetail } from "@/hooks/contest";
import { useEffect, useState } from "react";
import { TwitterIcon } from "../icon/TwitterIcon";
import { CalendarIcon } from "../icon/CalendarIcon";
import { UsersIcon } from "../icon/UsersIcon";
import { useTwitterAccountProof } from "@/hooks/useTwitterAccountProof";

export const ContestCard = ({ contestAddress }: { contestAddress: string }) => {
  // Read contest data

  const { data: contestModel } = useContestDetail(contestAddress);

  const contest = {
    id: "1",
    title: "NFT Giveaway",
    tweetText: "Win this amazing NFT! Follow and RT to enter! #NFTGiveaway",
    participants: 142,
    endDate: "2023-12-15",
    ended: true,
    winner: "@test",
  };

  const [contestProgress, setContestProgress] = useState(0);

  const {
    requestWebProof,
    webProof,
    callProver,
    isPending,
    isCallProverIdle,
    result,
    error,
  } = useTwitterAccountProof();

  const joinContest = () => {
    console.log("joinContest");

    // FIXME: Maybe provide a single smart contract for twitter verification?
    requestWebProof();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Contest Info */}
        <div className="md:w-3/4 p-6 border-r border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contestModel.isEnded()
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {contestModel.isEnded() ? "Completed" : "Active"}
                </span>
                {contestModel && (
                  <span className="ml-2 flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Ends in {contestModel.getRemainingDays()} days
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg px-3 py-1 flex items-center">
              <UsersIcon className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-sm font-medium text-gray-800">
                {contest.participants} participants
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-100">
              "{contestModel.description}"
            </p>
          </div>

          <div className="mt-5 flex items-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <TwitterIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Creator</p>
                <p className="text-gray-600">@contest_creator</p>
              </div>
            </div>
          </div>

          {!contestModel.isEnded() && (
            <div className="px-2 pt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Contest Progress</span>
                <span>{contestProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  style={{ width: `${contestProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Actions & Status */}
        <div className="md:w-1/4 bg-gray-50 p-6">
          {contestModel.isEnded() ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Winner Selected
                </h4>
                {contest.winner ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">W</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {contest.winner}
                      </p>
                      <p className="text-xs text-gray-600">
                        Grand Prize Winner
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No winner selected</p>
                )}
              </div>

              <div className="mt-auto">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                  View Results
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Prize Pool
                </h4>
                <p className="text-2xl font-bold text-gray-900">1.5 ETH</p>
                <p className="text-sm text-gray-600">≈ $2,850 USD</p>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={joinContest}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  <TwitterIcon className="h-4 w-4 mr-2" />
                  Participate Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
