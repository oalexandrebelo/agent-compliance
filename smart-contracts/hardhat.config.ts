/* eslint-disable */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ARC_TESTNET_RPC = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        arc_testnet: {
            url: ARC_TESTNET_RPC,
            accounts: [PRIVATE_KEY]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
