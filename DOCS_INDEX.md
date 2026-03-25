# VeriDegree DApp - Documentation Index

Welcome! Here's a guide to all documentation in this project.

## 📋 Start Here

### New to This Project?
👉 **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- Installation steps
- Wallet configuration
- First certificate issuance
- Troubleshooting

### Complete Setup Instructions
👉 **[SETUP.md](SETUP.md)** - Detailed setup guide
- Prerequisites
- Step-by-step installation
- How to use each role
- Technical architecture overview

## 📚 Documentation by Topic

### Configuration
- **[CONFIG_SUMMARY.md](CONFIG_SUMMARY.md)** - Your configuration details
  - Pinata credentials
  - Smart contract addresses
  - Environment variables
  - File structure

- **[.env.local.example](.env.local.example)** - Environment template
  - Copy to `.env.local`
  - Add your Pinata credentials

### Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
  - Building for production
  - Deployment to Vercel
  - Docker setup
  - Monitoring and scaling

### Project Overview
- **[README.md](README.md)** - Project overview
  - Features overview
  - Tech stack
  - System architecture
  - Next steps

## 🎯 Quick Navigation by Use Case

### I want to...

#### ...Run the app locally
1. Read: [QUICK_START.md](QUICK_START.md)
2. Execute: `cp .env.local.example .env.local`
3. Add credentials to `.env.local`
4. Run: `pnpm dev`

#### ...Understand the configuration
1. Read: [CONFIG_SUMMARY.md](CONFIG_SUMMARY.md)
2. Check: Your Pinata credentials section
3. Verify: `.env.local` file exists

#### ...Deploy to production
1. Read: [DEPLOYMENT.md](DEPLOYMENT.md)
2. Choose: Vercel, Docker, or Node.js
3. Follow: Step-by-step instructions

