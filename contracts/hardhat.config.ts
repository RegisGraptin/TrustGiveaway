// hardhat.config.ts
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-foundry";
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.18" },
      { version: "0.8.20" },
      { version: "0.8.27" },
    ],
  },
  networks: {
    optimismSepolia: {
      url: process.env.ALCHEMY_OPTIMISM_SEPOLIA_URL!,
      accounts: [
        process.env.PRIVATE_KEY!,
        // FIXME: Should only have one address here
        // process.env.ACCOUNT_2_PRIVATE_KEY!,
        // process.env.ACCOUNT_3_PRIVATE_KEY!,
        // process.env.ACCOUNT_4_PRIVATE_KEY!,
      ],
      chainId: 11155420,
    },
  },
  etherscan: {
    apiKey: {
      optimismSepolia:  process.env.ETHERSCAN_OPTIMISM_SEPOLIA_API_KEY!,  // FIXME: Variable name not clear - Need prefix with "etherscan"
    },
    customChains: [
      {
        network: "optimism-sepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://optimism-sepolia.blockscout.com/api",
          browserURL: "https://optimism-sepolia.blockscout.com/"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};

export default config;
