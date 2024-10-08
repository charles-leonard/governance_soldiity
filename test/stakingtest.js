const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("Staking Contract", function () {  
    let Staking, staking;  
    let Token, token;  
    let owner, addr1, addr2;  
    const rewardRate = 10; // Example reward rate  

    beforeEach(async function () {  
        [owner, addr1, addr2, _] = await ethers.getSigners();  

        // Deploy an ERC20 token for staking  
        const Token = await ethers.getContractFactory("ERC20", owner);  
        token = await Token.deploy("Test Token", "TT", ethers.utils.parseEther("1000"));  
        await token.deployed();  

        // Distribute tokens to addr1 and addr2  
        await token.transfer(addr1.address, ethers.utils.parseEther("100"));  
        await token.transfer(addr2.address, ethers.utils.parseEther("100"));  

        // Deploy the staking contract  
        Staking = await ethers.getContractFactory("Staking", owner);  
        staking = await Staking.deploy(token.address, rewardRate);  
        await staking.deployed();  
    });  

    describe("Staking functionality", function () {  
        it("Should allow users to stake tokens", async function () {  
            await token.connect(addr1).approve(staking.address, ethers.utils.parseEther("10"));  
            await staking.connect(addr1).stake(ethers.utils.parseEther("10"));  

            expect(await staking.totalStaked()).to.equal(ethers.utils.parseEther("10"));  
            expect((await staking.stakes(addr1.address)).amount).to.equal(ethers.utils.parseEther("10"));  
        });  

        it("Should allow users to withdraw staked tokens", async function () {  
            await token.connect(addr1).approve(staking.address, ethers.utils.parseEther("10"));  
            await staking.connect(addr1).stake(ethers.utils.parseEther("10"));  

            await staking.connect(addr1).withdraw(ethers.utils.parseEther("5"));  

            expect(await staking.totalStaked()).to.equal(ethers.utils.parseEther("5"));  
            expect((await staking.stakes(addr1.address)).amount).to.equal(ethers.utils.parseEther("5"));  
        });  

        it("Should calculate rewards correctly", async function () {  
            await token.connect(addr1).approve(staking.address, ethers.utils.parseEther("10"));  
            await staking.connect(addr1).stake(ethers.utils.parseEther("10"));  

            // Simulate time passing to accumulate rewards  
            await ethers.provider.send("evm_increaseTime", [60]); // Increase by 1 minute  
            await ethers.provider.send("evm_mine"); // Mine a new block  

            const reward = await staking.calculateReward(addr1.address);  
            expect(reward).to.equal(ethers.utils.parseEther("10")); // 10 tokens * 10 reward rate / 60 seconds  
        });  

        it("Should allow users to claim rewards", async function () {  
            await token.connect(addr1).approve(staking.address, ethers.utils.parseEther("10"));  
            await staking.connect(addr1).stake(ethers.utils.parseEther("10"));  

            // Simulate time passing to accumulate rewards  
            await ethers.provider.send("evm_increaseTime", [60]); // Increase by 1 minute  
            await ethers.provider.send("evm_mine"); // Mine a new block  

            await staking.connect(addr1).claimReward();  

            const rewards = await staking.rewards(addr1.address);  
            expect(rewards).to.equal(0); // Rewards should be claimed, so it's zero now  

            const balance = await token.balanceOf(addr1.address);  
            expect(balance).to.equal(ethers.utils.parseEther("110")); // Original balance + 10 reward tokens  
        });  
    });  
});