#### ...Troubleshoot issues
1. Check: [QUICK_START.md](QUICK_START.md#troubleshooting)
2. Read: [SETUP.md](SETUP.md#troubleshooting)
3. Verify: [CONFIG_SUMMARY.md](CONFIG_SUMMARY.md#troubleshooting-configuration)

#### ...Understand the architecture
1. Read: [README.md](README.md#tech-stack)
2. Read: [CONFIG_SUMMARY.md](CONFIG_SUMMARY.md#application-architecture)
3. Explore: Source code in `app/` and `components/`

## 📁 File Organization

```
Documentation/
├── README.md              ← Project overview
├── QUICK_START.md         ← 5-minute setup (START HERE!)
├── SETUP.md               ← Detailed setup guide
├── DEPLOYMENT.md          ← Production guide
├── CONFIG_SUMMARY.md      ← Configuration details
├── DOCS_INDEX.md          ← This file
└── .env.local.example     ← Environment template

Source Code/
├── app/                   ← Next.js application
├── components/            ← React components
├── lib/                   ← Utility functions
├── public/                ← Static assets
└── types/                 ← TypeScript types
```

## 🚀 Setup Checklist

- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Extract project from ZIP
- [ ] Install dependencies: `pnpm install`
- [ ] Copy environment file: `cp .env.local.example .env.local`
- [ ] Add Pinata credentials to `.env.local`
- [ ] Install MetaMask extension
- [ ] Switch MetaMask to Sepolia testnet
- [ ] Get testnet ETH from faucet
- [ ] Run dev server: `pnpm dev`
- [ ] Visit http://localhost:3000
- [ ] Test certificate issuance

## 📖 Reading Order

### First Time Setup
1. This file (you're reading it!)
2. [QUICK_START.md](QUICK_START.md) - 5-minute guide
3. [CONFIG_SUMMARY.md](CONFIG_SUMMARY.md) - Understand configuration
4. Run the app and test

### Deep Dive
1. [README.md](README.md) - Project overview
2. [SETUP.md](SETUP.md) - Detailed setup
3. Explore source code: `app/` and `components/`
4. [DEPLOYMENT.md](DEPLOYMENT.md) - For production

## 🔧 Configuration Files

### Essential
- **`.env.local`** - Your credentials (create from example)
- **`package.json`** - Dependencies and scripts
- **`next.config.mjs`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration

### Templates/Examples
- **`.env.local.example`** - Copy to create `.env.local`
- **`.gitignore`** - Git ignore rules

## 🌐 External Resources

### Official Docs
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Next.js Documentation](https://nextjs.org/docs/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)

### Tools & Services
- [MetaMask](https://metamask.io/)
- [Sepolia Faucet](https://www.sepoliafaucet.com/)
- [Sepolia Explorer](https://sepolia.etherscan.io/)
- [Pinata Dashboard](https://app.pinata.cloud/)

## 💡 Key Concepts

### Pinata
- IPFS gateway service
- Stores certificate images and metadata
- Provides gateway for retrieval
- Your gateway: `rose-known-carp-497.mypinata.cloud`

### Smart Contract
- Runs on Ethereum Sepolia
- Issues certificates as NFTs
- Stores metadata references
- Address: `0xf16e31f337a0197C3F65893e4F0C4e483e70b447`

### MetaMask
- Browser wallet extension
- Signs transactions
- Connects to blockchain
- Manages user accounts

### IPFS
- Distributed file system
- Stores certificate data
- Content-addressed storage
- Accessed via Pinata gateway

## ⚡ Common Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Run production build

# Setup
pnpm install      # Install dependencies
cp .env.local.example .env.local  # Create env file

# Check
npx tsc --noEmit  # Check TypeScript
pnpm lint         # Run linter
```

## 🆘 Getting Help

### Before Asking
1. Check relevant documentation above
2. Search [QUICK_START.md](QUICK_START.md#troubleshooting)
3. Check browser console (F12)
4. Verify `.env.local` configuration

### Common Issues

**"Pinata JWT is not configured"**
→ See [CONFIG_SUMMARY.md#troubleshooting-configuration](CONFIG_SUMMARY.md#troubleshooting-configuration)

**"MetaMask not installed"**
→ See [QUICK_START.md#wallet-setup](QUICK_START.md#wallet-setup)

**"Certificate upload fails"**
→ See [SETUP.md#troubleshooting](SETUP.md#troubleshooting)

## 📊 Documentation Statistics

| Document | Purpose | Read Time |
|----------|---------|-----------|
| QUICK_START.md | 5-minute setup | 5 mins |
| SETUP.md | Detailed guide | 15 mins |
| README.md | Overview | 10 mins |
| CONFIG_SUMMARY.md | Configuration | 10 mins |
| DEPLOYMENT.md | Production | 20 mins |

**Total: ~60 minutes for full understanding**

## ✅ Verification

After setup, verify everything works:

1. ✓ Development server runs: `pnpm dev`
2. ✓ App loads: http://localhost:3000
3. ✓ MetaMask connects
4. ✓ Wallet shows Sepolia network
5. ✓ Can issue test certificate
6. ✓ Certificate appears on blockchain

## 🎓 Next Steps

1. **Now:** Run the app
   ```bash
   pnpm dev
   visit http://localhost:3000
   ```

2. **Next:** Test certificate issuance
   - Connect wallet
   - Select Issuer role
   - Issue test certificate

3. **Then:** Verify certificates
   - Select Verifier role
   - Enter student wallet
   - See certificate details

4. **Finally:** Deploy to production
   - Read [DEPLOYMENT.md](DEPLOYMENT.md)
   - Choose platform (Vercel recommended)
   - Follow deployment steps

## 📝 Document Version

- **Version:** 1.0.0
- **Last Updated:** 2026
- **Status:** Current

## 🔄 Keeping Docs Updated

Documentation is kept in these files:
- `.md` files in project root
- Examples in `.env.local.example`
- This index keeps everything organized

When docs are updated, check the date above.

---

**Ready to start?** → Go to [QUICK_START.md](QUICK_START.md) now!

**Questions?** → Check [SETUP.md](SETUP.md#troubleshooting) troubleshooting section.

**Need details?** → Read [CONFIG_SUMMARY.md](CONFIG_SUMMARY.md) for comprehensive information.
