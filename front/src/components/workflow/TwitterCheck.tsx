"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import { TwitterIcon } from "../icon/TwitterIcon";

import { useTwitterAccountProof } from "@/hooks/useTwitterAccountProof";
import TwitterAccountVerifier from "@/abi/TwitterAccountVerifier.json";
import { getAddress } from "viem";

export default function TwitterVerification() {
  const { address: userAddress } = useAccount();
  const [verificationStep, setVerificationStep] = useState<
    "input" | "tweet" | "verify" | "success"
  >("input");
  const [twitterHandle, setTwitterHandle] = useState("");

  const {
    writeContract,
    data: txHash,
    error: errorContract,
  } = useWriteContract();

  console.log("errorContract:", errorContract);

  const {
    requestWebProof,
    webProof,
    callProver,
    isPending: isPendingProof,
    isCallProverIdle,
    result,
    error,
  } = useTwitterAccountProof();

  const verifyTwitterAccount = () => {
    requestWebProof(); // Generate a ZK Proof of the twitter account
  };

  useEffect(() => {
    if (webProof && isCallProverIdle) {
      console.log("CallProver!");
      void callProver([webProof]);
    }
  }, [webProof, userAddress, callProver, isCallProverIdle]);

  useEffect(() => {
    console.log("result:", result);
    if (result) {
      console.log("result:", result);
      console.log("args:", [result[0], result[1]]);
      writeContract({
        address: getAddress(process.env.NEXT_PUBLIC_TWITTER_VERIFIER_URL!),
        abi: TwitterAccountVerifier.abi,
        functionName: "verifyTwitterAccount",
        args: [result[0], result[1]],
      });
    }
  }, [result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <TwitterIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Twitter Account Verification
        </h2>
        <p className="mt-2 text-gray-600">
          Verify your Twitter ownership using zero-knowledge proofs
        </p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl shadow-md">
        {/* Step 1: Handle Input */}
        {verificationStep === "input" && (
          <div className="space-y-4">
            <div>
              {/* <label className="block text-lg font-medium text-gray-900 mb-2">
                Twitter Handle
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) =>
                    setTwitterHandle(e.target.value.replace("@", ""))
                  }
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="yourhandle"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Enter your Twitter username without the @ symbol
              </p> */}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">{error.message}</p>
              </div>
            )}

            <button
              onClick={verifyTwitterAccount}
              disabled={isPendingProof}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              Generate Verification Code
            </button>
          </div>
        )}

        {/* Step 3: Verification in progress */}
        {verificationStep === "verify" && (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Verifying Ownership
            </h3>
            <p className="mt-2 text-gray-600">
              Generating and verifying zero-knowledge proof...
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {verificationStep === "success" && (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Verification Successful!
            </h3>
            <p className="mt-2 text-gray-600">
              @{twitterHandle} is now verified to your wallet address.
            </p>
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-mono break-all">{userAddress}</p>
            </div>
            <button
              onClick={resetVerification}
              className="mt-6 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Verify Another Account
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
