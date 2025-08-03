const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceConsumer", function () {
  let mockOracle, priceConsumer, owner, oracle, user;
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
  });

  describe("Deployment", function () {
    it("Should set the correct oracle address", async function () {
      expect(await priceConsumer.trustedOracle()).to.equal(oracle.address);
    });
    
    it("Should set the correct owner", async function () {
      expect(await priceConsumer.owner()).to.equal(owner.address);
    });
  });

  describe("Price Retrieval", function () {
    it("Should return the latest price from oracle", async function () {
      const price = await priceConsumer.getLatestPrice();
      expect(price).to.equal(initialPrice);
    });
    
    it("Should return price details correctly", async function () {
      const [price, timestamp, roundId] = await priceConsumer.getPriceDetails();
      expect(price).to.equal(initialPrice);
      expect(timestamp).to.be.gt(0);
      expect(roundId).to.equal(1);
    });
  });

  describe("Signature Verification", function () {
    it("Should verify oracle signature correctly", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const price = 250000000000; // $2500.00
      
      // Create message hash the same way as the contract
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [price, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      // Sign with oracle private key (use ethSignedMessageHash format)
      const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      // Verify signature
      const recoveredAddress = await priceConsumer.verifyOracleSignature(messageHash, signature);
      expect(recoveredAddress).to.equal(oracle.address);
    });
    
    it("Should update price with valid signature", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 250000000000; // $2500.00
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      await expect(priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature))
        .to.emit(priceConsumer, "PriceUpdated")
        .withArgs(newPrice, timestamp);
      
      expect(await priceConsumer.latestPrice()).to.equal(newPrice);
      expect(await priceConsumer.lastUpdateTime()).to.equal(timestamp);
    });
    
    it("Should reject invalid signature", async function () {
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
        priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature)
      ).to.be.revertedWith("Invalid signature");
    });
    
    it("Should prevent replay attacks", async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const newPrice = 250000000000;
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, timestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      // First update should succeed
      await priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature);
      
      // Second update with same signature should fail
      await expect(
        priceConsumer.updatePriceWithSignature(newPrice, timestamp, signature)
      ).to.be.revertedWith("Message hash already used");
    });
    
    it("Should reject old timestamps", async function () {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const newPrice = 250000000000;
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["int256", "uint256", "address"],
          [newPrice, oldTimestamp, await priceConsumer.getAddress()]
        )
      );
      
      const signature = await oracle.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        priceConsumer.updatePriceWithSignature(newPrice, oldTimestamp, signature)
      ).to.be.revertedWith("Timestamp must be newer");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update trusted oracle", async function () {
      await expect(priceConsumer.updateTrustedOracle(user.address))
        .to.emit(priceConsumer, "OracleUpdated")
        .withArgs(user.address);
      
      expect(await priceConsumer.trustedOracle()).to.equal(user.address);
    });
    
    it("Should reject non-owner updating trusted oracle", async function () {
      await expect(
        priceConsumer.connect(user).updateTrustedOracle(user.address)
      ).to.be.revertedWithCustomError(priceConsumer, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow owner to update price feed", async function () {
      const newPriceFeedAddress = user.address; // Mock address
      await priceConsumer.updatePriceFeed(newPriceFeedAddress);
      // Note: This would fail in practice as user.address is not a valid price feed
    });
  });
});
