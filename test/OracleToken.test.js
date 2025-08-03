const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OracleToken", function () {
  let mockOracle, priceConsumer, oracleToken, owner, oracle, user;
  let initialPrice = 200000000000; // $2000.00 with 8 decimals
  
  beforeEach(async function () {
    [owner, oracle, user] = await ethers.getSigners();
    
    // Deploy Mock Oracle
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockOracle = await MockV3Aggregator.deploy(8, initialPrice);
    await mockOracle.waitForDeployment();
    
    // Deploy Price Consumer
    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    priceConsumer = await PriceConsumer.deploy(
      await mockOracle.getAddress(),
      oracle.address
    );
    await priceConsumer.waitForDeployment();
    
    // Deploy Oracle Token
    const OracleToken = await ethers.getContractFactory("OracleToken");
    oracleToken = await OracleToken.deploy(
      "Oracle Token",
      "ORACLE",
      await priceConsumer.getAddress()
    );
    await oracleToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set token details correctly", async function () {
      expect(await oracleToken.name()).to.equal("Oracle Token");
      expect(await oracleToken.symbol()).to.equal("ORACLE");
      expect(await oracleToken.owner()).to.equal(owner.address);
    });
    
    it("Should mint initial supply to owner", async function () {
      const initialSupply = await oracleToken.totalSupply();
      const ownerBalance = await oracleToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("100000")); // 100k tokens
      expect(initialSupply).to.equal(ownerBalance);
    });
  });

  describe("Price-based Minting", function () {
    it("Should mint tokens based on oracle price", async function () {
      const balanceBefore = await oracleToken.balanceOf(user.address);
      
      await oracleToken.mintBasedOnPrice(user.address);
      
      const balanceAfter = await oracleToken.balanceOf(user.address);
      const mintedAmount = balanceAfter - balanceBefore;
      
      // Calculate expected amount: (price * mintRate) / 10^8
      const expectedAmount = (BigInt(initialPrice) * BigInt(100)) / BigInt(10**8);
      expect(mintedAmount).to.equal(expectedAmount);
    });
    
    it("Should emit PriceBasedMint event", async function () {
      await expect(oracleToken.mintBasedOnPrice(user.address))
        .to.emit(oracleToken, "PriceBasedMint");
    });
    
    it("Should reject minting to zero address", async function () {
      await expect(
        oracleToken.mintBasedOnPrice(ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });

  describe("Signature-based Minting", function () {
    it("Should mint tokens with valid oracle signature", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 250000000000; // $2500.00
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      const balanceBefore = await oracleToken.balanceOf(user.address);
      
      await oracleToken.mintWithOracleSignature(user.address, newPrice, timestamp, signature);
      
      const balanceAfter = await oracleToken.balanceOf(user.address);
      const mintedAmount = balanceAfter - balanceBefore;
      
      const expectedAmount = (BigInt(newPrice) * BigInt(100)) / BigInt(10**8);
      expect(mintedAmount).to.equal(expectedAmount);
    });
    
    it("Should reject minting with invalid signature", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 250000000000;
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      // Sign with wrong account
      const signature = await user.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        oracleToken.mintWithOracleSignature(user.address, newPrice, timestamp, signature)
      ).to.be.revertedWith("Invalid oracle signature");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to burn tokens", async function () {
      // First mint some tokens to user
      await oracleToken.mintBasedOnPrice(user.address);
      const balanceBefore = await oracleToken.balanceOf(user.address);
      
      const burnAmount = ethers.parseEther("10");
      await oracleToken.burn(user.address, burnAmount);
      
      const balanceAfter = await oracleToken.balanceOf(user.address);
      expect(balanceBefore - balanceAfter).to.equal(burnAmount);
    });
    
    it("Should reject non-owner burning tokens", async function () {
      await oracleToken.mintBasedOnPrice(user.address);
      
      await expect(
        oracleToken.connect(user).burn(user.address, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(oracleToken, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow owner to update mint rate", async function () {
      const newRate = 200;
      await expect(oracleToken.updateMintRate(newRate))
        .to.emit(oracleToken, "MintRateUpdated")
        .withArgs(newRate);
      
      expect(await oracleToken.mintRate()).to.equal(newRate);
    });
    
    it("Should reject zero mint rate", async function () {
      await expect(
        oracleToken.updateMintRate(0)
      ).to.be.revertedWith("Mint rate must be positive");
    });
  });

  describe("Supply Limits", function () {
    it("Should respect maximum supply limit", async function () {
      const maxSupply = await oracleToken.MAX_SUPPLY();
      const currentSupply = await oracleToken.totalSupply();
      
      // Try to mint more than allowed
      const excessAmount = maxSupply - currentSupply + BigInt(1);
      
      // Update oracle price to a very high value to trigger excess minting
      await mockOracle.updateAnswer(ethers.parseUnits("100000", 8)); // $100,000
      
      await expect(
        oracleToken.mintBasedOnPrice(user.address)
      ).to.be.revertedWith("Would exceed max supply");
    });
  });

  describe("Utility Functions", function () {
    it("Should calculate mint amount correctly", async function () {
      const testPrice = 300000000000; // $3000.00
      const expectedAmount = (BigInt(testPrice) * BigInt(100)) / BigInt(10**8);
      
      const calculatedAmount = await oracleToken.calculateMintAmount(testPrice);
      expect(calculatedAmount).to.equal(expectedAmount);
    });
    
    it("Should get current oracle price", async function () {
      const price = await oracleToken.getCurrentOraclePrice();
      expect(price).to.equal(initialPrice);
    });
    
    it("Should reject negative price in calculation", async function () {
      await expect(
        oracleToken.calculateMintAmount(-1000)
      ).to.be.revertedWith("Price must be positive");
    });
  });
});
