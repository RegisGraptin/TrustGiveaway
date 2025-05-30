// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Contest.sol";

contract ContestFactory {

    mapping(uint256 _contestId => address _contestAddress) public contestAddress;

    uint256 public contestId;

    address entropyAddress;
    address pythContract;

    constructor(
        address _entropyAddress,
        address _pythContract
    ) {
        entropyAddress = _entropyAddress;
        pythContract = _pythContract;
    }

    function createNewContest(
        string memory _twitterStatusId,
        string memory _description,
        uint256 _endTimeContest
    ) external {
        
        // Create a new Contest and save the address 
        Contest _contest = new Contest(
            entropyAddress,
            pythContract,
            _twitterStatusId,
            _description,
            _endTimeContest
        );
        contestAddress[contestId] = address(_contest);

        contestId++;
    }

}
