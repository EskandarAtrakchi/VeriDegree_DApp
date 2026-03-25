# VeriDegree DApp - Educational Certificate NFT Platform

A decentralized platform for issuing, verifying, and managing educational certificates as NFTs on Ethereum Sepolia Testnet with IPFS storage via Pinata.

## Quick Start

### 1. Download the Project

Click the **Download ZIP** button in the top right corner of v0, then extract it:

```bash
unzip VeriDegreeDAppmain.zip
cd VeriDegreeDAppmain
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended for this project)
pnpm install

# Or npm
npm install

# Or yarn
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Pinata credentials:

```
PINATA_API_KEY=f73dd98a8fea79f31463
PINATA_JWT=A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud
```

### 4. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Features

✅ **Issue Certificates** - Create NFT certificates for students
✅ **Verify Certificates** - Check certificate authenticity on blockchain
✅ **View Certificates** - Students can view their certificates
✅ **IPFS Storage** - All metadata and images stored on Pinata
✅ **Blockchain Integration** - Ethereum Sepolia Testnet
✅ **MetaMask Integration** - Easy wallet connection

## System Architecture

```
User Interface (Next.js + React)
         ↓
   Web3 Integration (ethers.js)
         ↓
   Smart Contract (Sepolia)
         ↓
   Certificate NFTs
```

```
Pinata (IPFS)
    ↓
Certificate Images
Certificate Metadata
    ↓
Blockchain Reference
```

## Roles

### Issuer
- Issues certificates to student wallets
- Uploads certificate images
- Creates certificate metadata
- Must be contract owner

### Viewer
- Views own issued certificates
- Displays certificate details
- Accesses IPFS metadata

### Verifier
- Searches for certificates by wallet address
- Verifies certificate authenticity
- Views certificate details
- No wallet restrictions

## Tech Stack

- **Framework:** Next.js 16
- **UI:** React 19 + shadcn/ui
- **Blockchain:** ethers.js + Ethereum Sepolia
- **Storage:** Pinata + IPFS
- **Styling:** Tailwind CSS
- **Wallet:** MetaMask

## Prerequisites

✓ Node.js 18+
✓ MetaMask (or Web3 wallet)
✓ Sepolia ETH (testnet)
✓ Pinata Account

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| PINATA_JWT | Yes | `A5zHFxm4fJbBBreUq3...` |
| PINATA_API_KEY | Yes | `f73dd98a8fea79f31463` |
| NEXT_PUBLIC_PINATA_GATEWAY | Yes | `rose-known-carp-497.mypinata.cloud` |
| NEXT_PUBLIC_PINATA_GATEWAY_TOKEN | No | `your-token-if-restricted` |

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Routes

### POST /api/pinata/upload-file
Upload certificate images to IPFS
- **Body:** FormData with `file` field
- **Returns:** `{ IpfsHash, PinSize, Timestamp }`

### POST /api/pinata/upload-json
Upload certificate metadata to IPFS
- **Body:** JSON object with certificate data
- **Returns:** `{ IpfsHash, PinSize, Timestamp }`

## Smart Contract

- **Network:** Ethereum Sepolia Testnet
- **Address:** `0xf16e31f337a0197C3F65893e4F0C4e483e70b447`
- **Owner:** `0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD`
- **Functions:**
  - `issueCertificate()` - Issue new certificate NFT
  - `getCertificatesForAddress()` - Fetch user certificates
  - `verifyCertificate()` - Verify certificate authenticity

## Certificate Data Structure

```json
{
  "name": "Bachelor of Science in Computer Science - John Doe",
  "description": "Educational certificate from National College of Ireland",
  "image": "https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxxx...",
  "attributes": [
    { "trait_type": "Institution", "value": "National College of Ireland" },
    { "trait_type": "Student Name", "value": "John Doe" },
    { "trait_type": "Degree", "value": "Bachelor of Science in Computer Science" },
    { "trait_type": "Graduation Date", "value": "2024-06-15" }
  ]
}
```

## Troubleshooting

### Certificate upload fails
- Check `PINATA_JWT` is correct
- Verify Pinata API is accessible
- Check browser console for errors

### MetaMask errors
- Ensure MetaMask is on Sepolia network
- Check wallet has sufficient ETH balance
- Try disconnecting and reconnecting wallet

### IPFS retrieval errors
- IPFS can be slow - wait and retry
- Check Pinata gateway is accessible
- Verify `NEXT_PUBLIC_PINATA_GATEWAY` is correct

### "Not contract owner" error
- Only the owner wallet can issue certificates
- Check you're using the correct wallet
- Owner: `0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD`

## Getting Testnet ETH

Visit [Sepolia Faucet](https://www.sepoliafaucet.com/) and follow the instructions.

## File Structure

```
├── app/
│   ├── api/pinata/              # Pinata upload endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── issue-certificate-form.tsx   # Issuer form
│   ├── viewer-dashboard.tsx         # Viewer dashboard
│   ├── verifier-dashboard.tsx       # Verifier dashboard
│   ├── wallet-connection.tsx        # Wallet integration
│   └── ui/                          # shadcn components
├── lib/
│   ├── ipfs-provider.ts         # Pinata/IPFS functions
│   ├── web3-provider.ts         # Blockchain functions
│   └── utils.ts                 # Utilities
├── .env.local.example           # Environment template
├── SETUP.md                     # Detailed setup guide
└── package.json
```

## Next Steps

1. **Install project** - Follow Quick Start above
2. **Set up wallet** - Install MetaMask, switch to Sepolia
3. **Get testnet ETH** - Use Sepolia Faucet
4. **Run the app** - `pnpm dev`
5. **Issue certificates** - Use Issuer role
6. **Verify certificates** - Use Verifier role

## Resources

- [Pinata Docs](https://docs.pinata.cloud/)
- [Sepolia Faucet](https://www.sepoliafaucet.com/)
- [ethers.js Docs](https://docs.ethers.org/)
- [Next.js Docs](https://nextjs.org/docs/)
- [MetaMask Docs](https://docs.metamask.io/)

## License

This project is part of the VeriDegree DApp ecosystem.

## Support

For issues or questions:
1. Check the SETUP.md guide
2. Review browser console for errors
3. Verify environment variables
4. Check Pinata dashboard for quota/issues

---

**Version:** 1.0.0  
**Last Updated:** 2026
