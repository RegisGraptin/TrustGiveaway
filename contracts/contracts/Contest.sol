// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

import {IEntropyConsumer} from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import {IEntropy} from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

import {TwitterProver} from "./proof/TwitterProver.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

import {ContestFactory} from "./ContestFactory.sol";

contract Contest is Ownable, Verifier, IEntropyConsumer {

    address contestFactoryAddress;


    IPyth pyth; // Pyth Pricefeeds
    IEntropy entropy; // Pyth Entropy

    // Contest metadata
    string public twitterStatusId;
    string public description;
    uint256 public startTimeContest;
    uint256 public endTimeContest;
    uint256 public numberOfParticipants;
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

    mapping(bytes32 hashinBytes => bool seen) public alreadyRegistered;
    mapping(address => bool) public hasUserParticipated;

    event WinnerChosen(uint256 winningNumber);
    event PriceUpdated(int64 price, uint64 confidence, uint256 publishTime);

    constructor(
        address entropyAddress,
        address pythContract,
        address _owner,
        string memory _twitterStatusId,
        string memory _description,
        uint256 _endTimeContest
    ) Ownable(_owner) {
        // Save the factory address contract
        contestFactoryAddress = msg.sender;

        entropy = IEntropy(entropyAddress);
        pyth = IPyth(pythContract);
        
        // Save contest metadata
        twitterStatusId = _twitterStatusId;
        description = _description;
        startTimeContest = block.timestamp;
        endTimeContest = _endTimeContest;
    }

    

    // 2.0 Pyth Price Feeds part
    // FIXME: DELETE ??
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

    // FIXME: TODO: When creating a contest, we need to create a price in ETH
    // Then, the idea will be to convert the ETH price to USD for the user
    // This is how we can use pyth network price feed!

    // 3.0: Registry part

    function joinContest() external {
        // Twitter handle should be verified
        require(ContestFactory(contestFactoryAddress).isTwitterAccountVerified(msg.sender), "NOT_VERIFIER");
        uint256 a = 1;  // FIXME:
    }

    /// @notice register to a contest
    function register(string memory handle) public {
        // FIXME: add verifier for the post
        require(ContestFactory(contestFactoryAddress).isTwitterAccountVerified(msg.sender), "not_verified");
        require(block.timestamp <= endTimeContest, "Contest has ended");

        bytes32 convertedHandle = keccak256(abi.encodePacked(handle));
        require(
            alreadyRegistered[convertedHandle] == false,
            "Handle already registered"
        );
        
        // Create a new Registry entry, CHECK: This might not needed

        Registry memory newRegistry = Registry({
            id: numberOfParticipants,
            registryAddress: msg.sender,
            twitterHandle: handle
        });

        numberOfParticipants++;
        registries.push(newRegistry);
        alreadyRegistered[convertedHandle] = true;
        hasUserParticipated[msg.sender] = true;
    }

    function endContest(bytes32 userRandomNumber) public payable {
        require(block.timestamp >= endTimeContest, "contest is still ongoing");
        // For future version, we need a way for the owner to claim back the price,
        // else the fund will be locked if no one participate.
        require(numberOfParticipants > 0, "No participants registered");

        // random Number generation
        address entropyProvider = entropy.getDefaultProvider();
        uint256 fee = entropy.getFee(entropyProvider);

        // Request the random number with the callback
        // No need to store the sequence number in our case
        entropy.requestWithCallback{value: fee}(
            entropyProvider,
            userRandomNumber
        );
    }

    /// @notice only winner can call it
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
        require(block.timestamp <= endTimeContest, "Contest is still ongoing");
        require(winningNumber > 0, "Winner not chosen yet");

        return registries[winningNumber - 1];
    }


    ///
    /// Pyth Randomness functions
    ///
    
    /// @notice Entropy callback - Defined the winner of the contest
    function entropyCallback(
        uint64 /* sequenceNumber */,
        address /* provider */,
        bytes32 randomNumber
    ) internal override {
        uint256 rawRandom = uint256(randomNumber);
        winningNumber = (rawRandom % numberOfParticipants);
        emit WinnerChosen(winningNumber);
    }

    // It returns the address of the entropy contract which will call the callback.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function getEntropyFee(address provider) public view returns (uint256) {
        return entropy.getFee(provider);
    }

    function getEntropyProvider() public view returns (address) {
        return entropy.getDefaultProvider();
    }
}
