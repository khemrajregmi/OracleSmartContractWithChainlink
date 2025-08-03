# Oracle Smart Contract API Documentation

This directory contains comprehensive API documentation for the Oracle-enabled Smart Contract project.

## Files Overview

- **`openapi.yaml`** - OpenAPI 3.1 specification for the JSON-RPC endpoints
- **`postman-collection.json`** - Ready-to-import Postman collection with all endpoints
- **`API-README.md`** - This documentation file

## Quick Start

### Browser Interface (Recommended)

1. Start Hardhat node: `npx hardhat node`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
3. Start HTTP server: `python3 -m http.server 3000`
4. Open browser: `http://localhost:3000/index.html`
5. Use interactive dashboard for real-time testing

### Import into Postman

1. Open Postman
2. Click **Import** button
3. Choose **`postman-collection.json`**
4. The collection will be imported with all endpoints ready to use

### Using the OpenAPI Spec

1. You can use the `openapi.yaml` file with:
   - **Swagger Editor**: https://editor.swagger.io/
   - **Postman**: Import as OpenAPI 3.0
   - **Insomnia**: Import as OpenAPI
   - **VS Code**: Use OpenAPI extensions for syntax highlighting

## Contract Addresses

The following contracts are deployed on your local Hardhat network:

- **Mock Oracle**: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- **Price Consumer**: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **Oracle Token**: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`
- **Deployer Account**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

*Note: These addresses are consistent across all project documentation and the browser interface*

## API Categories

### 1. Node Operations
- Get block number
- Get accounts
- Get balance
- Get gas price

### 2. Mock Oracle Contract
- Get latest price
- Get decimals
- Get description
- Update price

### 3. Price Consumer Contract
- Get latest price from oracle
- Get stored price
- Get last update time

### 4. Oracle Token Contract
- Get token info (name, symbol, supply)
- Get balance
- Mint tokens based on price
- Get current oracle price

### 5. Transaction Utilities
- Get transaction receipt
- Get transaction by hash
- Estimate gas

## Common Function Selectors

### Mock Oracle Functions
```
latestAnswer()     -> 0x50d25bcd
updateAnswer(int256) -> 0x8c6c4de6
decimals()         -> 0x313ce567
description()      -> 0x7284e416
```

### Price Consumer Functions
```
getLatestPrice()   -> 0x8e15f473
latestPrice()      -> 0x9a6fc8f5
lastUpdateTime()   -> 0x605629d6
```

### Oracle Token Functions
```
balanceOf(address) -> 0x70a08231
totalSupply()      -> 0x18160ddd
name()             -> 0x06fdde03
symbol()           -> 0x95d89b41
mintBasedOnPrice(address) -> 0x6a627842
getCurrentOraclePrice()   -> 0x8e15f473
```

## Price Conversion Examples

### Converting USD to Contract Format

Oracle prices use 8 decimal places. To convert $2500 to contract format:

```javascript
const priceInUSD = 2500;
const decimals = 8;
const contractPrice = priceInUSD * Math.pow(10, decimals);
// Result: 250000000000

// Convert to hex for function call
const hexPrice = contractPrice.toString(16);
// Result: "3a352944000"

// Pad to 64 characters (32 bytes)
const paddedHex = hexPrice.padStart(64, '0');
// Result: "0000000000000000000000000000000000000000000000000000003a352944000"

// Complete function call data (updateAnswer function)
const functionData = "0x8c6c4de6" + paddedHex;
```

### Reading Price Data

When you call `latestAnswer()`, you get a hex result that needs conversion:

```javascript
// Example response: "0x00000000000000000000000000000000000000000000000000000002e90edd000"
const hexResult = "0x00000000000000000000000000000000000000000000000000000002e90edd000";
const decimalValue = parseInt(hexResult, 16);
// Result: 200000000000

const priceInUSD = decimalValue / Math.pow(10, 8);
// Result: 2000 (USD)
```

## Testing Workflow

1. **Start Hardhat Node** (if not running):
   ```bash
   npx hardhat node
   ```

2. **Deploy Contracts** (if not deployed):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Test Basic Operations** in Postman:
   - Get block number
   - Get accounts
   - Get latest price from oracle

4. **Update Oracle Price**:
   - Use "Update Oracle Price" endpoint
   - Check transaction receipt
   - Verify new price with "Get Latest Price"

5. **Mint Tokens**:
   - Use "Mint Tokens Based on Price" endpoint
   - Check token balance before/after
   - Verify total supply changes

## Error Handling

### Common Errors

- **JSON-RPC Parse Error**: Make sure you're using POST requests with proper JSON format
- **Method Not Found**: Check function selector is correct
- **Invalid Address**: Verify contract addresses match deployed contracts
- **Out of Gas**: Increase gas limit in transaction

### Response Format

All successful responses follow JSON-RPC 2.0 format:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x..."
}
```

Error responses:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params"
  }
}
```

## Security Notes

- **Private Keys**: The provided private key is for local testing only
- **Network**: These endpoints work only with your local Hardhat network
- **Gas Limits**: Adjust gas limits based on function complexity
- **Signature Verification**: Some functions require proper ECDSA signatures

## Advanced Usage

### Custom Price Updates

To update the oracle with a custom price:

1. Convert your USD price to contract format (8 decimals)
2. Convert to hex and pad to 64 characters
3. Prepend function selector `0x8c6c4de6`
4. Use in `eth_sendTransaction` call

### Token Minting Logic

The `mintBasedOnPrice` function:
- Gets current oracle price
- Calculates tokens to mint: `price / 1000`
- Mints tokens to specified address
- Enforces maximum supply limit

### Event Monitoring

To monitor contract events, use:
- `eth_getLogs` with contract address and topic filters
- Filter by event signatures for specific events

## Support

For issues or questions:
1. Check Hardhat node is running on `http://localhost:8545`
2. Verify contract addresses in `.env` file
3. Ensure sufficient ETH balance for transactions
4. Check function selectors match contract ABI
