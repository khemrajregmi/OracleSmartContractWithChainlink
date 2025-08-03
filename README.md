# 🔮 Oracle Smart Contract Project

A comprehensive Ethereum smart contract project featuring **Mock Oracle Integration** with **Browser-Based Testing Interface**. This project demonstrates price feeds, signature verification, token minting, and real-time contract interaction through an interactive web dashboard.

## 🌟 Features

- **🔗 Mock Oracle Integration**: Simulated price feeds for development
- **🌐 Browser Testing Interface**: Interactive web dashboard for real-time contract testing
- **📊 Price Consumer Contract**: Secure oracle data consumption with ECDSA verification
- **🪙 Oracle Token**: ERC20 token with oracle-based minting mechanisms
- **📋 Complete API Documentation**: OpenAPI spec and Postman collection
- **🧪 Comprehensive Testing**: Full test suite + browser-based testing
- **🔐 Security Features**: ECDSA signatures and replay attack prevention
- **⚡ Real-time Updates**: Live contract interaction with automatic result formatting

## 📁 Project Structure

```
├── contracts/                 # Smart contracts
│   ├── PriceConsumer.sol     # Oracle consumer with signature verification
│   ├── OracleToken.sol       # ERC20 token with oracle-based minting
│   └── MockV3Aggregator.sol  # Mock oracle for testing
├── scripts/                  # Deployment and interaction scripts
│   ├── deploy.js            # Deploy all contracts
│   └── test-oracle.js       # Test oracle functionality
├── test/                    # Test suites
├── index.html              # Interactive browser testing interface
├── openapi.yaml            # OpenAPI 3.1 specification
├── postman-collection.json # Postman collection
└── API-README.md           # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Hardhat Network
```bash
npx hardhat node
```

### 3. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start Browser Interface
```bash
# Start HTTP server for browser interface
python3 -m http.server 3000

# Open browser and navigate to:
# http://localhost:3000/index.html
```

### 5. Test the System
```bash
# Run all tests
npm test

# Test oracle functionality
npx hardhat run scripts/test-oracle.js --network localhost

# OR use the browser interface at http://localhost:3000/index.html
```

## 📊 Contract Addresses

After deployment, contracts are deployed to these deterministic addresses on local network:
- **Mock Oracle**: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- **Price Consumer**: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **Oracle Token**: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`

*Note: These addresses are updated automatically in the browser interface*

## 💡 Key Contracts

### 🔮 Mock Oracle (`MockV3Aggregator.sol`)
- Simulates price feed behavior
- 8 decimal precision
- Manual price updates for testing
- Event emission for price changes

**Key Functions:**
- `latestAnswer()` - Get current price
- `updateAnswer(int256)` - Update price (testing)
- `decimals()` - Get decimal places (8)

### 📊 Price Consumer (`PriceConsumer.sol`)
- Consumes oracle price data
- ECDSA signature verification
- Replay attack prevention
- Trusted oracle management

**Key Functions:**
- `getLatestPrice()` - Fetch latest price from oracle
- `verifySignature()` - Verify oracle data signatures
- `updatePrice()` - Update price with signature verification

### 🪙 Oracle Token (`OracleToken.sol`)
- ERC20 token with oracle integration
- Price-based minting logic
- Supply cap enforcement
- Access control

**Key Functions:**
- `mintBasedOnPrice(address)` - Mint tokens based on oracle price
- `getCurrentOraclePrice()` - Get price used for minting calculation
- `balanceOf()` / `totalSupply()` - Standard ERC20 functions

## 🌐 Browser Testing Interface

### Interactive Web Dashboard
Access the comprehensive testing interface at: **http://localhost:3000/index.html**

**Features:**
- 🔴 **Real-time Contract Testing**: One-click API calls with live results
- 🔄 **Automatic Conversion**: Hex values automatically converted to readable format
- 📊 **System Status**: Live network and contract health monitoring
- 🎯 **Quick Actions**: Pre-configured buttons for common operations
- 📋 **Copy-Paste Ready**: Results formatted for easy copying

