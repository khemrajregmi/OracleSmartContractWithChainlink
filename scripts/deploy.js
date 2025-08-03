const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy Mock Oracle first
  console.log("\n🔮 Deploying Mock Oracle...");
  const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
  const mockOracle = await MockV3Aggregator.deploy(8, 200000000000); // 8 decimals, $2000 initial price
  await mockOracle.waitForDeployment();
  
  const mockOracleAddress = await mockOracle.getAddress();
  console.log("✅ Mock Oracle deployed to:", mockOracleAddress);

  // Deploy Price Consumer
  console.log("\n📊 Deploying Price Consumer...");
  const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
  const priceConsumer = await PriceConsumer.deploy(mockOracleAddress, deployer.address);
  await priceConsumer.waitForDeployment();
  
  const priceConsumerAddress = await priceConsumer.getAddress();
  console.log("✅ Price Consumer deployed to:", priceConsumerAddress);

  // Deploy Oracle Token
  console.log("\n🪙 Deploying Oracle Token...");
  const OracleToken = await ethers.getContractFactory("OracleToken");
  const oracleToken = await OracleToken.deploy(
    "Oracle Token",
    "ORACLE",
    priceConsumerAddress
  );
  await oracleToken.waitForDeployment();
  
  const oracleTokenAddress = await oracleToken.getAddress();
  console.log("✅ Oracle Token deployed to:", oracleTokenAddress);

  // Verify deployments
  console.log("\n🔍 Verifying deployments...");
  
  // Test Mock Oracle
  const latestPrice = await mockOracle.latestAnswer();
  console.log("Mock Oracle latest price:", latestPrice.toString());
  
  // Test Price Consumer
  const consumerPrice = await priceConsumer.getLatestPrice();
  console.log("Price Consumer latest price:", consumerPrice.toString());
  
  // Test Oracle Token
  const tokenName = await oracleToken.name();
  const tokenSymbol = await oracleToken.symbol();
  const totalSupply = await oracleToken.totalSupply();
  console.log(`Oracle Token: ${tokenName} (${tokenSymbol})`);
  console.log("Initial supply:", ethers.formatEther(totalSupply));

  // Display deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("=====================================");
  console.log("Mock Oracle Address:    ", mockOracleAddress);
  console.log("Price Consumer Address: ", priceConsumerAddress);
  console.log("Oracle Token Address:   ", oracleTokenAddress);
  console.log("Deployer Address:       ", deployer.address);
  console.log("=====================================");

  // Save addresses to environment file
  const fs = require('fs');
  const envContent = `
# Contract Addresses (auto-generated)
MOCK_ORACLE_ADDRESS="${mockOracleAddress}"
PRICE_CONSUMER_ADDRESS="${priceConsumerAddress}"
ORACLE_TOKEN_ADDRESS="${oracleTokenAddress}"
DEPLOYER_ADDRESS="${deployer.address}"
`;
  
  fs.appendFileSync('.env', envContent);
  console.log("\n💾 Contract addresses saved to .env file");

  return {
    mockOracle: mockOracleAddress,
    priceConsumer: priceConsumerAddress,
    oracleToken: oracleTokenAddress
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
