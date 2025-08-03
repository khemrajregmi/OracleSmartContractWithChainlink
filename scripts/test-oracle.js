const { ethers } = require("hardhat");

async function main() {
    // Get the contract factory and deployed instance
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const mockOracle = MockV3Aggregator.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    
    console.log("📊 Current Oracle Status:");
    const currentPrice = await mockOracle.latestAnswer();
    console.log("Current price:", ethers.formatUnits(currentPrice, 8), "USD");
    
    console.log("\n🔄 Updating price to $2500...");
    const tx = await mockOracle.updateAnswer(ethers.parseUnits("2500", 8));
    await tx.wait();
    console.log("✅ Price updated! Transaction hash:", tx.hash);
    
    const newPrice = await mockOracle.latestAnswer();
    console.log("New price:", ethers.formatUnits(newPrice, 8), "USD");
    
    console.log("\n🪙 Testing token minting...");
    const OracleToken = await ethers.getContractFactory("OracleToken");
    const oracleToken = OracleToken.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    
    const [deployer] = await ethers.getSigners();
    const beforeBalance = await oracleToken.balanceOf(deployer.address);
    console.log("Balance before minting:", ethers.formatEther(beforeBalance), "ORACLE");
    
    const mintTx = await oracleToken.mintBasedOnPrice(deployer.address);
    await mintTx.wait();
    console.log("✅ Tokens minted! Transaction hash:", mintTx.hash);
    
    const afterBalance = await oracleToken.balanceOf(deployer.address);
    console.log("Balance after minting:", ethers.formatEther(afterBalance), "ORACLE");
    
    const totalSupply = await oracleToken.totalSupply();
    console.log("Total supply:", ethers.formatEther(totalSupply), "ORACLE");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
