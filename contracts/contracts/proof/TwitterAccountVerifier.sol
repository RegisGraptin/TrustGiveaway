// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

import {TwitterProver} from "./TwitterProver.sol";

import {ITwitterAccountVerifier} from "../interfaces/ITwitterAccountVerifier.sol";

contract TwiterAccountVerifier is ITwitterAccountVerifier, Verifier {

    address twitterProver;

    mapping(bytes32 => address) public handleToUser;
    mapping(address => bytes32) public userToHandle;

    constructor(address _twitterProver) {
        twitterProver = _twitterProver;
    }

    function verifyTwitterAccount(Proof calldata, string memory handle) 
        public
        onlyVerified(twitterProver, TwitterProver.proofOfAccount.selector)
    {
        bytes32 handler = keccak256(abi.encodePacked(handle));
        require(handleToUser[handler] == address(0), "already_register");
        handleToUser[handler] = msg.sender;
        userToHandle[msg.sender] = handler;
    }

    function isVerified(address account) external returns (bool) {
        return userToHandle[account] != bytes32(0);
    }

}
