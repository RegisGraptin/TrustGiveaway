// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITwitterAccountVerifier} from "./interfaces/ITwitterAccountVerifier.sol";
import "./MockERC20.sol"; 

import "./Contest.sol";

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

// Link for PriceFeeds contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm
// Pyth Price Feeds contract address for OP Sepolia: 	0x0708325268dF9F66270F1401206434524814508b

contract ContestFactory {

    IPyth pyth; // Pyth Pricefeeds
    MyToken public myToken; 
    // VLayer Verifier
    address public twitterProverAddress;
    address public twitterAccountVerifierAddress;

    mapping(uint256 _contestId => address _contestAddress) public contestAddress;

    uint256 public contestId;

    address entropyAddress;
    address pythContract;
    address entropyProvider;

    // Pyth PriceFeeds storage
    int256 public lastPrice;
    uint256 public lastConf;
    uint256 public lastPublishTime;


    event PriceUpdated(int64 price, uint64 confidence, uint256 publishTime);

    constructor(
        address _twitterProverAddress,
        address _twitterAccountVerifierAddress,
        address _entropyAddress,
        address _pythContract,
        address _myTokenAddress
    ) {
        pyth = IPyth(pythContract);

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

    // Pyth Network Price Feed

    function updateETHPrice(bytes[] calldata priceUpdate) public payable {
        uint fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{value: fee}(priceUpdate);

        bytes32 priceFeedId = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH/USD
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            priceFeedId,
            60
        );

        // Save the price info in contract storage
        lastPrice = price.price;
        lastConf = price.conf;
        lastPublishTime = price.publishTime;

        emit PriceUpdated(price.price, price.conf, price.publishTime);
    }

    function getLastETHPrice()
        public
        view
        returns (int256 price, uint256 conf, uint256 publishTime)
    {
        return (lastPrice, lastConf, lastPublishTime);
    }


}
