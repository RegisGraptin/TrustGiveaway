"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { WagmiProvider } from "wagmi";
import { config } from "../../utils/wagmi";
import { ProofProvider } from "@vlayer/react";

export const client = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ProofProvider
            config={{
              proverUrl: process.env.NEXT_PUBLIC_PROVER_URL,
              wsProxyUrl: process.env.NEXT_PUBLIC_WS_PROXY_URL,
              notaryUrl: process.env.NEXT_PUBLIC_NOTARY_URL,
              token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN,
            }}
          >
            {children}
          </ProofProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
