// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IEntropyConsumer} from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import {IEntropy} from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract ContestFactory is Ownable, IEntropyConsumer {
    IPyth pyth; // Pyth Pricefeeds
    IEntropy entropy; // Pyth Entropy
    address _private;
    uint256 registryId = 1;
    bool contestOngoing = false;
    uint256 winningNumber;

    // entropy Address in Optimism Sepolia: 0x4821932D0CDd71225A6d914706A621e0389D7061
    // Link to Entropy smart contracts: https://docs.pyth.network/entropy/contract-addresses
    // Pyth Price Feeds contract address for OP Sepolia: 	0x0708325268dF9F66270F1401206434524814508b
    // Link for PriceFeeds contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm

    struct Registry {
        uint256 id;
        address registryAddress;
        string twitterHandle;
    }

    Registry[] public registries;

    mapping(address => string) handleOfAddress;
    mapping(string => address) public addressOfHandle;

    event WinnerChosen(uint256 winningNumber);
    event PriceUpdated(int64 price, uint64 confidence, uint256 publishTime);

    constructor(
        address entropyAddress,
        address pythContract
    ) Ownable(msg.sender) {
        entropy = IEntropy(entropyAddress);
        pyth = IPyth(pythContract);
    }

    function createContest() public onlyOwner {
        contestOngoing = true;
    }

    // 1.0: Pyth Entropy Part:

    function requestRandomNumber(bytes32 userRandomNumber) external payable {
        // Get the default provider and the fee for the request
        address entropyProvider = entropy.getDefaultProvider();
        uint256 fee = entropy.getFee(entropyProvider);

        // Request the random number with the callback
        uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(
            entropyProvider,
            userRandomNumber
        );
        // Store the sequence number to identify the callback request
    }

    function entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        require(
            !contestOngoing,
            "Contest must be ended before resolving winner"
        );

        uint256 rawRandom = uint256(randomNumber);
        winningNumber = (rawRandom % registryId) + 1;

        emit WinnerChosen(winningNumber);
    }

    // 2.0 Pyth Price Feeds part

    /**
     * This method is an example of how to interact with the Pyth contract.
     * Fetch the priceUpdate from Hermes and pass it to the Pyth contract to update the prices.
     * Add the priceUpdate argument to any method on your contract that needs to read the Pyth price.
     * See https://docs.pyth.network/price-feeds/fetch-price-updates for more information on how to fetch the priceUpdate.
 
     * @param priceUpdate The encoded data to update the contract with the latest price
     */
    function exampleMethod(bytes[] calldata priceUpdate) public payable {
        // Submit a priceUpdate to the Pyth contract to update the on-chain price.
        // Updating the price requires paying the fee returned by getUpdateFee.
        // WARNING: These lines are required to ensure the getPriceNoOlderThan call below succeeds. If you remove them, transactions may fail with "0x19abf40e" error.
        uint fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{value: fee}(priceUpdate);

        // Read the current price from a price feed if it is less than 60 seconds old.
        // Each price feed (e.g., ETH/USD) is identified by a price feed ID.
        // The complete list of feed IDs is available at https://pyth.network/developers/price-feed-ids
        bytes32 priceFeedId = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH/USD
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            priceFeedId,
            60
        );
        emit PriceUpdated(price.price, price.conf, price.publishTime);
    }

    // 3.0: Registry part

    function register(string memory handle) public {
        require(contestOngoing == true, "Contest is not open");
        // require(addressOfHandle[handle] == address(0), "Handle already taken");

        // Create a new Registry entry

        Registry memory newRegistry = Registry({
            id: registryId,
            registryAddress: msg.sender,
            twitterHandle: handle
        });

        registries.push(newRegistry);
        registryId++;
        addressOfHandle[handle] = msg.sender;
    }

    function endContest(bytes32 userRandomNumber) public payable onlyOwner {
        require(contestOngoing, "No contest ongoing");
        require(registryId > 1, "No participants");

        contestOngoing = false;

        address entropyProvider = entropy.getDefaultProvider();
        uint256 fee = entropy.getFee(entropyProvider);

        entropy.requestWithCallback{value: fee}(
            entropyProvider,
            userRandomNumber
        );
    }

    function claim() public {
        require(
            registries[winningNumber].registryAddress == msg.sender,
            "You are not the winner of this content"
        );

        // TODO: Sending the ERC20 token to the winner
    }

    function getRegistries() public view returns (Registry[] memory) {
        return registries;
    }

    function getWinner() public view returns (Registry memory) {
        require(winningNumber > 0, "Winner not chosen yet");

        return registries[winningNumber - 1];
    }

    // It returns the address of the entropy contract which will call the callback.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function getEntropyFee(address provider) public view returns (uint256) {
        return entropy.getFee(provider);
    }
}
