const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("🔮 Oracle Interaction Script");
  console.log("Using account:", signer.address);
  
  // Load contract addresses from environment
  const mockOracleAddress = process.env.MOCK_ORACLE_ADDRESS;
  const priceConsumerAddress = process.env.PRICE_CONSUMER_ADDRESS;
  const oracleTokenAddress = process.env.ORACLE_TOKEN_ADDRESS;
  
  if (!mockOracleAddress || !priceConsumerAddress || !oracleTokenAddress) {
    console.error("❌ Contract addresses not found. Please run deployment first.");
    process.exit(1);
  }

  // Get contract instances
  const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
  const mockOracle = MockV3Aggregator.attach(mockOracleAddress);
  
  const PriceConsumer = await ethers.getContractFactory("PriceConsumer");
  const priceConsumer = PriceConsumer.attach(priceConsumerAddress);
  
  const OracleToken = await ethers.getContractFactory("OracleToken");
  const oracleToken = OracleToken.attach(oracleTokenAddress);

  console.log("\n📊 Current State:");
  
  // 1. Get current price from mock oracle
  const currentPrice = await mockOracle.latestAnswer();
  console.log(`Current Oracle Price: $${Number(currentPrice) / 1e8}`);
  
  // 2. Update mock oracle with new price
  const newPrice = 250000000000; // $2500.00
  console.log(`\n🔄 Updating oracle price to $${Number(newPrice) / 1e8}...`);
  const updateTx = await mockOracle.updateAnswer(newPrice);
  await updateTx.wait();
  console.log("✅ Oracle price updated");
  
  // 3. Get updated price through consumer
  const consumerPrice = await priceConsumer.getLatestPrice();
  console.log(`Price Consumer reads: $${Number(consumerPrice) / 1e8}`);
  
  // 4. Create signed price data
  console.log("\n🔐 Creating signed price data...");
  const timestamp = Math.floor(Date.now() / 1000);
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["int256", "uint256", "address"],
      [newPrice, timestamp, priceConsumerAddress]
    )
  );
  
  // Sign with oracle private key
  const oracleWallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, signer.provider);
  const signature = await oracleWallet.signMessage(ethers.getBytes(messageHash));
  
  console.log("Message Hash:", messageHash);
  console.log("Signature:", signature);
  
  // 5. Verify signature
  const recoveredAddress = await priceConsumer.verifyOracleSignature(messageHash, signature);
  console.log("Recovered Address:", recoveredAddress);
  console.log("Oracle Address:", oracleWallet.address);
  console.log("Signature Valid:", recoveredAddress === oracleWallet.address);
  
  // 6. Update price with signature
  console.log("\n📝 Updating price with signature verification...");
  try {
    const updateWithSigTx = await priceConsumer.updatePriceWithSignature(
      newPrice,
      timestamp,
      signature
    );
    await updateWithSigTx.wait();
    console.log("✅ Price updated with signature verification");
    
    // Check updated state
    const updatedPrice = await priceConsumer.latestPrice();
    const lastUpdate = await priceConsumer.lastUpdateTime();
    console.log(`Updated Price: $${Number(updatedPrice) / 1e8}`);
    console.log(`Last Update: ${new Date(Number(lastUpdate) * 1000).toISOString()}`);
  } catch (error) {
    console.error("❌ Failed to update price with signature:", error.message);
  }
  
  // 7. Test token minting based on oracle price
  console.log("\n🪙 Testing Oracle Token minting...");
  const balanceBefore = await oracleToken.balanceOf(signer.address);
  console.log(`Balance before: ${ethers.formatEther(balanceBefore)} ORACLE`);
  
  try {
    // Mint tokens based on current price
    const mintTx = await oracleToken.mintBasedOnPrice(signer.address);
    await mintTx.wait();
    console.log("✅ Tokens minted based on oracle price");
    
    const balanceAfter = await oracleToken.balanceOf(signer.address);
    console.log(`Balance after: ${ethers.formatEther(balanceAfter)} ORACLE`);
    console.log(`Minted: ${ethers.formatEther(balanceAfter - balanceBefore)} ORACLE`);
  } catch (error) {
    console.error("❌ Failed to mint tokens:", error.message);
  }
  
  // 8. Display final summary
  console.log("\n📋 Final Summary:");
  console.log("=================================");
  console.log(`Oracle Price: $${Number(await mockOracle.latestAnswer()) / 1e8}`);
  console.log(`Consumer Price: $${Number(await priceConsumer.latestPrice()) / 1e8}`);
  console.log(`Token Balance: ${ethers.formatEther(await oracleToken.balanceOf(signer.address))} ORACLE`);
  console.log(`Total Supply: ${ethers.formatEther(await oracleToken.totalSupply())} ORACLE`);
  console.log("=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
