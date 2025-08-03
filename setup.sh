#!/bin/bash

# Oracle Smart Contract Project Setup Script
# This script helps you get started with the Oracle integration project

echo "🔮 Oracle Smart Contract Project Setup"
echo "======================================"

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking prerequisites..."
check_tool "node"
check_tool "npm" 
check_tool "docker"
check_tool "docker-compose"

echo -e "\n🔧 Installing dependencies..."
npm install

echo -e "\n📝 Compiling contracts..."
npx hardhat compile

echo -e "\n🧪 Running basic tests..."
npx hardhat test --grep "Deployment"

echo -e "\n🚀 Setup complete! Here's what you can do next:"
echo ""
echo "1. Start a local Hardhat network:"
echo "   npx hardhat node"
echo ""
echo "2. Deploy contracts (in another terminal):"
echo "   npx hardhat run scripts/deploy.js --network localhost"
echo ""
echo "3. Test oracle interactions:"
echo "   npx hardhat run scripts/request-price.js --network localhost"
echo ""
echo "4. Run full test suite:"
echo "   npx hardhat test"
echo ""
echo "5. Start Docker Chainlink node:"
echo "   cd chainlink && docker-compose up -d"
echo ""
echo "6. Use VS Code tasks (Ctrl+Shift+P > Tasks: Run Task):"
echo "   - Start Hardhat Node"
echo "   - Deploy Oracle Contracts"
echo "   - Run Hardhat Tests"
echo ""
echo "💡 Check the README.md for detailed documentation!"
echo "🎉 Happy coding!"
