const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("Staking Contract", function () {  
    let Staking, staking;  
    let MockERC20, token;  
    let owner, addr1, addr2;  
    const rewardRate = 10; // Example reward rate  

    beforeEach(async function () {  
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();  
        
        // Deploy the mock ERC20 token for staking  
        MockERC20 = await ethers.getContractFactory("MockERC20");  
        token = await MockERC20.deploy(ethers.parseEther("10000"));  
        await token.waitForDeployment(); // Ensure deployment is completed  

        // Distribute tokens to addr1 and addr2  
        await token.transfer(addr1.getAddress(), ethers.parseEther("1000"));  
        await token.transfer(addr2.getAddress(), ethers.parseEther("1000"));  
        await token.transfer(addr3.getAddress(), ethers.parseEther("1000"));  
        await token.transfer(addr4.getAddress(), ethers.parseEther("500"));  
        


        // Deploy the staking contract  
        Staking = await ethers.getContractFactory("Staking");  
        staking = await Staking.deploy(await token.getAddress(), rewardRate);  
        await staking.waitForDeployment(); // Ensure deployment is completed  
        await token.transfer(staking.getAddress(), ethers.parseEther("500"));  
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
            expect((await staking.stakes(addr1.getAddress())).amount).to.equal(ethers.parseEther("10"));  
        });  

    

        it("should properly update rewards on staking", async function () {  
            const amount = ethers.parseUnits("60", "ether");  
            await token.connect(addr3).approve(staking.getAddress(), amount);  
            // Stake tokens  
            await staking.connect(addr3).stake(amount);  
          
            // Advance time by 60 seconds (1 minute)  
            const time = 60
            await ethers.provider.send("evm_increaseTime", [time]);  
            await ethers.provider.send("evm_mine");  
          
            const pendingReward = await staking.calculateReward(addr3.getAddress());  
            const formattedReward = ethers.formatUnits(pendingReward, "ether");  
            
            console.log("Pending Reward (formatted):", formattedReward);  
          
            // Adjust your expected value accordingly, if 60 is the reward rate per token per second  
            expect(Number(formattedReward)).to.equal(ethers.formatUnits(amount, "ether") * rewardRate *time/3600);  

        });  
    
        it("should allow a user to withdraw staked tokens", async function () {  
            const stakeAmount = ethers.parseUnits("100", "ether");  
            await token.connect(addr2).approve(staking.getAddress(), stakeAmount);  
            await staking.connect(addr2).stake(stakeAmount);  

            const withdrawAmount = ethers.parseUnits("50", "ether");  
            await staking.connect(addr2).withdraw(withdrawAmount);  

            const userStake = await staking.stakes(addr2.getAddress());  
            expect(userStake.amount).to.equal(ethers.parseUnits("50", "ether"));  
            expect(await token.balanceOf(addr2.getAddress())).to.equal(ethers.parseUnits("950", "ether"));  
        });   
    
        it("should allow a user to claim rewards", async function () {  
            const amount = ethers.parseUnits("500", "ether");  
            await token.connect(addr4).approve(staking.getAddress(), amount);  
            await staking.connect(addr4).stake(amount);  

            // Advance time by 60 seconds (1 minute)  
            await ethers.provider.send("evm_increaseTime", [60]);  
            await ethers.provider.send("evm_mine");  
            // console.log(await staking.rewards(addr4.getAddress()));
            await staking.connect(addr4).claimReward();  
            const rewards = await staking.rewards(addr4.getAddress());  
            expect(rewards).to.equal(0); // Rewards should be claimed and thus reset  

            const addr4Balance = await token.balanceOf(addr4.getAddress());  
            // expect(addr4Balance).to.be.closeTo(ethers.parseUnits("901", "ether"), ethers.parseUnits("0.1", "ether"));  
        });    
        // Other test cases can be added below...  
    });  
});