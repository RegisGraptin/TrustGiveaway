// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {Web, WebProof, WebProofLib, WebLib} from "vlayer-0.1.0/WebProof.sol";

contract TwitterProver is Prover {
    using Strings for string;
    using WebProofLib for WebProof;
    using WebLib for Web;

    string twitterAccountUrl = "https://api.x.com/1.1/account/settings.json";

    function proofOfAccount(WebProof calldata webProof)
        public
        view
        returns (Proof memory, string memory)
    {
        // FIXME: Chck new function name!
        Web memory web = webProof.verifyWithUrlPrefix(twitterAccountUrl);

        string memory screenName = web.jsonGetString("screen_name");

        return (proof(), screenName);
    }

    function proofOfPost(WebProof calldata webProof, address account)
        public
        view
        returns (Proof memory, string memory, address)
    {
        // TODO: Extract and verify information
    }

    
}
