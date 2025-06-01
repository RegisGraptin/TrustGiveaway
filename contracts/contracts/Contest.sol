// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


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

    IEntropy entropy; // Pyth Entropy

    // Contest metadata
    string public twitterStatusId;
    string public description;
    uint256 public startTimeContest;
    uint256 public endTimeContest;
    uint256 public numberOfParticipants;
    uint256 winningNumber;

    // Link to Entropy smart contracts: https://docs.pyth.network/entropy/contract-addresses
    // entropy Address in Optimism Sepolia: 0x4821932D0CDd71225A6d914706A621e0389D7061

    struct Registry {
        uint256 id;
        address registryAddress;
        string twitterHandle;
    }

    Registry[] public registries;

    mapping(bytes32 hashinBytes => bool seen) public alreadyRegistered;
    mapping(address => bool) public hasUserParticipated;

    event WinnerChosen(uint256 winningNumber);

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

        // Save contest metadata
        twitterStatusId = _twitterStatusId;
        description = _description;
        startTimeContest = block.timestamp;
        endTimeContest = _endTimeContest;
    }

    function joinContest(string memory handle) external {
        // Twitter handle should be verified
        require(
            ContestFactory(contestFactoryAddress).isTwitterAccountVerified(
                msg.sender
            ),
            "NOT_VERIFIER"
        );
        register(handle);
    }

    /// @notice register to a contest - test randomness purpose only
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

    /// @notice only winner can call it
    function claim() public {
        require(
            registries[winningNumber].registryAddress == msg.sender,
            "You are not the winner of this content"
        );

        // Send to the winner all the prize
        IERC20 token = IERC20(ContestFactory(contestFactoryAddress).myToken());
        token.transfer(msg.sender, token.balanceOf(address(this)));        
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

    function getEntropyFee() public view returns (uint256) {
        return entropy.getFee(entropy.getDefaultProvider());
    }

}
