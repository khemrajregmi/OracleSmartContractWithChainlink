// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceConsumer.sol";

/**
 * @title OracleToken
 * @dev ERC20 token with oracle-based pricing functionality
 * @notice Token that can be minted/burned based on oracle price data
 */
contract OracleToken is ERC20, Ownable {
    PriceConsumer public priceConsumer;
    
    // Token parameters
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public mintRate = 100; // Tokens per unit price (adjustable)
    
    // Events
    event PriceBasedMint(address indexed to, uint256 amount, int256 price);
    event MintRateUpdated(uint256 newRate);
    event PriceConsumerUpdated(address newConsumer);
    
    constructor(
        string memory name,
        string memory symbol,
        address _priceConsumer
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_priceConsumer != address(0), "Invalid price consumer address");
        priceConsumer = PriceConsumer(_priceConsumer);
        
        // Mint initial supply to owner
        _mint(msg.sender, 100000 * 10**decimals()); // 100k initial tokens
    }
    
    /**
     * @dev Mint tokens based on current oracle price
     * @param to The address to mint tokens to
     */
    function mintBasedOnPrice(address to) public {
        require(to != address(0), "Cannot mint to zero address");
        
        int256 currentPrice = priceConsumer.getLatestPrice();
        require(currentPrice > 0, "Invalid price from oracle");
        
        // Calculate mint amount based on price
        // Price is typically in 8 decimals for Chainlink, adjust accordingly
        uint256 mintAmount = (uint256(currentPrice) * mintRate) / (10**8);
        
        require(totalSupply() + mintAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, mintAmount);
        
        emit PriceBasedMint(to, mintAmount, currentPrice);
    }
    
    /**
     * @dev Mint tokens with signature verification
     * @param to The address to mint tokens to
     * @param price The price from oracle
     * @param timestamp The timestamp of the price
     * @param signature The oracle signature
     */
    function mintWithOracleSignature(
        address to,
        int256 price,
        uint256 timestamp,
        bytes memory signature
    ) public {
        require(to != address(0), "Cannot mint to zero address");
        
        // Verify the oracle signature through price consumer
        bytes32 messageHash = keccak256(abi.encodePacked(price, timestamp, address(priceConsumer)));
        address signer = priceConsumer.verifyOracleSignature(messageHash, signature);
        require(signer == priceConsumer.trustedOracle(), "Invalid oracle signature");
        
        // Update price in consumer with signature
        priceConsumer.updatePriceWithSignature(price, timestamp, signature);
        
        // Calculate and mint tokens
        uint256 mintAmount = (uint256(price) * mintRate) / (10**8);
        require(totalSupply() + mintAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, mintAmount);
        
        emit PriceBasedMint(to, mintAmount, price);
    }
    
    /**
     * @dev Burn tokens (only owner)
     * @param from The address to burn tokens from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        require(from != address(0), "Cannot burn from zero address");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        
        _burn(from, amount);
    }
    
    /**
     * @dev Update mint rate (only owner)
     * @param newRate The new mint rate
     */
    function updateMintRate(uint256 newRate) public onlyOwner {
        require(newRate > 0, "Mint rate must be positive");
        mintRate = newRate;
        emit MintRateUpdated(newRate);
    }
    
    /**
     * @dev Update price consumer contract (only owner)
     * @param newConsumer The new price consumer address
     */
    function updatePriceConsumer(address newConsumer) public onlyOwner {
        require(newConsumer != address(0), "Invalid price consumer address");
        priceConsumer = PriceConsumer(newConsumer);
        emit PriceConsumerUpdated(newConsumer);
    }
    
    /**
     * @dev Get current token price based on oracle
     * @return The current price from oracle
     */
    function getCurrentOraclePrice() public view returns (int256) {
        return priceConsumer.getLatestPrice();
    }
    
    /**
     * @dev Calculate mint amount for given price
     * @param price The price to calculate for
     * @return The amount of tokens that would be minted
     */
    function calculateMintAmount(int256 price) public view returns (uint256) {
        require(price > 0, "Price must be positive");
        return (uint256(price) * mintRate) / (10**8);
    }
}
