"use client";

import { useEffect, useState } from "react";
import { Abi, getAddress } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { TwitterIcon } from "../icon/TwitterIcon";

import ContestFactory from "@/abi/ContestFactory.json";
import { useNotification } from "@blockscout/app-sdk";
import { optimismSepolia } from "viem/chains";

export default function CreateContest({
  onContestCreated,
}: {
  onContestCreated: () => void;
}) {
  const { openTxToast } = useNotification();

  const {
    writeContract,
    data: txHash,
    isPending,
    error: errorContract,
  } = useWriteContract();

  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txHash) {
      openTxToast(optimismSepolia.id.toString(), txHash);
    }
  }, [txHash]);

  useEffect(() => {
    if (isSuccess) {
      console.log("Finished");
      onContestCreated();
    }
  }, [isSuccess]);

  const [newContest, setNewContest] = useState({
    tweetText: "",
    endDate: "",
    tweetId: "",
  });

  const [isTweetCreated, setIsTweetCreated] = useState(false);

  const [error, setError] = useState("");

  const handleCreateTweet = () => {
    if (!newContest.tweetText) {
      setError("Tweet text is required");
      return;
    }
    if (newContest.tweetText.length > 280) {
      setError("Tweet exceeds 280 character limit");
      return;
    }

    // Clear errors on successful validation
    setError("");

    console.log("ok?");
    const tweetUrl = new URL("https://twitter.com/intent/tweet");
    tweetUrl.searchParams.set("text", newContest.tweetText);
    window.open(tweetUrl.toString(), "_blank");
    setIsTweetCreated(true);
  };

  const handleCreateContest = () => {
    // Convert End Date to Timestamps
    const endDate = new Date(newContest.endDate);
    const timestamp = Math.floor(endDate.getTime() / 1000);

    writeContract({
      address: getAddress(process.env.NEXT_PUBLIC_CONTEST_FACTORY_ADDRESS!),
      abi: ContestFactory.abi,
      functionName: "createNewContest",
      args: [newContest.tweetId, newContest.tweetText, timestamp],
    });
  };

  const isTweetInvalid = newContest.tweetText.length > 280;
  const charsRemaining = 280 - newContest.tweetText.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <TwitterIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Create a New Contest
        </h2>
        <p className="mt-2 text-gray-600">
          Set up a contest where participants tweet to enter
        </p>
      </div>

      <div className="space-y-6">
        {/* Tweet Text Field */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">
            Contest Tweet
          </label>
          <div className="relative">
            <textarea
              value={newContest.tweetText}
              onChange={(e) =>
                setNewContest({
                  ...newContest,
                  tweetText: e.target.value,
                })
              }
              rows={4}
              className={`w-full px-4 py-3 border ${
                isTweetInvalid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 text-gray-600`}
              placeholder="e.g., NFT Giveaway"
            />
            <div
              className={`absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                isTweetInvalid
                  ? "bg-red-100 text-red-800"
                  : charsRemaining < 20
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {charsRemaining}
            </div>
          </div>

          <div className="mt-2 flex justify-between">
            <p className="text-sm text-gray-600">
              Participants will see this exact tweet
            </p>
            {isTweetInvalid && (
              <p className="text-sm font-medium text-red-600">
                Tweet exceeds 280 characters
              </p>
            )}
          </div>
        </div>

        {/* End Date Field */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={newContest.endDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setNewContest({ ...newContest, endDate: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600"
            />
            <p className="mt-2 text-sm text-gray-600">
              Contest will automatically end on this date
            </p>
          </div>
        </div>

        {isTweetCreated && (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Tweet Status ID
                </label>
                <input
                  type="text"
                  value={newContest.tweetId}
                  onChange={(e) =>
                    setNewContest({ ...newContest, tweetId: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Status ID defined of your tweet
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorContract && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">
                  {errorContract.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleCreateContest}
                className={`w-full py-4 px-4 rounded-lg font-bold text-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !newContest.tweetId
                    ? "bg-gray-400 cursor-not-allowed shadow-none hover:from-blue-600 hover:to-indigo-700 hover:shadow-none scale-100"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg hover:scale-105 focus:ring-blue-500"
                }`}
                disabled={!newContest.tweetId}
              >
                Create Contest
              </button>
            </div>
          </>
        )}

        {!isTweetCreated && (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleCreateTweet}
                className={`w-full py-4 px-4 rounded-lg font-bold text-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !newContest.endDate || !newContest.tweetText
                    ? "bg-gray-400 cursor-not-allowed shadow-none hover:from-blue-600 hover:to-indigo-700 hover:shadow-none scale-100"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg hover:scale-105 focus:ring-blue-500"
                }`}
                disabled={!newContest.endDate || !newContest.tweetText}
              >
                Create Tweet
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
