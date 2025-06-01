// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITwitterPostVerifier {
    function isVerified(address account, string memory postId) external returns (bool);
}