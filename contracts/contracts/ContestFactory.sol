// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {TwitterAccountProver} from "./TwitterAccountProver.sol";

import "./Contest.sol";

contract ContestFactory {

    mapping(uint256 _contestId => address _contestAddress) public contestAddress;

    uint256 public contestId;

    address entropyAddress;
    address pythContract;
    address entropyProvider;

    address twitterAccountProver;

    constructor(
        address _entropyAddress,
        address _pythContract
    ) {
        entropyAddress = _entropyAddress;
        pythContract = _pythContract;

        // Deployed new Twitter Account Verifier
        twitterAccountProver = address(new TwitterAccountProver());
    }

    function createNewContest(
        string memory _twitterStatusId,
        string memory _description,
        uint256 _endTimeContest
    ) external {
        
        // Create a new Contest and save the address 
        Contest _contest = new Contest(
            twitterAccountProver,
            entropyAddress,
            pythContract,
            msg.sender,
            _twitterStatusId,
            _description,
            _endTimeContest
        );
        contestAddress[contestId] = address(_contest);

        contestId++;
    }

}
