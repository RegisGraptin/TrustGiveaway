// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IEntropyConsumer} from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import {IEntropy} from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";

contract ContestFactory is Ownable, IEntropyConsumer {

    IEntropy entropy;
    address _private;
    uint256 registryId = 1;
    bool contestOngoing = false;
    uint256 winningNumber;

    // entropy Address in Optimism Sepolia: 0x4821932D0CDd71225A6d914706A621e0389D7061
    // Link to Entropy smart contracts: https://docs.pyth.network/entropy/contract-addresses

    struct Registry {
        uint256 id;
        address registryAddress;
        string twitterHandle;
    }

    Registry[] public registries;

    mapping(address => string) handleOfAddress;
    mapping(string => address) public addressOfHandle;

    event WinnerChosen(uint256 winningNumber);

    constructor(address entropyAddress) Ownable(msg.sender){
        entropy = IEntropy(entropyAddress);
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
    uint64 sequenceNumber = entropy.requestWithCallback{ value: fee }(
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
    require(!contestOngoing, "Contest must be ended before resolving winner");

    uint256 rawRandom = uint256(randomNumber);
    winningNumber = (rawRandom % registryId) + 1;

    emit WinnerChosen(winningNumber);
}


    // This method is required by the IEntropyConsumer interface.


    // 2.0: Registry part

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
      require(registries[winningNumber].registryAddress == msg.sender, "You are not the winner of this content");

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
