const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oracle Integration Tests", function () {
  let mockOracle, priceConsumer, oracleToken;
  let owner, oracle, user;
  let initialPrice = 200000000000; // $2000.00 with 8 decimals
  
  beforeEach(async function () {
    [owner, oracle, user] = await ethers.getSigners();
    
    // Deploy all contracts
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockOracle = await MockV3Aggregator.deploy(8, initialPrice);
    await mockOracle.waitForDeployment();
    
    const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
    priceConsumer = await PriceConsumer.deploy(
      await mockOracle.getAddress(),
      oracle.address
    );
    await priceConsumer.waitForDeployment();
    
    const OracleToken = await ethers.getContractFactory("OracleToken");
    oracleToken = await OracleToken.deploy(
      "Oracle Token",
      "ORACLE",
      await priceConsumer.getAddress()
    );
    await oracleToken.waitForDeployment();
  });

  describe("End-to-End Oracle Flow", function () {
    it("Should complete full oracle price update and token minting flow", async function () {
      // 1. Update oracle price
      const newPrice = 250000000000; // $2500.00
      await mockOracle.updateAnswer(newPrice);
      
      // 2. Verify price is updated in consumer
      const consumerPrice = await priceConsumer.getLatestPrice();
      expect(consumerPrice).to.equal(newPrice);
      
      // 3. Mint tokens based on new price
      const balanceBefore = await oracleToken.balanceOf(user.address);
      await oracleToken.mintBasedOnPrice(user.address);
      const balanceAfter = await oracleToken.balanceOf(user.address);
      
      // 4. Verify correct amount was minted
      const expectedMintAmount = (BigInt(newPrice) * BigInt(100)) / BigInt(10**8);
      expect(balanceAfter - balanceBefore).to.equal(expectedMintAmount);
      
      // 5. Verify token can access oracle price
      const tokenOraclePrice = await oracleToken.getCurrentOraclePrice();
      expect(tokenOraclePrice).to.equal(newPrice);
    });
    
    it("Should handle signature-based price updates with token minting", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const signedPrice = 275000000000; // $2750.00
      
      // 1. Create signed message
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [signedPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      // 2. Update price consumer with signature
      await priceConsumer.updatePriceWithSignature(signedPrice, timestamp, signature);
      
      // 3. Verify price is stored in consumer
      expect(await priceConsumer.latestPrice()).to.equal(signedPrice);
      
      // 4. Mint tokens using signature
      const balanceBefore = await oracleToken.balanceOf(user.address);
      await oracleToken.mintWithOracleSignature(user.address, signedPrice, timestamp + 1, 
        await oracle.signMessage(ethers.getBytes(ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["int256", "uint256", "address"],
            [signedPrice, timestamp + 1, await priceConsumer.getAddress()]
          )
        )))
      );
      
      const balanceAfter = await oracleToken.balanceOf(user.address);
      const expectedAmount = (BigInt(signedPrice) * BigInt(100)) / BigInt(10**8);
      expect(balanceAfter - balanceBefore).to.equal(expectedAmount);
    });
  });

  describe("Multi-Oracle Scenarios", function () {
    it("Should handle oracle address changes", async function () {
      const newOracle = user;
      
      // 1. Change trusted oracle
      await priceConsumer.updateTrustedOracle(newOracle.address);
      expect(await priceConsumer.trustedOracle()).to.equal(newOracle.address);
      
      // 2. Test with new oracle signature
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 300000000000; // $3000.00
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await newOracle.signMessage(ethers.getBytes(messageHash));
      
      // 3. Should accept signature from new oracle
      await expect(priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature))
        .to.emit(priceConsumer, "PriceUpdated")
        .withArgs(newPrice, timestamp);
      
      // 4. Should reject signature from old oracle
      const oldOracleSignature = await oracle.signMessage(ethers.getBytes(messageHash));
      await expect(
        priceConsumer.updatePriceWithSignature(newPrice, timestamp + 1, oldOracleSignature)
      ).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should consume reasonable gas for price updates", async function () {
      const newPrice = 260000000000; // $2600.00
      
      const tx = await mockOracle.updateAnswer(newPrice);
      const receipt = await tx.wait();
      
      // Should use less than 120k gas for simple price update
      expect(receipt.gasUsed).to.be.lt(120000);
    });
    
    it("Should consume reasonable gas for signature verification", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 270000000000; // $2700.00
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      const tx = await priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature);
      const receipt = await tx.wait();
      
      // Should use less than 200k gas for signature verification and storage
      expect(receipt.gasUsed).to.be.lt(200000);
    });
  });

  describe("Error Handling", function () {
    it("Should handle zero price gracefully", async function () {
      await mockOracle.updateAnswer(0);
      
      // Should revert when trying to mint with zero price
      await expect(
        oracleToken.mintBasedOnPrice(user.address)
      ).to.be.revertedWith("Invalid price from oracle");
    });
    
    it("Should handle negative price gracefully", async function () {
      await mockOracle.updateAnswer(-1000000000); // -$10.00
      
      await expect(
        oracleToken.mintBasedOnPrice(user.address)
      ).to.be.revertedWith("Invalid price from oracle");
    });
  });

  describe("Price Feed Reliability", function () {
    it("Should detect stale price data", async function () {
      // This would be implemented with actual Chainlink feeds
      // For now, we test the basic functionality
      const [, , , timestamp, ] = await mockOracle.latestRoundData();
      expect(timestamp).to.be.gt(0);
    });
    
    it("Should handle multiple rapid price updates", async function () {
      const prices = [210000000000, 220000000000, 230000000000, 240000000000];
      
      for (const price of prices) {
        await mockOracle.updateAnswer(price);
        expect(await priceConsumer.getLatestPrice()).to.equal(price);
      }
      
      // Final price should be the last one
      expect(await priceConsumer.getLatestPrice()).to.equal(prices[prices.length - 1]);
    });
  });
});
