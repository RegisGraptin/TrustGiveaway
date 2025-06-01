// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITwitterAccountVerifier} from "./interfaces/ITwitterAccountVerifier.sol";
import "./MockERC20.sol"; 

import "./Contest.sol";

contract ContestFactory {

    MyToken public myToken; 
    // VLayer Verifier
    address public twitterProverAddress;
    address public twitterAccountVerifierAddress;

    mapping(uint256 _contestId => address _contestAddress) public contestAddress;

    uint256 public contestId;

    address entropyAddress;
    address pythContract;
    address entropyProvider;

    constructor(
        address _twitterProverAddress,
        address _twitterAccountVerifierAddress,
        address _entropyAddress,
        address _pythContract,
        address _myTokenAddress
    ) {
        twitterProverAddress = _twitterProverAddress;
        twitterAccountVerifierAddress = _twitterAccountVerifierAddress;

        entropyAddress = _entropyAddress;
        pythContract = _pythContract;
        
        myToken = MyToken(_myTokenAddress);
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

        myToken.mint(address(_contest), 1 * 10 ** myToken.decimals());

        contestId++;
    }

    /// @notice Verify that the twitter account is verified
    function isTwitterAccountVerified(address account) external returns (bool) {
        return ITwitterAccountVerifier(twitterAccountVerifierAddress).isVerified(account);
    }

}
