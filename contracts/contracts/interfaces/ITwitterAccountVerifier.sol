// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITwitterAccountVerifier {
    function isVerified(address account) external returns (bool);
}