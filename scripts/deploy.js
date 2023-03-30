const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);

    const MyContract = await ethers.getContractFactory('Ordinals');
    const myContract = await upgrades.deployProxy(MyContract, ["0x6BB7cbb2965C108db26edC911045Fe27Ab599104", "0x6BB7cbb2965C108db26edC911045Fe27Ab599104"], { initializer: "initialize" });

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
