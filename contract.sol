// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleEduCertificate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // the deployer are the only issuer
    address public owner;

    struct Certificate {
        string institutionName;   // "National College of Ireland"
        string studentName;       // "Eskandar Atrakchi"
        string degreeName;        // "BSc in Computing"
        string graduationDate;    // "2026-06-01"
        string metadataURI;       // IPFS URI (same as tokenURI)
        uint256 issuedAt;         // timestamp
    }

    // tokenId certificate info
    mapping(uint256 => Certificate) public certificates;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() ERC721("SimpleEduCertificate", "SEDU") {
        owner = msg.sender; // the wallet that deploys is the issuer
    }

    /**
     * @notice Issue a new certificate NFT to a student.
     * @param student         Student wallet
     * @param tokenURI_       IPFS URI for the NFT metadata
     * @param institutionName Name of the institution
     * @param studentName     Full name of student
     * @param degreeName      Degree / certificate name
     * @param graduationDate  
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

        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint NFT to the student
        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);

        // Save simple info on-chain
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
    // OZ v5 uses _update instead of _beforeTokenTransfer
    // ----------------------------
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        // from = current owner (0 if minting)
        address from = _ownerOf(tokenId);

        // If from != 0 and to != 0 => a normal transfer (block it)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }

        // Allow minting (from = 0) and burning (to = 0)
        return super._update(to, tokenId, auth);
    }
}

// contract address: 0x0F94b84E3e898B8ccbF2CdE51729a116a25A1dfa