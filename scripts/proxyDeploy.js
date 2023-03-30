const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);
    const implementAddress = "0x5204720783e33e3042d8E82dFDF6E4F3f8B23037";
    const MyContract = await ethers.getContractFactory('TransparentUpgradeableProxy');
    const myContract = await MyContract.deploy(implementAddress, "0x6BB7cbb2965C108db26edC911045Fe27Ab599104", []);

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
