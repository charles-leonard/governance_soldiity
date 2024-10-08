import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { Contract } from "ethers";
import { ethers } from "hardhat"

describe("Token", function () {

 let token: Contract;

 beforeEach(async function () {
  token = await loadFixture(deploy)
 })

 async function deploy() {
  const Token = await ethers.getContractFactory("Token")
  const token = await Token.deploy()
  return token
 }

 describe("deploy", function () {
  it("should be named OnMyChain", async function () {
   expect(await token.name()).to.eq("OnMyChain")
  })
  it("should have OMC symbol", async function () {
   expect(await token.symbol()).to.eq("OMC")
  })
  it("should have a total supply of 100,000", async function () {
   expect(await token.totalSupply()).to.eq(
    ethers.parseEther("100000")
   )
  })
  it("should mint total supply to deployer", async function () {
   const [deployer] = await ethers.getSigners()
   expect(await token.balanceOf(deployer.address)).to.eq(
    ethers.parseEther("100000")
   )
  })
 })

 describe("transfer", function () {
  const amount = ethers.parseEther("100")

  it("should transfer amount", async function () {
   const [from, to] = await ethers.getSigners()
   await expect(token.transfer(to.address, amount)).to.changeTokenBalances(token,
    [from, to],
    [amount.mul(-1), amount]
   )
  })
  it("should transfer amount from a specific account", async function () {
   const [deployer, account0, account1] = await ethers.getSigners()
   // first we will transfer 100 to account0 (from the deployer)
   await token.transfer(account0.address, amount)
   // next, we need to connect as account0 and approve
   // the approval will allow the deployer to send tokens
   // on behalf of account0
   await token.connect(account0).approve(deployer.address, amount)
   // last, we will use transferFrom to allow the deployer to
   // transfer on behalf of account0
   await expect(token.transferFrom(account0.address, account1.address, amount)).to.changeTokenBalances(token,
    [deployer, account0, account1],
    [0, amount.mul(-1), amount]
   )
  })
 })

 describe("events", function () {
  const amount = ethers.parseEther("100")

  it("should emit Transfer event", async function () {
   const [from, to] = await ethers.getSigners()
   await expect(token.transfer(to.address, amount)).to.emit(token, 'Transfer').withArgs(
    from.address, to.address, amount
   )
  })
  it("should emit Approval event", async function () {
   const [owner, spender] = await ethers.getSigners()
   await expect(token.approve(spender.address, amount)).to.emit(token, 'Approval').withArgs(
    owner.address, spender.address, amount
   )
  })
 })
})