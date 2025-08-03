const axios = require('axios');
require("dotenv").config();

/**
 * Create a Chainlink job for external API calls
 * This script creates a job that fetches price data from external APIs
 */
async function createJob() {
  const chainlinkNodeUrl = process.env.CHAINLINK_NODE_URL || 'http://localhost:6688';
  const accessKey = process.env.CHAINLINK_API_ACCESS_KEY;
  const secret = process.env.CHAINLINK_API_SECRET;
  
  if (!accessKey || !secret) {
    console.error("❌ Chainlink API credentials not found in .env file");
    console.log("Please start the Chainlink node and get credentials from the logs");
    process.exit(1);
  }

  const jobSpec = {
    name: "ETH-USD-Price-Feed",
    type: "directrequest",
    schemaVersion: 1,
    externalJobID: "a815bbd2-3e1e-4b0e-9a7a-0b1f0a4e5f5a",
    directRequestSpec: {
      contractAddress: process.env.PRICE_CONSUMER_ADDRESS,
      minIncomingConfirmations: 1,
      minContractPaymentLinkJuels: "100000000000000000", // 0.1 LINK
      requesters: [process.env.PRICE_CONSUMER_ADDRESS]
    },
    tasks: [
      {
        type: "http",
        method: "GET",
        url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      },
      {
        type: "jsonparse",
        path: "ethereum,usd"
      },
      {
        type: "multiply",
        times: 100000000 // Convert to 8 decimal places
      },
      {
        type: "ethuint256"
      },
      {
        type: "ethtx"
      }
    ]
  };

  try {
    console.log("🔗 Creating Chainlink job...");
    console.log("Job Specification:", JSON.stringify(jobSpec, null, 2));
    
    const response = await axios.post(`${chainlinkNodeUrl}/v2/jobs`, jobSpec, {
      headers: {
        "Content-Type": "application/json",
        "X-Chainlink-EA-AccessKey": accessKey,
        "X-Chainlink-EA-Secret": secret
      }
    });

    console.log("✅ Job created successfully!");
    console.log("Job ID:", response.data.data.id);
    console.log("External Job ID:", response.data.data.externalJobID);
    
    // Save job ID to environment
    const fs = require('fs');
    const envContent = `\nORACLE_JOB_ID="${response.data.data.id}"`;
    fs.appendFileSync('.env', envContent);
    console.log("💾 Job ID saved to .env file");
    
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to create job:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log("💡 Tip: Make sure your Chainlink node is running and credentials are correct");
      console.log("Check docker logs for API credentials:");
      console.log("docker logs chainlink_node | grep 'API Credentials'");
    }
    
    process.exit(1);
  }
}

/**
 * List existing jobs
 */
async function listJobs() {
  const chainlinkNodeUrl = process.env.CHAINLINK_NODE_URL || 'http://localhost:6688';
  const accessKey = process.env.CHAINLINK_API_ACCESS_KEY;
  const secret = process.env.CHAINLINK_API_SECRET;
  
  try {
    const response = await axios.get(`${chainlinkNodeUrl}/v2/jobs`, {
      headers: {
        "X-Chainlink-EA-AccessKey": accessKey,
        "X-Chainlink-EA-Secret": secret
      }
    });
    
    console.log("📋 Existing Jobs:");
    response.data.data.forEach(job => {
      console.log(`- ${job.name} (ID: ${job.id})`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to list jobs:", error.response?.data || error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';
  
  switch (command) {
    case 'create':
      await createJob();
      break;
    case 'list':
      await listJobs();
      break;
    default:
      console.log("Usage: node create-job.js [create|list]");
      console.log("  create - Create a new price feed job");
      console.log("  list   - List existing jobs");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createJob, listJobs };
