// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {TwitterProver} from "../contracts/proof/TwitterProver.sol";
import {TwitterAccountVerifier} from "../contracts/proof/TwitterAccountVerifier.sol";

import {ContestFactory} from "../contracts/ContestFactory.sol";

contract ContestFactoryScript is Script {
    
    TwitterProver twitterProver;
    TwitterAccountVerifier twitterAccountVerifier;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Create prover
        twitterProver = new TwitterProver();
        twitterAccountVerifier = new TwitterAccountVerifier(address(twitterProver));
        
        // Pyth
        address entropyAddress = 0x4821932D0CDd71225A6d914706A621e0389D7061;
        address pythContractAddress = 0x0708325268dF9F66270F1401206434524814508b;

        // Deploy Contest factory
        ContestFactory factory = new ContestFactory(
            address(twitterProver),
            address(twitterAccountVerifier),
            entropyAddress,
            pythContractAddress
        );

        vm.stopBroadcast();
    }
}
