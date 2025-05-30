import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { optimismSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_SITE_NAME!,
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  chains: [optimismSepolia],
  transports: {
    [optimismSepolia.id]: http(
      `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
    ),
  },
  ssr: true,
});
