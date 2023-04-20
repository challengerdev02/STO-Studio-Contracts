// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./lib/Errors.sol";

contract Ordinals is OwnableUpgradeable {
    address public _admin; // is a mutil sig address when deploy

    mapping(address => bool) public _caller;
    mapping(address => mapping(uint256 => string)) public _inscription;

    function initialize(address admin) public virtual initializer {
        require(admin != Errors.ZERO_ADDR, Errors.INV_ADD);
        //        require(parameterControl != Errors.ZERO_ADDR, Errors.INV_ADD);
        _admin = admin;
        __Ownable_init();
    }

    function changeAdmin(address newAdm) external {
        require(
            msg.sender == _admin && newAdm != Errors.ZERO_ADDR,
            Errors.ONLY_ADMIN_ALLOWED
        );

        if (_admin != newAdm) {
            _admin = newAdm;
        }
    }

    function setCaller(address caller, bool approved) external {
        require(msg.sender == _admin, "INV_CALLER");
        _caller[caller] = approved;
    }

    function setInscription(
        address coll,
        uint256 tokenId,
        string memory inscriptionId,
        bytes memory signature
    ) external {
        require(bytes(_inscription[coll][tokenId]).length == 0, "DOUBLE");
        bytes32 hashedMessage = hashMessage(coll, tokenId, inscriptionId);
        address signer = VerifyMessage(hashedMessage, signature);

        require(_caller[signer], "Invalid signature");
        require(_caller[msg.sender] || msg.sender == _admin, "INV_CALLER");
        
        _inscription[coll][tokenId] = inscriptionId;
    }

    function VerifyMessage(
        bytes32 _hashedMessage,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (signature.length != 65) {
            return address(0);
        }

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(
            abi.encodePacked(prefix, _hashedMessage)
        );
        address signer = ecrecover(prefixedHashMessage, v, r, s);

        return signer;
    }

    function hashMessage(
        address coll,
        uint256 tokenId,
        string memory inscriptionId
    ) public pure returns (bytes32) {
        bytes32 _hashedMessage = keccak256(
            abi.encodePacked(coll, tokenId, inscriptionId)
        );
        return _hashedMessage;
    }
}
