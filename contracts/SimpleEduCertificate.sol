// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SimpleEduCertificate is ERC721URIStorage {

    uint256 private _tokenId;
    address public owner;

    struct Certificate {
        string institutionName;
        string studentName;
        string degreeName;
        string graduationDate;
        string metadataURI;
        uint256 issuedAt;
    }

    mapping(uint256 => Certificate) public certificates;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() ERC721("SimpleEduCertificate", "SEDU") {
        owner = msg.sender;
    }

    function issueCertificate(
        address student,
        string memory tokenURI_,
        string memory institutionName,
        string memory studentName,
        string memory degreeName,
        string memory graduationDate
    ) external onlyOwner returns (uint256) {

        require(student != address(0), "Invalid student");

        _tokenId++;

        _safeMint(student, _tokenId);
        _setTokenURI(_tokenId, tokenURI_);

        certificates[_tokenId] = Certificate({
            institutionName: institutionName,
            studentName: studentName,
            degreeName: degreeName,
            graduationDate: graduationDate,
            metadataURI: tokenURI_,
            issuedAt: block.timestamp
        });

        return _tokenId;
    }

    // 🔒 SOULBOUND: block all transfers
    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: non-transferable");
    }
}
