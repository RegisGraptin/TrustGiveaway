// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {TwitterProver} from "./proof/TwitterProver.sol";
import {TwiterAccountVerifier} from "./proof/TwiterAccountVerifier.sol";

import "./Contest.sol";

contract ContestFactory {

    TwitterProver twitterProver;
    TwiterAccountVerifier twitterAccountVerifier;

    mapping(uint256 _contestId => address _contestAddress) public contestAddress;

    uint256 public contestId;

    address entropyAddress;
    address pythContract;
    address entropyProvider;

    constructor(
        address _entropyAddress,
        address _pythContract
    ) {
        entropyAddress = _entropyAddress;
        pythContract = _pythContract;

        // Deployed new Twitter Account Verifier
        twitterProver = new TwitterProver();
        twitterAccountVerifier = new TwiterAccountVerifier(address(twitterProver));
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
            msg.sender,
            _twitterStatusId,
            _description,
            _endTimeContest
        );
        contestAddress[contestId] = address(_contest);

        contestId++;
    }

    /// @notice Verify that the twitter account is verified
    function isTwitterAccountVerified(address account) external returns (bool) {
        return twitterAccountVerifier.isVerified(account);
    }

}
