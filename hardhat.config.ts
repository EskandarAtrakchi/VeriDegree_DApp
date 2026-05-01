import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig, configVariable } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],

  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  mocha: {
    timeout: 40000,
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },

    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});
