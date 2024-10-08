// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20Staking {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    constructor(IERC20 token_) {
        token = token_;
    }
    
}