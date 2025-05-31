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
// import webProofProver from "../../../out/WebProofProver.sol/WebProofProver";

import TwitterAccountVerifier from "@/abi/TwitterAccountVerifier.json";
import TwitterProver from "@/abi/TwitterProver.json";
import { useAccount } from "wagmi";
import { optimismSepolia } from "viem/chains";

const webProofConfig: WebProofConfig<Abi, string> = {
  proverCallCommitment: {
    address: "0x0000000000000000000000000000000000000000",
    proverAbi: [],
    functionName: "proveWeb",
    commitmentArgs: [],
    chainId: optimismSepolia.id,
  },
  logoUrl: "http://twitterswap.com/logo.png",
  steps: [
    startPage("https://x.com/", "Go to x.com login page"),
    expectUrl("https://x.com/home", "Log in"),
    notarize(
      "https://api.x.com/1.1/account/settings.json",
      "GET",
      "Generate Proof of Twitter profile",
      [
        {
          request: {
            // redact all the headers
            headers_except: [],
          },
        },
        {
          response: {
            // response from api.x.com sometimes comes with Transfer-Encoding: Chunked
            // which needs to be recognised by Prover and cannot be redacted
            headers_except: ["Transfer-Encoding"],
          },
        },
      ]
    ),
  ],
};

export const useTwitterAccountProof = () => {
  const [error, setError] = useState<Error | null>(null);

  const {
    requestWebProof,
    webProof,
    isPending: isWebProofPending,
    error: webProofError,
  } = useWebProof(webProofConfig);

  console.log(webProofError);

  if (webProofError) {
    throw new WebProofError(webProofError.message);
  }

  const vlayerProverConfig: Omit<
    ProveArgs<Abi, ContractFunctionName<Abi>>,
    "args"
  > = {
    address: process.env.NEXT_PUBLIC_TWITTER_PROVER_URL as Address,
    proverAbi: TwitterProver.abi as Abi,
    chainId: 11155420,
    functionName: "proofOfAccount",
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

  const [, setWebProof] = useLocalStorage("webProof", "");
  const [, setProverResult] = useLocalStorage("proverResult", "");

  useEffect(() => {
    if (webProof) {
      console.log("webProof", webProof);
      setWebProof(JSON.stringify(webProof));
    }
  }, [JSON.stringify(webProof)]);

  useEffect(() => {
    if (result) {
      console.log("proverResult", result);
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
