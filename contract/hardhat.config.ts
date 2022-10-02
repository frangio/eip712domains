import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "dotenv/config";

const accounts = process.env.PK ? [ process.env.PK ] : [];

export default <HardhatUserConfig> {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    ethereum: {
      url: 'https://cloudflare-eth.com',
      chainId: 1,
      accounts,
    }
  },
};
