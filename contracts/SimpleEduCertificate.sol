// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SimpleEduCertificate is ERC721URIStorage {

    // simple counter (replaces Counters.sol)
    uint256 private _tokenIdCounter;

    // the deployer is the only issuer
    address public owner;

    struct Certificate {
        string institutionName;
        string studentName;
        string degreeName;
        string graduationDate;
        string metadataURI;
        uint256 issuedAt;
    }

    // tokenId => certificate info
    mapping(uint256 => Certificate) public certificates;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() ERC721("SimpleEduCertificate", "SEDU") {
        owner = msg.sender;
    }

    /**
    * @notice Issue a new certificate NFT to a student.
    */
    function issueCertificate(
        address student,
        string calldata tokenURI_,
        string calldata institutionName,
        string calldata studentName,
        string calldata degreeName,
        string calldata graduationDate
    ) external onlyOwner returns (uint256) {
        require(student != address(0), "Invalid student address");

        // increment counter FIRST (starts from 1 instead of 0)
        uint256 newTokenId = ++_tokenIdCounter;

        // Mint NFT to the student
        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);

        // Save certificate data
        certificates[newTokenId] = Certificate({
            institutionName: institutionName,
            studentName: studentName,
            degreeName: degreeName,
            graduationDate: graduationDate,
            metadataURI: tokenURI_,
            issuedAt: block.timestamp
        });

        return newTokenId;
    }

    // ----------------------------
    // Soulbound logic (non-transferable)
    // ----------------------------
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // block transfers (only allow minting & burning)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }

        return super._update(to, tokenId, auth);
    }
}
