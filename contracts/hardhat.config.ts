// hardhat.config.ts
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
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
      accounts: [process.env.PRIVATE_KEY!,
      process.env.ACCOUNT_2_PRIVATE_KEY!,
      process.env.ACCOUNT_3_PRIVATE_KEY!,
      process.env.ACCOUNT_4_PRIVATE_KEY!,
      ],
      chainId: 11155420,
    },
  },
  etherscan: {
    apiKey: {
      optimismSepolia: process.env.OPTIMISM_SEPOLIA_API_KEY!,
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimistic.etherscan.io"
        }
      }
    ]
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://api-sepolia-optimistic.etherscan.io/api",
    browserUrl: "https://sepolia-optimistic.etherscan.io",
  }
};

export default config;
