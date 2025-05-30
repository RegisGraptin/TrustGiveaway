import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    verify?: {
      apiKey?: string;
      customChains?: Array<{
        network: string;
        chainId: number;
        urls: {
          apiURL: string;
          browserURL: string;
        };
      }>;
    };
  }
}
