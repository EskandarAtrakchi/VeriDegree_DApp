// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SimpleEduCertificate is ERC721URIStorage {

    uint256 private _tokenIdCounter;
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
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() ERC721("SimpleEduCertificate", "SEDU") {
        owner = msg.sender;
    }

    function issueCertificate(
        address student,
        string calldata tokenURI_,
        string calldata institutionName,
        string calldata studentName,
        string calldata degreeName,
        string calldata graduationDate
    ) external onlyOwner returns (uint256) {

        require(student != address(0), "Invalid student");

        uint256 tokenId = ++_tokenIdCounter;

        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        certificates[tokenId] = Certificate({
            institutionName: institutionName,
            studentName: studentName,
            degreeName: degreeName,
            graduationDate: graduationDate,
            metadataURI: tokenURI_,
            issuedAt: block.timestamp
        });

        return tokenId;
    }

    // ❗ SOULBOUND (v4 compatible way)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(from == address(0) || to == address(0), "Soulbound: non-transferable");
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
