const { ethers } = require("hardhat");  

async function main() {  
  const [deployer] = await ethers.getSigners();  
  console.log("Deploying contracts with the account:", deployer.address);  

  const StakingTokenAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with an actual ERC20 token address  
  const RewardRatePerMinute = 10; // Set your desired reward rate  

  const Staking = await ethers.getContractFactory("Staking");  
  const staking = await Staking.deploy(StakingTokenAddress, RewardRatePerMinute);  
  console.log("Staking contract deployed to:", staking);  

  await staking.waitForDeployment(); 
  console.log("Staking contract deployed to:", staking.address);  
}  

main()  
  .then(() => process.exit(0))  
  .catch((error) => {  
    console.error(error);  
    process.exit(1);  
  });  