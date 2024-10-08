// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.0;  

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  
import "@openzeppelin/contracts/utils/math/Math.sol";  
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // Use ReentrancyGuard  

contract Staking is ReentrancyGuard {  
    using Math for uint256;  

    IERC20 public stakingToken;  
    uint256 public rewardRate; // Reward per minute  
    uint256 public totalStaked;  

    struct Stake {  
        uint256 amount;  
        uint256 rewardDebt;  
        uint256 lastStakedTime;  
    }  

    mapping(address => Stake) public stakes;  
    mapping(address => uint256) public rewards;  

    constructor(IERC20 _stakingToken, uint256 _rewardRate) {  
        stakingToken = _stakingToken;  
        rewardRate = _rewardRate;  
    }  

    function stake(uint256 _amount) external nonReentrant {  
        require(_amount > 0, "Cannot stake 0");  

        updateReward(msg.sender);  

        stakes[msg.sender].amount += _amount;  
        stakes[msg.sender].lastStakedTime = block.timestamp;  

        totalStaked += _amount;  

        stakingToken.transferFrom(msg.sender, address(this), _amount);  
    }  

    function withdraw(uint256 _amount) external nonReentrant {  
        Stake storage userStake = stakes[msg.sender];  
        require(userStake.amount >= _amount, "Withdraw amount exceeds staked amount");  

        updateReward(msg.sender);  

        userStake.amount -= _amount;  
        totalStaked -= _amount;  

        stakingToken.transfer(msg.sender, _amount);  
    }  

    function claimReward() external nonReentrant {  
        updateReward(msg.sender);  

        uint256 reward = rewards[msg.sender];  
        rewards[msg.sender] = 0;  

        stakingToken.transfer(msg.sender, reward);  
    }  

    function updateReward(address _user) internal {  
        Stake storage userStake = stakes[_user];  
        if (userStake.amount > 0) {  
            uint256 reward = calculateReward(_user);  
            rewards[_user] += reward;  
            userStake.lastStakedTime = block.timestamp; // Update timestamp after calculation  
        }  
    }  

    function calculateReward(address _user) public view returns (uint256) {  
        Stake storage userStake = stakes[_user];  
        uint256 stakingDuration = block.timestamp - userStake.lastStakedTime;  
        uint256 pendingReward = (userStake.amount * rewardRate * stakingDuration) / 60;  
        return pendingReward;  
    }  
}