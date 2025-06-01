import { useEffect, useState } from "react";
import {
  useCallProver,
  useWaitForProvingResult,
  useWebProof,
  useChain,
} from "@vlayer/react";
import { useLocalStorage } from "usehooks-ts";
import { WebProofConfig, ProveArgs } from "@vlayer/sdk";
import { Abi, Address, ContractFunctionName } from "viem";
import { startPage, expectUrl, notarize } from "@vlayer/sdk/web_proof";
import { UseChainError, WebProofError } from "../errors";

import TwitterProver from "@/abi/TwitterProver.json";

export const useTwitterPostProof = (url: string) => {
  const match = url.match(/\/status\/(\d+)$/);

  const statusId = match ? match[1] : "";

  const webProofConfig: WebProofConfig<Abi, string> = {
    proverCallCommitment: {
      address: "0x0000000000000000000000000000000000000000",
      proverAbi: [],
      functionName: "proveWeb",
      commitmentArgs: [],
      chainId: 1,
    },
    logoUrl: "http://twitterswap.com/logo.png",
    steps: [
      startPage(url, "Go to x.com login page"),
      expectUrl(url, "Log in"),
      notarize(
        `https://x.com/i/api/graphql/*/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${statusId}*`,
        "GET",
        "Prove response to a specific tweet",
        [
          {
            request: {
              headers_except: [],
            },
          },
          {
            response: {
              headers_except: ["Transfer-Encoding"],
            },
          },
        ]
      ),
    ],
  };

  const [error, setError] = useState<Error | null>(null);

  const {
    requestWebProof,
    webProof,
    isPending: isWebProofPending,
    error: webProofError,
  } = useWebProof(webProofConfig);

  if (webProofError) {
    throw new WebProofError(webProofError.message);
  }

  const { chain, error: chainError } = useChain(
    process.env.NEXT_PUBLIC_CHAIN_NAME
  );

  useEffect(() => {
    if (chainError) {
      setError(new UseChainError(chainError));
    }
  }, [chainError]);

  const vlayerProverConfig: Omit<
    ProveArgs<Abi, ContractFunctionName<Abi>>,
    "args"
  > = {
    address: process.env.NEXT_PUBLIC_TWITTER_PROVER_URL as Address,
    proverAbi: TwitterProver.abi as Abi,
    chainId: 11155420,
    functionName: "proofOfPost",
  };

  const {
    callProver,
    isPending: isCallProverPending,
    isIdle: isCallProverIdle,
    data: hash,
    error: callProverError,
  } = useCallProver(vlayerProverConfig);

  if (callProverError) {
    throw callProverError;
  }

  const {
    isPending: isWaitingForProvingResult,
    data: result,
    error: waitForProvingResultError,
  } = useWaitForProvingResult(hash);

  if (waitForProvingResultError) {
    throw waitForProvingResultError;
  }

  const [, setWebProof] = useLocalStorage("webProofPost", "");
  const [, setProverResult] = useLocalStorage("proverResultPost", "");

  useEffect(() => {
    if (webProof) {
      setWebProof(JSON.stringify(webProof));
    }
  }, [JSON.stringify(webProof)]);

  useEffect(() => {
    if (result) {
      setProverResult(JSON.stringify(result));
    }
  }, [JSON.stringify(result)]);

  return {
    requestWebProof,
    webProof,
    isPending:
      isWebProofPending || isCallProverPending || isWaitingForProvingResult,
    isCallProverIdle,
    isWaitingForProvingResult,
    isWebProofPending,
    callProver,
    result,
    error,
  };
};
