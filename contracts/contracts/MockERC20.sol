// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint8 decimal;

    constructor(
        address initialOwner,
        string memory tokenName,
        string memory tokenSymbol,
        uint8 _decimal
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        decimal = _decimal;
    }

    function decimals() public view virtual override returns (uint8) {
        return decimal;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
