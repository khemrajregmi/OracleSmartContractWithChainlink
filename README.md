# 🔮 Oracle Smart Contract Project

A comprehensive Ethereum smart contract project featuring **Mock Oracle Integration** for development and testing. This project demonstrates price feeds, signature verification, and token minting based on oracle data.

## 🌟 Features

- **🔗 Mock Oracle Integration**: Simulated price feeds for development
- **📊 Price Consumer Contract**: Secure oracle data consumption with ECDSA verification
- **🪙 Oracle Token**: ERC20 token with oracle-based minting mechanisms
- **📋 Complete API Documentation**: OpenAPI spec and Postman collection
- **🧪 Comprehensive Testing**: Full test suite for all contracts
- **🔐 Security Features**: ECDSA signatures and replay attack prevention

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

### 4. Test the System
```bash
# Run all tests
npm test

# Test oracle functionality
npx hardhat run scripts/test-oracle.js --network localhost
```

## 📊 Contract Addresses

After deployment, contracts are deployed to these deterministic addresses:
- **Mock Oracle**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Price Consumer**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Oracle Token**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## 💡 Key Contracts

### 🔮 Mock Oracle (`MockV3Aggregator.sol`)
- Simulates price feed behavior
- 8 decimal precision
- Manual price updates for testing

**Key Functions:**
- `latestAnswer()` - Get current price
- `updateAnswer(int256)` - Update price (testing)
- `decimals()` - Get decimal places (8)

### 📊 Price Consumer (`PriceConsumer.sol`)
- Consumes oracle price data
- ECDSA signature verification
- Replay attack prevention

**Key Functions:**
- `getLatestPrice()` - Fetch latest price from oracle
- `verifySignature()` - Verify oracle data signatures

### 🪙 Oracle Token (`OracleToken.sol`)
- ERC20 token with oracle integration
- Price-based minting logic
- Supply cap enforcement

**Key Functions:**
- `mintBasedOnPrice(address)` - Mint tokens based on oracle price
- `getCurrentOraclePrice()` - Get price used for minting

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
        "to": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "data": "0x50d25bcd"
      },
      "latest"
    ],
    "id": 1
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
```

## 🔐 Security Features

- **ECDSA Signature Verification**: Validates oracle data authenticity
- **Replay Attack Prevention**: Message hash tracking prevents reuse
- **Access Control**: Owner-only functions for sensitive operations
- **Supply Limits**: Token minting caps prevent inflation

## 📈 Price Conversion

Oracle prices use 8 decimal places:
- $2000 = `200000000000` (contract format)
- $2500 = `250000000000` (contract format)

## 🛠️ Development Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Run Hardhat console
npx hardhat console --network localhost
```

## �� Testing Workflow

1. **Start Network**: `npx hardhat node`
2. **Deploy Contracts**: `npx hardhat run scripts/deploy.js --network localhost`
3. **Test Price Updates**: Update oracle from $2000 → $2500
4. **Test Token Minting**: Mint tokens based on new price
5. **Verify Balances**: Check token balances increased

## 📚 API Documentation

- **OpenAPI Spec**: Use `openapi.yaml` with Swagger Editor
- **Postman Collection**: Import `postman-collection.json`
- **Detailed Guide**: See `API-README.md`

## 🚀 Next Steps

1. **Frontend Integration**: Build web interface using ethers.js
2. **Real Oracle Integration**: Connect to live oracle price feeds
3. **Testnet Deployment**: Deploy to Sepolia or Goerli testnets
4. **Advanced Features**: Multi-oracle aggregation and governance

---

**Note**: This project uses a Mock Oracle for development. For production use, integrate with real oracle price feeds.
# OracleSmartContractWithChainlink
