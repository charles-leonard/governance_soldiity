pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Staking {
    using SafeMath for uint256;

    IERC20 public stakingToken;
    uint256 public rewardRate; // Reward per minute
    uint256 public totalStaked;
    uint256 public lastUpdateTime;

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

    function stake(uint256 _amount) external {
    require(_amount > 0, "Cannot stake 0");

    updateReward(msg.sender);

    stakingToken.transferFrom(msg.sender, address(this), _amount);

    Stake storage userStake = stakes[msg.sender];
    userStake.amount = userStake.amount.add(_amount);
    userStake.rewardDebt = userStake.rewardDebt.add(_amount.mul(rewardRate));
    userStake.lastStakedTime = block.timestamp;

    totalStaked = totalStaked.add(_amount);
    lastUpdateTime = block.timestamp;
    }

    function withdraw(uint256 _amount) external {
    Stake storage userStake = stakes[msg.sender];
    require(userStake.amount >= _amount, "Withdraw amount exceeds staked amount");

    updateReward(msg.sender);

    userStake.amount = userStake.amount.sub(_amount);
    stakingToken.transfer(msg.sender, _amount);

    totalStaked = totalStaked.sub(_amount);
    lastUpdateTime = block.timestamp;
    }

    function claimReward() external {
    updateReward(msg.sender);

    uint256 reward = rewards[msg.sender];
    rewards[msg.sender] = 0;

    stakingToken.transfer(msg.sender, reward);
    }

    function updateReward(address _user) internal {
    Stake storage userStake = stakes[_user];

    if (userStake.amount > 0) {
        uint256 reward = calculateReward(_user);
        rewards[_user] = rewards[_user].add(reward);
        userStake.rewardDebt = userStake.amount.mul(rewardRate).mul(block.timestamp.sub(userStake.lastStakedTime)).div(60);
    }
    }

    function calculateReward(address _user) public view returns (uint256) {
        Stake storage userStake = stakes[_user];
        uint256 stakingDuration = block.timestamp.sub(userStake.lastStakedTime);
        uint256 pendingReward = userStake.amount.mul(rewardRate).mul(stakingDuration).div(60);
        return pendingReward;
    }
}