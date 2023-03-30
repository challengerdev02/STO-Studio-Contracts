require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');

module.exports = {
    networks: {
        bscTestnet: {
            url: process.env.BSC_TESTNET_RPC_URL,
            chainId: 97,
            gasPrice: 20000000000,
            accounts: [`0x${process.env.TEST_PRIVATE_KEY}`]
        },
        bscMainnet: {
            url: process.env.BSC_MAINNET_RPC_URL,
            chainId: 56,
            gasPrice: 20000000000,
            accounts: [`0x${process.env.MAIN_PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY
    },
    solidity: {
        version: '0.8.9',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    mocha: {
        timeout: 20000
    }
};
