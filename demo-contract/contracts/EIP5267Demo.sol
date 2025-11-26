// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ECDSA} from  "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from  "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract EIP5267Demo is EIP712 {
    string private constant name = "EIP5267Demo";
    string private constant version = "1";

    constructor() EIP712(name, version) {}

    function checkSignature(address signer, uint256 value, bytes32 r, bytes32 vs) view public returns (bool) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Value(uint256 value)"),
            value
        )));
        address recoveredSigner = ECDSA.recover(digest, r, vs);
        return signer == recoveredSigner;
    }
}
