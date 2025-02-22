import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export const solidity = {
    version: "0.8.28",
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        viaIR: true,
        metadata: {
            bytecodeHash: "none"
        }
    }
};