// test/crowdfunding.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding contract", function () {
    let crowdfunding;
    let owner;
    let donor;
    let recipient;
    let campaignId;
    
    beforeEach(async function () {
        [owner, donor, recipient] = await ethers.getSigners();
        
        // Deploy Crowdfunding contract
        const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
        crowdfunding = await Crowdfunding.deploy();
        await crowdfunding.deployed();
    });

    it("should create a campaign", async function () {
        const goalAmount = ethers.utils.parseEther("1.0"); // 1 ETH
        const deadline = (Math.floor(Date.now() / 1000)) + 3600; // 1 hour from now
        
        // Create a campaign
        await expect(crowdfunding.createCampaign(recipient.address, goalAmount, deadline))
            .to.emit(crowdfunding, "CampaignCreated")
            .withArgs(1, recipient.address, goalAmount, deadline);

        const campaign = await crowdfunding.campaigns(1);
        expect(campaign.recipient).to.equal(recipient.address);
        expect(campaign.goalAmount).to.equal(goalAmount);
        expect(campaign.deadline).to.equal(deadline);
        expect(campaign.totalDonations).to.equal(0);
        expect(campaign.isClosed).to.equal(false);
    });

    it("should allow donations", async function () {
        const goalAmount = ethers.utils.parseEther("1.0");
        const deadline = (Math.floor(Date.now() / 1000)) + 3600;
        
        await crowdfunding.createCampaign(recipient.address, goalAmount, deadline);
        
        const donationAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH
        await expect(crowdfunding.connect(donor).donate(1, { value: donationAmount }))
            .to.emit(crowdfunding, "Donated")
            .withArgs(1, donor.address, donationAmount);

        const campaign = await crowdfunding.campaigns(1);
        expect(campaign.totalDonations).to.equal(donationAmount);
    });

    it("should close campaign and transfer funds if goal is reached", async function () {
        const goalAmount = ethers.utils.parseEther("1.0");
        const deadline = (Math.floor(Date.now() / 1000)) + 3600;
        
        await crowdfunding.createCampaign(recipient.address, goalAmount, deadline);
        
        const donationAmount = ethers.utils.parseEther("1.0");
        await crowdfunding.connect(donor).donate(1, { value: donationAmount });
        
        await expect(crowdfunding.connect(recipient).closeCampaign(1))
            .to.emit(crowdfunding, "CampaignClosed")
            .withArgs(1, true);

        const recipientBalance = await ethers.provider.getBalance(recipient.address);
        expect(recipientBalance).to.be.above(ethers.utils.parseEther("100")); // Assuming recipient had 100 ETH before
    });

    it("should allow refund if campaign fails", async function () {
        const goalAmount = ethers.utils.parseEther("1.0");
        const deadline = (Math.floor(Date.now() / 1000)) + 3600;
        
        await crowdfunding.createCampaign(recipient.address, goalAmount, deadline);
        
        const donationAmount = ethers.utils.parseEther("0.5");
        await crowdfunding.connect(donor).donate(1, { value: donationAmount });

        // Simulate campaign failure by closing it after deadline
        await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour (past deadline)
        await network.provider.send("evm_mine");

        await expect(crowdfunding.connect(recipient).closeCampaign(1))
            .to.emit(crowdfunding, "CampaignClosed")
            .withArgs(1, false);
        
        // Refund donation
        const initialBalance = await ethers.provider.getBalance(donor.address);
        await expect(crowdfunding.connect(donor).refund(1))
            .to.changeEtherBalance(donor, donationAmount);
    });
});