**Available Tests:**
- Get current oracle price
- Check token balances
- View contract metadata
- Monitor system status
- Test price updates
- Execute token minting

### Starting the Browser Interface
```bash
# Start HTTP server
python3 -m http.server 3000

# Open in browser
open http://localhost:3000/index.html
```

## 🔗 API Testing

### Using Postman
1. Import `postman-collection.json` into Postman
2. All endpoints are pre-configured with contract addresses
3. Global variables are set automatically

### Using curl Examples

**Get Current Price:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
        "data": "0x50d25bcd"
      },
      "latest"
    ],
    "id": 1
  }'
```

**Get Token Balance:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
        "data": "0x70a08231000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"
      },
      "latest"
    ],
    "id": 2
  }'
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PriceConsumer.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npx hardhat coverage
```

## 🔐 Security Features

- **ECDSA Signature Verification**: Validates oracle data authenticity
- **Replay Attack Prevention**: Message hash tracking prevents reuse
- **Access Control**: Owner-only functions for sensitive operations
- **Supply Limits**: Token minting caps prevent inflation
- **Input Validation**: Comprehensive parameter checking

## 📈 Price Conversion

Oracle prices use 8 decimal places:
- $2000 = `200000000000` (contract format)
- $2500 = `250000000000` (contract format)
- Formula: `USD_Price * 10^8`

**JavaScript Conversion:**
```javascript
const priceInUSD = 2500;
const contractPrice = priceInUSD * Math.pow(10, 8);
const hexPrice = '0x' + contractPrice.toString(16);
```

## 🛠️ Development Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Run Hardhat console
npx hardhat console --network localhost

# Check contract sizes
npx hardhat size-contracts

# Clean artifacts
npx hardhat clean
```

## 📊 Contract Interaction Examples

### Update Oracle Price
```bash
npx hardhat run scripts/test-oracle.js --network localhost
```

### Mint Tokens Based on Price
The token minting logic:
- Gets current oracle price
- Calculates tokens: `price / 1000`
- Mints to specified address
- Example: $2500 price → 2.5 tokens minted

## 🎯 Testing Workflow

### Method 1: Browser Interface (Recommended)
1. **Start Network**: `npx hardhat node`
2. **Deploy Contracts**: `npx hardhat run scripts/deploy.js --network localhost`
3. **Start Browser Interface**: `python3 -m http.server 3000`
4. **Open Browser**: Navigate to `http://localhost:3000/index.html`
5. **Interactive Testing**: Use the web dashboard for real-time testing

### Method 2: Command Line
1. **Start Network**: `npx hardhat node`
2. **Deploy Contracts**: `npx hardhat run scripts/deploy.js --network localhost`
3. **Test Price Updates**: Update oracle from $2000 → $2500
4. **Test Token Minting**: Mint tokens based on new price
5. **Verify Balances**: Check token balances increased

## 📚 Learning Resources for Smart Contract Beginners

### 🎓 **Getting Started with Smart Contracts**

