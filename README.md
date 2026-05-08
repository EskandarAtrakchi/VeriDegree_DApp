# VeriDegree
VeriDegree is a blockchain-based application that enables institutions to issue and verify academic
certificates as non-transferable NFTs (Soulbound Tokens) on the SepoliaETH test network.
Access the app here https://veridegreedapp.vercel.app/ 
## Features:

- Issue academic certificates as NFTs (owner only)
- Soulbound (non-transferable certificates)
- Verify certificates by Wallet public address
- Store metadata using IPFS
- MetaMask integration
- Smart contract testing with Hardhat

## Tech Stack:

Blockchain: Solidity, Hardhat, OpenZeppelin, Sepolia Testnet
Frontend: React / Next.js, ethers.js, Tailwind CSS
Storage: IPFS (Pinata)
DevOps: GitHub Actions

## Usage:
- Issue Certificate via form inputs and MetaMask
- Verify Certificate using Token ID

## Limitations:
- Single owner issuer model
- No advanced UI/UX
- No identity verification system

## Future Improvements:
- Multi-institution support
- Layer 2 integration
- QR verification
- DID integration
