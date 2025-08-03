const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockV3Aggregator", function () {
  let mockOracle, owner, user;
  let initialAnswer = 200000000000; // $2000.00 with 8 decimals
  let decimals = 8;
  
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockOracle = await MockV3Aggregator.deploy(decimals, initialAnswer);
    await mockOracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set initial parameters correctly", async function () {
      expect(await mockOracle.decimals()).to.equal(decimals);
      expect(await mockOracle.latestAnswer()).to.equal(initialAnswer);
      expect(await mockOracle.latestRound()).to.equal(1);
    });
    
    it("Should have correct version", async function () {
      expect(await mockOracle.version()).to.equal(0);
    });
    
    it("Should have correct description", async function () {
      expect(await mockOracle.description()).to.equal("v0.8/tests/MockV3Aggregator.sol");
    });
  });

  describe("Price Updates", function () {
    it("Should update answer correctly", async function () {
      const newAnswer = 250000000000; // $2500.00
      
      await expect(mockOracle.updateAnswer(newAnswer))
        .to.emit(mockOracle, "AnswerUpdated")
        .withArgs(newAnswer, 2, await time.latest() + 1);
      
      expect(await mockOracle.latestAnswer()).to.equal(newAnswer);
      expect(await mockOracle.latestRound()).to.equal(2);
    });
    
    it("Should update round data correctly", async function () {
      const roundId = 5;
      const answer = 300000000000; // $3000.00
      const timestamp = Math.floor(Date.now() / 1000);
      const startedAt = timestamp - 100;
      
      await mockOracle.updateRoundData(roundId, answer, timestamp, startedAt);
      
      expect(await mockOracle.latestRound()).to.equal(roundId);
      expect(await mockOracle.latestAnswer()).to.equal(answer);
      expect(await mockOracle.latestTimestamp()).to.equal(timestamp);
    });
  });

  describe("Round Data Retrieval", function () {
    it("Should return latest round data correctly", async function () {
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await mockOracle.latestRoundData();
      
      expect(roundId).to.equal(1);
      expect(answer).to.equal(initialAnswer);
      expect(updatedAt).to.be.gt(0);
      expect(startedAt).to.be.gt(0);
      expect(answeredInRound).to.equal(1);
    });
    
    it("Should return specific round data correctly", async function () {
      // Update with specific round data
      const testRoundId = 3;
      const testAnswer = 275000000000; // $2750.00
      const testTimestamp = Math.floor(Date.now() / 1000);
      const testStartedAt = testTimestamp - 50;
      
      await mockOracle.updateRoundData(testRoundId, testAnswer, testTimestamp, testStartedAt);
      
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await mockOracle.getRoundData(testRoundId);
      
      expect(roundId).to.equal(testRoundId);
      expect(answer).to.equal(testAnswer);
      expect(startedAt).to.equal(testStartedAt);
      expect(updatedAt).to.equal(testTimestamp);
      expect(answeredInRound).to.equal(testRoundId);
    });
  });

  describe("Historical Data", function () {
    it("Should store historical answers", async function () {
      const answers = [250000000000, 260000000000, 270000000000]; // $2500, $2600, $2700
      
      for (let i = 0; i < answers.length; i++) {
        await mockOracle.updateAnswer(answers[i]);
        expect(await mockOracle.getAnswer(i + 2)).to.equal(answers[i]); // +2 because initial round is 1
      }
    });
    
    it("Should store historical timestamps", async function () {
      await mockOracle.updateAnswer(250000000000);
      const roundId = await mockOracle.latestRound();
      
      const timestamp = await mockOracle.getTimestamp(roundId);
      expect(timestamp).to.be.gt(0);
    });
  });

  describe("Events", function () {
    it("Should emit AnswerUpdated event", async function () {
      const newAnswer = 280000000000; // $2800.00
      
      await expect(mockOracle.updateAnswer(newAnswer))
        .to.emit(mockOracle, "AnswerUpdated");
    });
    
    it("Should emit NewRound event", async function () {
      const newAnswer = 290000000000; // $2900.00
      
      await expect(mockOracle.updateAnswer(newAnswer))
        .to.emit(mockOracle, "NewRound");
    });
  });
});

// Helper to get the latest block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
};
