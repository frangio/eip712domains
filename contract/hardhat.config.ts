import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "dotenv/config";

const accounts = process.env.PK ? [ process.env.PK ] : [];

export default <HardhatUserConfig> {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    ethereum: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA}`,
      chainId: 1,
      accounts,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  }
};
