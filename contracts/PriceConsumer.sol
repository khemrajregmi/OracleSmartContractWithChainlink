// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceConsumer
 * @dev Oracle consumer contract with signature verification
 * @notice Consumes price data from Chainlink oracles and verifies signatures
 */
contract PriceConsumer is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    AggregatorV3Interface internal priceFeed;
    
    // Events
    event PriceUpdated(int256 price, uint256 timestamp);
    event SignatureVerified(address signer, bytes32 messageHash);
    event OracleUpdated(address newOracle);
    
    // State variables
    int256 public latestPrice;
    uint256 public lastUpdateTime;
    address public trustedOracle;
    
    // Mapping to prevent replay attacks
    mapping(bytes32 => bool) public usedHashes;
    
    constructor(address _priceFeed, address _trustedOracle) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        trustedOracle = _trustedOracle;
    }

    /**
     * @dev Get the latest price from Chainlink oracle
     * @return price The latest price from the oracle
     */
    function getLatestPrice() public view returns (int256) {
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        require(timeStamp > 0, "Round not complete");
        return price;
    }
    
    /**
     * @dev Update price with signature verification
     * @param _price The new price value
     * @param _timestamp The timestamp of the price update
     * @param _signature The signature from the trusted oracle
     */
    function updatePriceWithSignature(
        int256 _price,
        uint256 _timestamp,
        bytes memory _signature
    ) public {
        require(_timestamp > lastUpdateTime, "Timestamp must be newer");
        require(_timestamp <= block.timestamp + 300, "Timestamp too far in future"); // 5 min tolerance
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(_price, _timestamp, address(this)));
        require(!usedHashes[messageHash], "Message hash already used");
        
        // Verify signature
        address signer = verifyOracleSignature(messageHash, _signature);
        require(signer == trustedOracle, "Invalid signature");
        
        // Update state
        latestPrice = _price;
        lastUpdateTime = _timestamp;
        usedHashes[messageHash] = true;
        
        emit PriceUpdated(_price, _timestamp);
        emit SignatureVerified(signer, messageHash);
    }
    
    /**
     * @dev Verify oracle signature
     * @param messageHash The hash of the message
     * @param signature The signature to verify
     * @return The address that signed the message
     */
    function verifyOracleSignature(
        bytes32 messageHash, 
        bytes memory signature
    ) public pure returns (address) {
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        return ethSignedMessageHash.recover(signature);
    }
    
    /**
     * @dev Update the trusted oracle address (only owner)
     * @param _newOracle The new trusted oracle address
     */
    function updateTrustedOracle(address _newOracle) public onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        trustedOracle = _newOracle;
        emit OracleUpdated(_newOracle);
    }
    
    /**
     * @dev Update the price feed address (only owner)
     * @param _newPriceFeed The new price feed address
     */
    function updatePriceFeed(address _newPriceFeed) public onlyOwner {
        require(_newPriceFeed != address(0), "Invalid price feed address");
        priceFeed = AggregatorV3Interface(_newPriceFeed);
    }
    
    /**
     * @dev Get price details
     * @return price The latest price
     * @return timestamp The last update timestamp
     * @return roundId The latest round ID from Chainlink
     */
    function getPriceDetails() public view returns (int256 price, uint256 timestamp, uint80 roundId) {
        (roundId, price, , timestamp, ) = priceFeed.latestRoundData();
        return (price, timestamp, roundId);
    }
}
