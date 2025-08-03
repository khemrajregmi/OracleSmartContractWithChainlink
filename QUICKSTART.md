# 🚀 Quick Start Guide

Get your Oracle Smart Contract project running in minutes!

## ⚡ Fastest Setup (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Start local blockchain
npm run node

# 3. Deploy contracts (in new terminal)
npm run deploy
```

## 🎯 Test Oracle Integration

```bash
# Test oracle price updates and token minting
npm run oracle:test
```

## 🧪 Run Tests

```bash
# Basic tests
npm test

# With gas reporting
npm run test:gas
```

## 🌐 Browser Testing Interface

```bash
# Start browser interface for interactive testing
python3 -m http.server 3000

# Open browser at http://localhost:3000/index.html
# Features: Real-time testing, automatic result conversion, system monitoring
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run test suite |
| `npm run test:gas` | Run tests with gas reporting |
| `npm run node` | Start local Hardhat network |
| `npm run deploy` | Deploy contracts to localhost |
| `npm run oracle:test` | Test oracle interactions |
| `npm run setup` | Run complete setup script |

## 🎮 VS Code Tasks

Press `Ctrl+Shift+P` → `Tasks: Run Task` → Choose:
- **Start Hardhat Node** - Launch blockchain
- **Deploy Oracle Contracts** - Deploy to localhost
- **Run Hardhat Tests** - Execute test suite
- **Start Browser Interface** - Launch testing dashboard

## 📊 Contract Addresses

After deployment, contracts are deployed to these deterministic addresses:
- `MOCK_ORACLE_ADDRESS` - Mock Oracle price feed (`0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`)
- `PRICE_CONSUMER_ADDRESS` - Oracle consumer contract (`0x610178dA211FEF7D417bC0e6FeD39F05609AD788`)
- `ORACLE_TOKEN_ADDRESS` - ERC20 token with oracle integration (`0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`)

*Check `.env` file for current addresses or use the browser interface*

## 🔧 Troubleshooting

**Port conflicts?**
- Hardhat: Port 8545
- Browser Interface: Port 3000

**Network issues?**
```bash
# Check if Hardhat node is running
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Restart if needed
npm run node
```

**Test failures?**
```bash
npm run compile
npm test
```

**Browser interface not loading?**
```bash
python3 -m http.server 3000
# Then open http://localhost:3000/index.html
```

## 📚 Next Steps

1. 📖 Read the full [README.md](./README.md)
2. 🌐 Try the browser interface at `http://localhost:3000/index.html`
3. 🔍 Explore contracts in `/contracts/`
4. 🧪 Check tests in `/test/`
5. 📜 Review scripts in `/scripts/`
6. � Import Postman collection for API testing

---
Happy building! 🏗️⚡
