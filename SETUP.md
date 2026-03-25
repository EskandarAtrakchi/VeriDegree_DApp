# VeriDegree DApp - Setup Guide

This is a decentralized educational certificate platform built on Ethereum (Sepolia Testnet) with IPFS/Pinata storage.

## Prerequisites

- **Node.js** 18+ (recommended 20+)
- **pnpm** package manager (or npm/yarn)
- **MetaMask** or similar Web3 wallet extension
- **Sepolia ETH** (testnet ETH for gas fees) - [Get free testnet ETH](https://www.sepoliafaucet.com/)
- **Pinata Account** - [Sign up here](https://www.pinata.cloud/)

## Installation Steps

### 1. Clone/Extract the Project

```bash
# If you have the ZIP file
unzip VeriDegreeDAppmain.zip
cd VeriDegreeDAppmain

# Or clone from Git
git clone <repository-url>
cd VeriDegreeDAppmain
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with your Pinata credentials:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your credentials
```

**Your `.env.local` should look like this:**

```
PINATA_API_KEY=f73dd98a8fea79f31463
PINATA_JWT=A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud
NEXT_PUBLIC_PINATA_GATEWAY_TOKEN=<optional-if-gateway-is-restricted>
```

### 4. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will start on `http://localhost:3000`

## Wallet Setup

1. **Install MetaMask** (if not already installed)
   - [MetaMask Extension](https://metamask.io/)

2. **Switch to Sepolia Testnet**
   - Open MetaMask
   - Click network selector (top left)
   - Enable "Show test networks" in advanced settings
   - Select "Sepolia"

3. **Get Testnet ETH**
   - Visit [Sepolia Faucet](https://www.sepoliafaucet.com/)
   - Enter your wallet address
   - Claim free testnet ETH

## How to Use the App

### For Issuers
1. Connect your wallet (must be the contract owner)
2. Select "Issuer" role
3. Fill in certificate details:
   - Student wallet address
   - Institution name
   - Student name
   - Degree name
   - Graduation date
   - Optional: Certificate image
4. Click "Issue Certificate"
5. Approve the transaction in MetaMask
6. Wait for confirmation - the certificate is now minted as an NFT!

**The flow:**
- Certificate image → uploaded to Pinata IPFS
- Metadata → uploaded to Pinata IPFS
- NFT minted → on Ethereum Sepolia with IPFS link

### For Viewers/Students
1. Connect your wallet
2. Select "Viewer" role
3. See your issued certificates
4. View certificate details and metadata on IPFS

### For Verifiers
1. Connect your wallet (any wallet)
2. Select "Verifier" role
3. Enter a wallet address to verify
4. See all certificates held by that wallet
5. View certificate details and blockchain proof

## Technical Architecture

### Smart Contract
- **Network:** Ethereum Sepolia Testnet
- **Address:** `0xf16e31f337a0197C3F65893e4F0C4e483e70b447`
- **Owner:** `0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD`
- **Features:**
  - Issue certificates as NFTs
  - Store certificate metadata on-chain
  - Link to IPFS for rich metadata

### Storage
- **IPFS Provider:** Pinata
- **Gateway:** `rose-known-carp-497.mypinata.cloud`
- **What's stored:**
  - Certificate images
  - JSON metadata (institution, degree, graduation date)
  - Full certificate details accessible to all users

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS + shadcn/ui
- **Web3:** ethers.js
- **Wallet:** MetaMask integration

## Troubleshooting

### "Pinata JWT is not configured"
- Check that `PINATA_JWT` is set in `.env.local`
- Verify the token is not expired in Pinata dashboard
- Restart the dev server after changing `.env.local`

### "MetaMask not installed"
- Install MetaMask extension for your browser

### "Not on Sepolia network"
- MetaMask must be switched to Sepolia testnet
- Check MetaMask network selector

### "Insufficient balance"
- You need testnet ETH to pay for transactions
- Get free testnet ETH from [Sepolia Faucet](https://www.sepoliafaucet.com/)

### "Certificate already issued"
- Each wallet address can only hold one certificate
- Use a different wallet address for the student

### Images not loading
- Check that Pinata gateway is accessible
- Verify `NEXT_PUBLIC_PINATA_GATEWAY` is correct
- IPFS can be slow sometimes - wait a moment and refresh

## Building for Production

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Upload File to IPFS
**POST** `/api/pinata/upload-file`
- Uploads images and files
- Returns: `{ IpfsHash, PinSize, Timestamp }`

### Upload JSON to IPFS
**POST** `/api/pinata/upload-json`
- Uploads certificate metadata
- Returns: `{ IpfsHash, PinSize, Timestamp }`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PINATA_API_KEY` | ✓ | Your Pinata API key for authentication |
| `PINATA_JWT` | ✓ | JWT token from Pinata gateway access |
| `NEXT_PUBLIC_PINATA_GATEWAY` | ✓ | Pinata gateway domain name |
| `NEXT_PUBLIC_PINATA_GATEWAY_TOKEN` | ✗ | Token if gateway has restrictions |

## Support & Resources

- **Pinata Docs:** https://docs.pinata.cloud/
- **Sepolia Faucet:** https://www.sepoliafaucet.com/
- **Ethers.js Docs:** https://docs.ethers.org/v6/
- **Next.js Docs:** https://nextjs.org/docs

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Don't share your `PINATA_JWT` token publicly
- Use the gateway token if you want rate limiting
- The Sepolia testnet is for testing only - don't use real funds

## License

This project is part of the VeriDegree DApp ecosystem.
