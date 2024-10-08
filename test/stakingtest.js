const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("Staking Contract", function () {  
    let Staking, staking;  
    let MockERC20, token;  
    let owner, addr1, addr2;  
    const rewardRate = 10; // Example reward rate  

    beforeEach(async function () {  
        [owner, addr1, addr2] = await ethers.getSigners();  
        
        // Deploy the mock ERC20 token for staking  
        MockERC20 = await ethers.getContractFactory("MockERC20");  
        token = await MockERC20.deploy(ethers.parseEther("1000"));  
        await token.waitForDeployment(); // Ensure deployment is completed  

        // Distribute tokens to addr1 and addr2  
        await token.transfer(addr1.address, ethers.parseEther("100"));  
        await token.transfer(addr2.address, ethers.parseEther("100"));  

        // Deploy the staking contract  
        Staking = await ethers.getContractFactory("Staking");  
        staking = await Staking.deploy(await token.getAddress(), rewardRate);  
        await staking.waitForDeployment(); // Ensure deployment is completed  
    });  

    describe("Staking functionality", function () {  
        it("Should allow users to stake tokens", async function () {  
            // Approve tokens before staking  
            await token.connect(addr1).approve(staking.getAddress(), ethers.parseEther("10"));  
            // Stake tokens  
            await staking.connect(addr1).stake(ethers.parseEther("10"));  

            // Check total staked amount  
            expect(await staking.totalStaked()).to.equal(ethers.parseEther("10"));  
            // Check staked amount for addr1  
            expect((await staking.stakes(addr1.address)).amount).to.equal(ethers.parseEther("10"));  
        });  

        // Other test cases can be added below...  
    });  
});