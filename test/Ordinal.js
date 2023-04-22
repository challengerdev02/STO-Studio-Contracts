const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Ordinals", function () {
    let ordinals;
    let owner;
    let admin;
    let caller;
    let inscriptionId = "test inscription";

    beforeEach(async function () {
        const deployer = await ethers.getSigners();
        ethers.Wallet
        admin = deployer[0];
        owner = deployer[1];
        caller = deployer[2];
        const Ordinals = await ethers.getContractFactory("Ordinals");
        ordinals = await upgrades.deployProxy(Ordinals, [deployer[0].address], { initializer: "initialize" });
        await ordinals.deployed();
    });

    describe("setInscription", function () {
        it("should set inscription when called by admin", async function () {
            await ordinals.setCaller(caller.address, true);
            const hashMessage = await ordinals.hashMessage(owner.address, 0, inscriptionId);
            const signature = await caller.signMessage(ethers.utils.arrayify(hashMessage));
            await ordinals.connect(caller).setInscription(owner.address, 0, inscriptionId, signature);
            expect(await ordinals._inscription(owner.address, 0)).to.equal(inscriptionId);
        });

        it("should set inscription when called by caller with admin approval", async function () {
            const hashMessage = await ordinals.hashMessage(owner.address, 0, inscriptionId);
            const signature = await admin.signMessage(ethers.utils.arrayify(hashMessage));
            await ordinals.connect(admin).setInscription(owner.address, 0, inscriptionId, signature);
            expect(await ordinals._inscription(owner.address, 0)).to.equal(inscriptionId);
        });

        it("should not set inscription when called by unapproved caller", async function () {
            const hashMessage = await ordinals.hashMessage(owner.address, 0, inscriptionId);
            const signature = await caller.signMessage(ethers.utils.arrayify(hashMessage));
            await expect(
                ordinals.connect(caller).setInscription(owner.address, 0, inscriptionId, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should not set inscription for an already-inscribed token", async function () {
            await ordinals.setCaller(caller.address, true);
            const hashMessage = await ordinals.hashMessage(owner.address, 0, inscriptionId);
            const signature = await caller.signMessage(ethers.utils.arrayify(hashMessage));
            await ordinals.connect(caller).setInscription(owner.address, 0, inscriptionId, signature);
            await expect(
                ordinals.connect(caller).setInscription(owner.address, 0, "new inscription", signature)
            ).to.be.revertedWith("DOUBLE");
        });

        it("should not set inscription when called by non-admin and non-approved caller", async function () {
            await ordinals.setCaller(caller.address, true);
            const hashMessage = await ordinals.hashMessage(owner.address, 0, inscriptionId);
            const signature = await caller.signMessage(ethers.utils.arrayify(hashMessage));
            await expect(
                ordinals.connect(owner).setInscription(owner.address, 0, inscriptionId, signature)
            ).to.be.revertedWith("INV_CALLER");
        });
    });

    describe("changeAdmin", function () {
        it("should change the admin when called by the current admin", async function () {
            await ordinals.changeAdmin(owner.address);
            expect(await ordinals._admin()).to.equal(owner.address);
        });

        it("should not change the admin when called by a non-admin address", async function () {
            await expect(
                ordinals.connect(owner).changeAdmin(admin.address)
            ).to.be.revertedWith("101");
        });
    });

    describe("setCaller", function () {
        it("should set the caller approval when called by the admin", async function () {
            await ordinals.setCaller(caller.address, true);
            expect(await ordinals._caller(caller.address)).to.equal(true);
        });

        it("should not set the caller approval when called by a non-admin address", async function () {
            await expect(
                ordinals.connect(owner).setCaller(caller.address, true)
            ).to.be.revertedWith("INV_CALLER");
        });
    });
});
