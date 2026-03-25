# VeriDegree DApp - Quick Start (5 Minutes)

## Step-by-Step Setup

### Step 1: Download & Extract (1 minute)

1. Download the ZIP file from v0
2. Extract it to your computer
3. Open terminal/command prompt in the extracted folder

```bash
cd VeriDegreeDAppmain
```

### Step 2: Install Dependencies (2 minutes)

```bash
pnpm install
```

If pnpm is not installed:
```bash
npm install -g pnpm
pnpm install
```

Or use npm directly:
```bash
npm install
```

### Step 3: Configure Environment (1 minute)

Create `.env.local` file with your Pinata credentials:

```bash
# Copy the example
cp .env.local.example .env.local

# Edit it with your credentials
```

Your `.env.local` should contain:
```
PINATA_API_KEY=f73dd98a8fea79f31463
PINATA_JWT=A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud
```

### Step 4: Start Development Server (1 minute)

```bash
pnpm dev
```

Output should show:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 5: Open in Browser

Visit: http://localhost:3000

You should see the CertifyChain landing page with a "Connect Wallet" button.

## Wallet Setup (2 minutes)

### 1. Install MetaMask
- Go to https://metamask.io/
- Install extension for your browser
- Create or import wallet

### 2. Switch to Sepolia Testnet
- Click network dropdown in MetaMask (top left)
- Toggle "Show test networks" (in advanced settings)
- Select "Sepolia"

### 3. Get Testnet ETH
- Visit https://www.sepoliafaucet.com/
- Enter your MetaMask address
- Claim free Sepolia ETH (15 minutes wait)

## Using the App

### As an Issuer
1. Connect MetaMask wallet
2. Click "Issuer" role
3. Fill certificate form:
   - Student wallet address (0x...)
   - Institution name
   - Student name
   - Degree name
   - Graduation date
   - Optional: Certificate image
4. Click "Issue Certificate"
5. Approve in MetaMask
6. Wait for blockchain confirmation ✓

**What happens:**
- Image → Uploaded to Pinata IPFS
- Metadata → Uploaded to Pinata IPFS
- NFT → Minted on Ethereum Sepolia
- Student gets certificate in their wallet!

### As a Verifier
1. Connect any wallet (or no wallet)
2. Click "Verifier" role
3. Enter student's wallet address
4. See their certificates ✓
5. View certificate details
6. Access blockchain proof

### As a Viewer
1. Connect your wallet
2. Click "Viewer" role
3. See certificates issued to you
4. View full details

## Troubleshooting

### "Pinata JWT is not configured"
**Solution:** 
- Check `.env.local` file exists
- Verify `PINATA_JWT` value is correct
- Restart dev server (Ctrl+C, then `pnpm dev`)

### "MetaMask not installed"
**Solution:**
- Install MetaMask from https://metamask.io/

### "Switch to Sepolia network"
**Solution:**
- MetaMask → Click network selector
- Enable "Show test networks"
- Select "Sepolia"

### "Insufficient balance"
**Solution:**
- Visit https://www.sepoliafaucet.com/
- Get free Sepolia ETH for testing

### Certificate upload fails
**Solution:**
- Check internet connection
- Verify Pinata credentials
- Check browser console (F12) for detailed errors
- Pinata IPFS may be slow - try again in 30 seconds

### Images not displaying
**Solution:**
- IPFS can take time to propagate
- Refresh page after 1-2 minutes
- Check Pinata dashboard to verify upload

## Key URLs

- **App:** http://localhost:3000
- **Sepolia Faucet:** https://www.sepoliafaucet.com/
- **Pinata Dashboard:** https://app.pinata.cloud/
- **Block Explorer:** https://sepolia.etherscan.io/
- **Smart Contract:** https://sepolia.etherscan.io/address/0xf16e31f337a0197C3F65893e4F0C4e483e70b447

## Important Notes

✓ Use **Sepolia Testnet** - not mainnet!
✓ Get **free testnet ETH** - don't use real money
✓ Each wallet can hold **only 1 certificate**
✓ Images need **1-2 minutes** to appear (IPFS)
✓ Never share your `.env.local` file
✓ Restart dev server after changing `.env.local`

## Commands Reference

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Stop dev server
Ctrl+C
```

## File Locations

- **Environment config:** `.env.local.example`
- **Setup guide:** `SETUP.md`
- **This guide:** `QUICK_START.md`
- **Main app:** `app/page.tsx`
- **Components:** `components/`
- **Smart contracts:** `lib/web3-provider.ts`
- **Storage logic:** `lib/ipfs-provider.ts`

## Next Steps After Setup

1. ✓ Install & run the app
2. ✓ Connect MetaMask to Sepolia
3. ✓ Get testnet ETH
4. ✓ Issue your first certificate!
5. ✓ Verify certificates from other wallets
6. ✓ View issued certificates

## Still Having Issues?

1. **Read SETUP.md** - More detailed troubleshooting
2. **Check browser console** - Press F12, look for errors
3. **Verify `.env.local`** - Check credentials are exact
4. **Restart everything** - Stop server, restart, refresh browser
5. **Check Pinata status** - Ensure API is accessible

---

**Ready to go?** Run `pnpm dev` and visit http://localhost:3000
