const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);
    const proxyAddress = '0xa7BB4d073FF1a67252B992B7c25b6F2cBe596a41';
    // We get the contract to deploy
    const Ordinals = await ethers.getContractFactory("Ordinals");
    console.log("Preparing upgrade...");
    const MyContract = await upgrades.upgradeProxy(proxyAddress, Ordinals);
    const myContract = await MyContract.deploy();

    console.log('MyContract deployed to:', myContract.address);

    const data = {
        address: myContract.address
    };

    fs.writeFileSync('contract-address.json', JSON.stringify(data));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
