// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

import {TwitterProver} from "./TwitterProver.sol";

import {ITwitterPostVerifier} from "../interfaces/ITwitterPostVerifier.sol";

contract TwitterPostVerifier is ITwitterPostVerifier, Verifier {

    address twitterProver;

    mapping(bytes32 => mapping(address => bool)) public tweetRepostedByUser;
    mapping(address => mapping(bytes32 => bool)) public userRepostedTweet;

    constructor(address _twitterProver) {
        twitterProver = _twitterProver;
    }

    function verifyTwitterPost(
        Proof calldata, 
        string memory postUrl,
        address account
    ) 
        public
        onlyVerified(twitterProver, TwitterProver.proofOfAccount.selector)
    {
        bytes32 postId = keccak256(abi.encodePacked(postUrl));
        require(!tweetRepostedByUser[postId][account], "already_register");
        
        tweetRepostedByUser[postId][account] = true;
        userRepostedTweet[account][postId] = true;
    }

    function isVerified(address account, string memory postUrl) external returns (bool) {
        bytes32 postId = keccak256(abi.encodePacked(postUrl));
        return tweetRepostedByUser[postId][account];
    }   


}
