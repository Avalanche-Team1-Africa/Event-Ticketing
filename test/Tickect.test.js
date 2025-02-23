const { buildModule } = "@nomicfoundation/hardhat-ignition";
const { expect } = "chai";
const { ethers, hre } = "hardhat";
const { describe, it, beforeEach } = "mocha";

describe("Ticket Contract", function () {
    let ticketContract;
    let owner;
    let buyer;
    let module;

    // Defining the Ignition module
    const TicketModule = buildModule("TicketModule", (m) => {
        const ticket = m.contract("Ticket", ["Event Ticket", "TIX"]);
        return { ticket };
    });

    beforeEach(async function () {
        // Getting signers
        [owner, buyer] = await ethers.getSigners();

        // Deploying the contract using Ignition
        module = await hre.ignition.deploy(TicketModule);
        ticketContract = await module.ticket.deployed();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await ticketContract.name()).to.equal("Event Ticket");
            expect(await ticketContract.symbol()).to.equal("TIX");
        });

        it("Should set the correct owner", async function () {
            expect(await ticketContract.owner()).to.equal(owner.address);
        });
    });

    describe("Minting Tickets", function () {
        const occasionId = 1;
        const seatNumber = 100;
        const price = ethers.parseEther("0.1");

        it("Should allow owner to mint tickets", async function () {
            await ticketContract.createTicket(occasionId, seatNumber, price);
            const tokenId = await ticketContract.getTokenId(occasionId, seatNumber);

            const ticketDetails = await ticketContract.ticketDetails(tokenId);
            expect(ticketDetails.occasionId).to.equal(occasionId);
            expect(ticketDetails.seatNumber).to.equal(seatNumber);
        });

        it("Should not allow non-owner to mint tickets", async function () {
            await expect(ticketContract.connect(buyer).createTicket(occasionId, seatNumber, price)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Ticket Validation", function () {
        it("Should validate valid tickets", async function () {
            await ticketContract.createTicket(1, 100, ethers.parseEther("0.1"));
            await ticketContract.connect(buyer).buyTicket(1, {
                value: ethers.parseEther("0.1")
            });

            expect(await ticketContract.validateTicket(1)).to.be.true;
        });

        it("Should not validate non-existent tickets", async function () {
            await expect(ticketContract.validateTicket(999))
              .to.be.revertedWith("ERC721: invalid token ID");
        });
    });
});