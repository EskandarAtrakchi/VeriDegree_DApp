# VeriDegree DApp - Configuration Summary

## Your Pinata Setup

Your Pinata gateway has been configured and is ready to use:

### Pinata Credentials
```
API Key:         f73dd98a8fea79f31463
JWT Token:       A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC
Gateway Domain:  rose-known-carp-497.mypinata.cloud
Gateway URL:     https://rose-known-carp-497.mypinata.cloud
```

### What These Mean

| Item | Purpose | Used By |
|------|---------|---------|
| API Key | Authentication for API calls | Backend uploads |
| JWT Token | Secure gateway access token | API routes (/api/pinata/*) |
| Gateway Domain | IPFS content delivery | Image/metadata retrieval |

## Environment Variables

### File Location
```
.env.local
```

### Required Variables
```env
# Pinata Authentication (REQUIRED)
PINATA_API_KEY=f73dd98a8fea79f31463
PINATA_JWT=A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC

# Pinata Gateway (REQUIRED)
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud

# Pinata Gateway Token (OPTIONAL - only if gateway is restricted)
NEXT_PUBLIC_PINATA_GATEWAY_TOKEN=
```

### How to Create .env.local

**Method 1: Copy & Edit**
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

**Method 2: Manual Creation**
1. Create new file named `.env.local` in project root
2. Paste the required variables above
3. Save the file

### Important Notes

⚠️ **Never share `.env.local`** - Contains sensitive credentials
⚠️ **Never commit to Git** - Use `.gitignore` (already configured)
⚠️ **Restart server after changes** - Dev server must be restarted

## Smart Contract Configuration

### Network: Ethereum Sepolia Testnet

```
Network Name:    Sepolia
Chain ID:        11155111
RPC URL:         https://rpc.sepolia.org
Block Explorer:  https://sepolia.etherscan.io
Test ETH Faucet: https://www.sepoliafaucet.com
```

### Deployed Contract

```
Contract Address: 0xf16e31f337a0197C3F65893e4F0C4e483e70b447
Owner Address:    0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD
Network:          Sepolia Testnet
Type:             Educational Certificate NFT
```

### Where It's Used

File: `lib/web3-provider.ts`
```typescript
export const CONTRACT_ADDRESS = "0xf16e31f337a0197C3F65893e4F0C4e483e70b447"
export const OWNER_ADDRESS = "0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD"
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111
```

## Application Architecture

### Frontend Layers

```
┌─────────────────────────────────────┐
│     User Interface (Next.js)         │
│  - Landing Page                      │
│  - Dashboard (Issuer/Verifier/View)  │
│  - Wallet Connection                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     API Routes (/api/pinata/*)       │
│  - /api/pinata/upload-file           │
│  - /api/pinata/upload-json           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   External Services                  │
│  - Pinata IPFS (Storage)             │
│  - Ethereum RPC (Blockchain)         │
│  - MetaMask (Wallet)                 │
└──────────────────────────────────────┘
```

### Data Flow

**Issuing a Certificate:**

```
Form Input
    ↓
Validate Data
    ↓
Upload Image to Pinata IPFS
    ↓
Upload Metadata to Pinata IPFS
    ↓
Issue NFT on Sepolia Blockchain
    ↓
Store IPFS Hash in Smart Contract
    ↓
Certificate Created!
```

**Verifying a Certificate:**

```
Enter Wallet Address
    ↓
Query Blockchain for Certificates
    ↓
Retrieve IPFS Hashes from Smart Contract
    ↓
Fetch Metadata from Pinata Gateway
    ↓
Display Certificate Details
```

## File Structure

```
VeriDegreeDAppmain/
├── app/
│   ├── api/
│   │   └── pinata/                    ← API routes for uploads
│   │       ├── upload-file/route.ts   ← Uploads images
│   │       └── upload-json/route.ts   ← Uploads metadata
│   ├── page.tsx                       ← Main app page
│   ├── layout.tsx                     ← Root layout
│   └── globals.css                    ← Global styles
│
├── components/
│   ├── issue-certificate-form.tsx     ← Issuer form
│   ├── viewer-dashboard.tsx           ← Viewer dashboard
│   ├── verifier-dashboard.tsx         ← Verifier dashboard
│   ├── wallet-connection.tsx          ← Wallet integration
│   └── ui/                            ← shadcn/ui components
│
├── lib/
│   ├── ipfs-provider.ts               ← Pinata/IPFS functions
│   ├── web3-provider.ts               ← Blockchain functions
│   └── utils.ts                       ← Helper utilities
│
├── .env.local.example                 ← Environment template
├── .env.local                         ← Your credentials (NOT in git)
├── .gitignore                         ← Git ignore rules
├── package.json                       ← Dependencies
├── tsconfig.json                      ← TypeScript config
├── next.config.mjs                    ← Next.js config
│
├── README.md                          ← Project overview
├── QUICK_START.md                     ← 5-minute setup
├── SETUP.md                           ← Detailed setup guide
├── DEPLOYMENT.md                      ← Production guide
└── CONFIG_SUMMARY.md                  ← This file
```

## Configuration Files

### .env.local
Your Pinata credentials and configuration (NOT version controlled)

### next.config.mjs
```javascript
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### tsconfig.json
TypeScript configuration with path aliases (@/*):
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### package.json
Dependencies:
- next 16.0.7
- react 19.2.0
- ethers (latest) - Web3 library
- All shadcn/ui components

## API Endpoints

### Upload Image to Pinata

**Endpoint:** `POST /api/pinata/upload-file`

**Request:**
```javascript
const formData = new FormData()
formData.append("file", imageFile)

fetch("/api/pinata/upload-file", {
  method: "POST",
  body: formData
})
```

**Response:**
```json
{
  "IpfsHash": "QmXxxx...",
  "PinSize": 12345,
  "Timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Gateway URL:**
```
https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxxx...
```

### Upload Metadata to Pinata

**Endpoint:** `POST /api/pinata/upload-json`

**Request:**
```javascript
fetch("/api/pinata/upload-json", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Certificate Name",
    description: "Description",
    image: "ipfs://Qm...",
    attributes: [...]
  })
})
```

**Response:**
```json
{
  "IpfsHash": "QmXxxx...",
  "PinSize": 5678,
  "Timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pinata Dashboard

Access your Pinata account at: https://app.pinata.cloud/

### What to Monitor

1. **Files Uploaded** - See all certificate images and metadata
2. **Bandwidth Usage** - Track gateway access
3. **Gateway Status** - Monitor rose-known-carp-497
4. **API Usage** - Track upload requests

### Quota

Free tier includes:
- 1 GB IPFS storage
- 2 GB bandwidth
- Unlimited API calls

## MetaMask Configuration

### For Users of Your App

1. Install MetaMask: https://metamask.io/
2. Switch Network:
   - Click network selector (top-left)
   - Toggle "Show test networks"
   - Select "Sepolia"
3. Get Testnet ETH: https://www.sepoliafaucet.com/

### Network Details

| Setting | Value |
|---------|-------|
| Network Name | Sepolia |
| RPC URL | https://rpc.sepolia.org |
| Chain ID | 11155111 |
| Currency | ETH |
| Block Explorer | https://sepolia.etherscan.io |

## Ports & URLs

### Development
```
Frontend:    http://localhost:3000
API Routes:  http://localhost:3000/api/*
Dev Server:  Runs on 3000 by default
```

### Production (Vercel)
```
Frontend:    https://your-domain.vercel.app
API Routes:  https://your-domain.vercel.app/api/*
```

## Important Addresses

### Your Pinata Gateway
```
https://rose-known-carp-497.mypinata.cloud
```

### Smart Contract
```
0xf16e31f337a0197C3F65893e4F0C4e483e70b447
```

### Owner Wallet
```
0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD
```

## Quick Reference

### Start Development
```bash
pnpm dev
# Visit http://localhost:3000
```

### Build for Production
```bash
pnpm build
pnpm start
```

### Check Configuration
```bash
# Verify .env.local exists
ls -la .env.local

# Check Pinata connectivity (in browser console)
fetch('/api/pinata/upload-json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
})
```

### View Logs
```bash
# Browser console (F12)
# Shows upload progress and errors

# Terminal
# Shows dev server logs
```

## Troubleshooting Configuration

### "Pinata JWT is not configured"
1. Check `.env.local` exists
2. Verify `PINATA_JWT` value (should be long alphanumeric)
3. Restart dev server

### "Invalid gateway"
1. Check `NEXT_PUBLIC_PINATA_GATEWAY` is exactly:
   `rose-known-carp-497.mypinata.cloud`
2. No https:// prefix needed

### "MetaMask not switching networks"
1. Ensure MetaMask is installed
2. Click "Add Network" manually if needed
3. Use values from table above

## Security Recommendations

✓ Keep `.env.local` secret
✓ Use .gitignore (already configured)
✓ Rotate JWT tokens periodically
✓ Monitor Pinata dashboard for unauthorized access
✓ Use MetaMask for wallet security

## Next Steps

1. **Setup Complete?** Run `pnpm dev`
2. **Ready to Use?** Visit http://localhost:3000
3. **Need Help?** Read QUICK_START.md or SETUP.md

---

**Version:** 1.0.0
**Last Updated:** 2026
**Status:** Ready for Local Development ✓
