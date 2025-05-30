"use client";

import { useEffect, useState } from "react";
import { getAddress } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function CreateContest() {
  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      // FIXME: redirect?
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
    writeContract({
      address: getAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS!),
      abi: Contest.abi,
      functionName: "FIXME:",
      args: [
        // FIXME:
      ],
    });
  };

  const isTweetInvalid = newContest.tweetText.length > 280;
  const charsRemaining = 280 - newContest.tweetText.length;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Create New Twitter Contest
      </h2>

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
              placeholder="What should participants tweet to enter?"
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleCreateContest}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold text-lg hover:scale-105"
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold text-lg hover:scale-105"
              >
                Create Tweet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