#### **Fundamentals**
- [**Ethereum.org - Introduction to Smart Contracts**](https://ethereum.org/en/developers/docs/smart-contracts/) - Official Ethereum guide
- [**Solidity Documentation**](https://docs.soliditylang.org/) - Complete Solidity language reference
- [**OpenZeppelin Contracts**](https://docs.openzeppelin.com/contracts/) - Secure smart contract library
- [**Hardhat Documentation**](https://hardhat.org/docs) - Development environment and tooling

#### **Interactive Learning**
- [**CryptoZombies**](https://cryptozombies.io/) - Learn Solidity by building games
- [**Solidity by Example**](https://solidity-by-example.org/) - Learn through practical examples
- [**Remix IDE**](https://remix.ethereum.org/) - Browser-based Solidity IDE
- [**Ethereum Developer Bootcamp**](https://university.alchemy.com/) - Comprehensive course by Alchemy

#### **Oracle & Chainlink Resources**
- [**Chainlink Documentation**](https://docs.chain.link/) - Official Chainlink oracle docs
- [**Chainlink Bootcamp**](https://chain.link/bootcamp) - Free oracle development course
- [**Oracle Problem Explained**](https://blog.chain.link/what-is-the-blockchain-oracle-problem/) - Understanding oracle importance
- [**Price Feeds Tutorial**](https://docs.chain.link/data-feeds/using-data-feeds) - Working with price data

#### **Advanced Topics**
- [**DeFi Developer Roadmap**](https://github.com/OffcierCia/DeFi-Developer-Road-Map) - Comprehensive learning path
- [**Smart Contract Security**](https://consensys.github.io/smart-contract-best-practices/) - Security best practices
- [**Gas Optimization**](https://github.com/iskdrews/awesome-solidity-gas-optimization) - Reducing gas costs
- [**ERC Token Standards**](https://ethereum.org/en/developers/docs/standards/tokens/) - Token implementation guides

### 🛠️ **Development Tools & Frameworks**
- [**Hardhat**](https://hardhat.org/) - Ethereum development environment (used in this project)
- [**Foundry**](https://getfoundry.sh/) - Fast, portable and modular toolkit
- [**Truffle**](https://trufflesuite.com/) - Development framework for Ethereum
- [**Web3.js**](https://web3js.readthedocs.io/) - Ethereum JavaScript API
- [**Ethers.js**](https://docs.ethers.io/) - Complete Ethereum wallet implementation

### 🎯 **This Project as a Learning Tool**

This Oracle Smart Contract project is designed to teach:

1. **📊 Oracle Integration** - How external data enters blockchain
2. **🔐 Signature Verification** - ECDSA cryptographic signatures
3. **🪙 Token Economics** - ERC20 tokens with oracle-based logic
4. **🧪 Testing Patterns** - Comprehensive test suites
5. **🌐 Frontend Integration** - Browser-based dApp interaction
6. **📋 API Design** - JSON-RPC and RESTful patterns

### 📖 **How to Use This Project for Learning**

#### **Beginner Path (Week 1-2)**
1. Read [Ethereum Basics](https://ethereum.org/en/developers/docs/)
2. Complete [CryptoZombies](https://cryptozombies.io/) lessons 1-6
3. Set up this project following [QUICKSTART.md](./QUICKSTART.md)
4. Explore contracts in `/contracts/` folder
5. Run tests: `npm test`

#### **Intermediate Path (Week 3-4)**
1. Study [Solidity Documentation](https://docs.soliditylang.org/)
2. Analyze `PriceConsumer.sol` for oracle patterns
3. Review `OracleToken.sol` for ERC20 implementation
4. Test the browser interface at `http://localhost:3000/index.html`
5. Modify oracle price and observe token minting

#### **Advanced Path (Week 5-6)**
1. Study [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/)
2. Implement signature verification in `PriceConsumer.sol`
3. Add new features to contracts
4. Write additional tests
5. Deploy to testnets (Sepolia/Goerli)

### 🎪 **Community & Support**
- [**Ethereum Stack Exchange**](https://ethereum.stackexchange.com/) - Q&A platform
- [**OpenZeppelin Forum**](https://forum.openzeppelin.com/) - Security discussions
- [**Hardhat Discord**](https://hardhat.org/discord) - Development support
- [**Chainlink Discord**](https://discord.gg/chainlink) - Oracle development

### 📺 **Video Tutorials**
- [**Patrick Collins - Solidity Course**](https://www.youtube.com/watch?v=M576WGiDBdQ) - 32-hour comprehensive course
- [**Smart Contract Programmer**](https://www.youtube.com/channel/UCJWh7F3AFyQ_x01VKzr9eyA) - Practical tutorials
- [**Chainlink Bootcamp Videos**](https://www.youtube.com/playlist?list=PLVP9aGDn-X0QwJVbQvuKr-zrh2_DV5M6J) - Oracle development

## 📚 Learning Resources for Smart Contract Beginners

### 🎓 **Getting Started with Smart Contracts**

#### **Fundamentals**
- [**Ethereum.org - Introduction to Smart Contracts**](https://ethereum.org/en/developers/docs/smart-contracts/) - Official Ethereum guide
- [**Solidity Documentation**](https://docs.soliditylang.org/) - Complete Solidity language reference
- [**OpenZeppelin Contracts**](https://docs.openzeppelin.com/contracts/) - Secure smart contract library
- [**Hardhat Documentation**](https://hardhat.org/docs) - Development environment and tooling

#### **Interactive Learning**
- [**CryptoZombies**](https://cryptozombies.io/) - Learn Solidity by building games
- [**Solidity by Example**](https://solidity-by-example.org/) - Learn through practical examples
- [**Remix IDE**](https://remix.ethereum.org/) - Browser-based Solidity IDE
- [**Ethereum Developer Bootcamp**](https://university.alchemy.com/) - Comprehensive course by Alchemy

#### **Oracle & Chainlink Resources**
- [**Chainlink Documentation**](https://docs.chain.link/) - Official Chainlink oracle docs
- [**Chainlink Bootcamp**](https://chain.link/bootcamp) - Free oracle development course
- [**Oracle Problem Explained**](https://blog.chain.link/what-is-the-blockchain-oracle-problem/) - Understanding oracle importance
- [**Price Feeds Tutorial**](https://docs.chain.link/data-feeds/using-data-feeds) - Working with price data

#### **Advanced Topics**
- [**DeFi Developer Roadmap**](https://github.com/OffcierCia/DeFi-Developer-Road-Map) - Comprehensive learning path
- [**Smart Contract Security**](https://consensys.github.io/smart-contract-best-practices/) - Security best practices
- [**Gas Optimization**](https://github.com/iskdrews/awesome-solidity-gas-optimization) - Reducing gas costs
- [**ERC Token Standards**](https://ethereum.org/en/developers/docs/standards/tokens/) - Token implementation guides

### 🛠️ **Development Tools & Frameworks**
- [**Hardhat**](https://hardhat.org/) - Ethereum development environment (used in this project)
- [**Foundry**](https://getfoundry.sh/) - Fast, portable and modular toolkit
- [**Truffle**](https://trufflesuite.com/) - Development framework for Ethereum
- [**Web3.js**](https://web3js.readthedocs.io/) - Ethereum JavaScript API
- [**Ethers.js**](https://docs.ethers.io/) - Complete Ethereum wallet implementation

### 🎯 **This Project as a Learning Tool**

This Oracle Smart Contract project is designed to teach:

1. **📊 Oracle Integration** - How external data enters blockchain
2. **🔐 Signature Verification** - ECDSA cryptographic signatures
3. **🪙 Token Economics** - ERC20 tokens with oracle-based logic
4. **🧪 Testing Patterns** - Comprehensive test suites
5. **🌐 Frontend Integration** - Browser-based dApp interaction
6. **📋 API Design** - JSON-RPC and RESTful patterns

### 📖 **How to Use This Project for Learning**

#### **Beginner Path (Week 1-2)**
1. Read [Ethereum Basics](https://ethereum.org/en/developers/docs/)
2. Complete [CryptoZombies](https://cryptozombies.io/) lessons 1-6
3. Set up this project following [QUICKSTART.md](./QUICKSTART.md)
4. Explore contracts in `/contracts/` folder
5. Run tests: `npm test`

#### **Intermediate Path (Week 3-4)**
1. Study [Solidity Documentation](https://docs.soliditylang.org/)
2. Analyze `PriceConsumer.sol` for oracle patterns
3. Review `OracleToken.sol` for ERC20 implementation
4. Test the browser interface at `http://localhost:3000/index.html`
5. Modify oracle price and observe token minting

#### **Advanced Path (Week 5-6)**
1. Study [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/)
2. Implement signature verification in `PriceConsumer.sol`
3. Add new features to contracts
4. Write additional tests
5. Deploy to testnets (Sepolia/Goerli)

### 🎪 **Community & Support**
- [**Ethereum Stack Exchange**](https://ethereum.stackexchange.com/) - Q&A platform
- [**OpenZeppelin Forum**](https://forum.openzeppelin.com/) - Security discussions
- [**Hardhat Discord**](https://hardhat.org/discord) - Development support
- [**Chainlink Discord**](https://discord.gg/chainlink) - Oracle development

### 📺 **Video Tutorials**
- [**Patrick Collins - Solidity Course**](https://www.youtube.com/watch?v=M576WGiDBdQ) - 32-hour comprehensive course
- [**Smart Contract Programmer**](https://www.youtube.com/channel/UCJWh7F3AFyQ_x01VKzr9eyA) - Practical tutorials
- [**Chainlink Bootcamp Videos**](https://www.youtube.com/playlist?list=PLVP9aGDn-X0QwJVbQvuKr-zrh2_DV5M6J) - Oracle development

## 📚 API Documentation

- **OpenAPI Spec**: Use `openapi.yaml` with Swagger Editor
- **Postman Collection**: Import `postman-collection.json`
- **Detailed Guide**: See `API-README.md`

## 🔧 Environment Variables

```bash
# Oracle Private Keys (for testing only)
ORACLE_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Network URLs
ETHEREUM_RPC_URL="http://localhost:8545"

# Contract Addresses (updated automatically after deployment)
MOCK_ORACLE_ADDRESS="0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
PRICE_CONSUMER_ADDRESS="0x610178dA211FEF7D417bC0e6FeD39F05609AD788"
ORACLE_TOKEN_ADDRESS="0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"
```

## 🚀 Next Steps

1. **Enhanced Browser Interface**: Add transaction history, event monitoring, and advanced filtering
2. **Frontend Framework Integration**: Upgrade to React/Vue.js for more sophisticated UI
3. **Real Oracle Integration**: Connect to live oracle price feeds from Chainlink or other providers
4. **Multi-chain Support**: Deploy to different networks (Polygon, BSC, Arbitrum)
5. **Mobile Interface**: Create responsive design for mobile testing
6. **Testnet Deployment**: Deploy to Sepolia or Goerli testnets
7. **Mainnet Deployment**: Production deployment to Ethereum mainnet
8. **Advanced Features**:
   - Multi-oracle aggregation
   - Governance mechanisms
   - Price deviation alerts
   - Historical data storage
   - Real-time price charts

## 🐛 Troubleshooting

### Common Issues

1. **Node not running**: Ensure Hardhat node is running on port 8545
2. **Contract not deployed**: Run deployment script first
3. **Wrong network**: Check you're using `--network localhost`
4. **Gas issues**: Increase gas limit in transactions
5. **Browser interface not loading**: Ensure Python HTTP server is running on port 3000
6. **CORS issues**: Use the Python HTTP server instead of opening HTML directly

### Useful Commands

```bash
# Check if node is running
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check if HTTP server is running
curl http://localhost:3000/

# Start browser interface
python3 -m http.server 3000 && open http://localhost:3000/index.html

# Check contract deployment
npx hardhat verify --network localhost <CONTRACT_ADDRESS>

# Debug transactions
npx hardhat run scripts/debug.js --network localhost
```

## 📄 License

MIT License - see LICENSE file for details.

---

🌟 **Ready to test? Start the browser interface at http://localhost:3000/index.html for the best testing experience!**

**Note**: This project uses a Mock Oracle for development and testing. The browser interface provides real-time contract interaction with automatic result formatting. For production use, integrate with real oracle price feeds from providers like Chainlink, Band Protocol, or API3.
