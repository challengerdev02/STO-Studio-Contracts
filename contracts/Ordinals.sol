// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./lib/Errors.sol";

contract Ordinals is OwnableUpgradeable {

    address public _admin; // is a mutil sig address when deploy
    address public _parameterAddr;

    mapping(address => bool) public _caller;
    mapping(address => mapping(uint256 => string)) public _inscription;

    function initialize(address admin, address parameterControl) initializer virtual public {
        require(admin != Errors.ZERO_ADDR, Errors.INV_ADD);
        //        require(parameterControl != Errors.ZERO_ADDR, Errors.INV_ADD);

        _admin = admin;
        _parameterAddr = parameterControl;
        __Ownable_init();
    }

    function changeAdmin(address newAdm) external {
        require(msg.sender == _admin && newAdm != Errors.ZERO_ADDR, Errors.ONLY_ADMIN_ALLOWED);

        if (_admin != newAdm) {
            _admin = newAdm;
        }
    }

    function changeParam(address newAdm) external {
        require(msg.sender == _admin && newAdm != Errors.ZERO_ADDR, Errors.ONLY_ADMIN_ALLOWED);

        if (_parameterAddr != newAdm) {
            _parameterAddr = newAdm;
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
        bytes32 messageHash = keccak256(
            abi.encodePacked(inscriptionId, coll, tokenId)
        );
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == msg.sender, "Invalid signature");

        if (coll != address(0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB)) {
            IERC721Upgradeable tokenERC721 = IERC721Upgradeable(coll);
            require(
                tokenERC721.ownerOf(tokenId) == msg.sender ||
                    _caller[msg.sender] ||
                    msg.sender == _admin,
                "INV_CALLER"
            );
        } else {
            require(_caller[msg.sender] || msg.sender == _admin, "INV_CALLER");
        }
        _inscription[coll][tokenId] = inscriptionId;
    }

    function splitSignature(bytes memory signature)
        public
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(signature.length == 65, "Invalid signature length");

        assembly {
            // First 32 bytes are the signature header, skip them
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))

            // Extract the last byte of the signature header, which contains the value of v
            v := byte(0, mload(add(signature, 96)))
        }

        // If v is 0 or 1, add 27 to it to get the correct value
        if (v < 27) {
            v += 27;
        }

        return (v, r, s);
    }
}