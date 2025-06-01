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

contract Contest is Ownable, IEntropyConsumer {
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

    //Pyth PriceFeeds storage
    int256 public lastPrice;
    uint256 public lastConf;
    uint256 public lastPublishTime;

    // Link to Entropy smart contracts: https://docs.pyth.network/entropy/contract-addresses
    // entropy Address in Optimism Sepolia: 0x4821932D0CDd71225A6d914706A621e0389D7061

    // Link for PriceFeeds contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm
    // Pyth Price Feeds contract address for OP Sepolia: 	0x0708325268dF9F66270F1401206434524814508b

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

    function updateETHPrice(bytes[] calldata priceUpdate) public payable {
        uint fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{value: fee}(priceUpdate);

        bytes32 priceFeedId = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH/USD
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            priceFeedId,
            60
        );

        // Save the price info in contract storage
        lastPrice = price.price;
        lastConf = price.conf;
        lastPublishTime = price.publishTime;

        emit PriceUpdated(price.price, price.conf, price.publishTime);
    }

    function getLastETHPrice()
        public
        view
        returns (int256 price, uint256 conf, uint256 publishTime)
    {
        return (lastPrice, lastConf, lastPublishTime);
    }

    // FIXME: TODO: When creating a contest, we need to create a price in ETH
    // Then, the idea will be to convert the ETH price to USD for the user
    // This is how we can use pyth network price feed!

    // 3.0: Registry part

    function joinContest() external {
        // Twitter handle should be verified
        require(
            ContestFactory(contestFactoryAddress).isTwitterAccountVerified(
                msg.sender
            ),
            "NOT_VERIFIER"
        );
        uint256 a = 1; // FIXME:
    }

    /// @notice register to a contest
    function register(string memory handle) public {
        // require(ContestFactory(contestFactoryAddress).isTwitterAccountVerified(msg.sender), "not_verified");
        require(block.timestamp <= endTimeContest, "Contest has ended");

        bytes32 convertedHandle = keccak256(abi.encodePacked(handle));
        require(
            alreadyRegistered[convertedHandle] == false,
            "Handle already registered"
        );

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
        address entropyProvider = entropy.getDefaultProvider();

        // Random Number generation
        uint256 requestFee = entropy.getFee(entropyProvider);
        if (msg.value < requestFee) revert("not enough fees");

        // Request the random number with the callback
        // No need to store the sequence number in our case
        entropy.requestWithCallback{value: requestFee}(
            entropyProvider,
            userRandomNumber
        );
    }

    function requestRandomNumber(bytes32 userRandomNumber) external payable {
        // Get the default provider and the fee for the request
        address entropyProvider = entropy.getDefaultProvider();
        uint256 fee = entropy.getFee(entropyProvider);

        // Request the random number with the callback
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
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        uint256 rawRandom = uint256(randomNumber);
        winningNumber = (rawRandom % numberOfParticipants);
        emit WinnerChosen(1);
    }

    // It returns the address of the entropy contract which will call the callback.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function getEntropyFee() public view returns (uint256) {
        return entropy.getFee(entropy.getDefaultProvider());
    }

}
