# Testing Viewer & Verifier (CORS Fix)

## Quick Test Guide

After the CORS fix, here's how to test that everything works:

### Prerequisites

```bash
# Make sure you have the latest code
pnpm install
pnpm dev

# Visit http://localhost:3000
```

### Test 1: Issue a Certificate (Issuer Role)

1. Click "Issuer" tab
2. Fill in the form:
   - Institution Name: Test University
   - Student Name: John Doe
   - Degree Name: Bachelor of Science
   - Graduation Date: 2024-05-15
   - Image: Upload an image (or leave empty)
3. Click "Issue Certificate"

**Watch the console** for:
```
[IPFS] Uploading metadata to Pinata IPFS
[IPFS] Metadata uploaded to IPFS: QmXxx...
```

**Success signs:**
- ✅ Certificate issued notification appears
- ✅ Transaction confirmed on blockchain
- ✅ No red errors in console

**Get your student address from the transaction receipt or use any address you control**

---

### Test 2: Viewer Role

1. Copy the student address (the one who received the certificate)
2. Click "Viewer" tab
3. You should automatically see your certificates (the app detects your address if you're the wallet owner)

**Watch the console** for:
```
[Viewer] Calling API to fetch certificates
[API] Fetching certificates for address: 0x...
[API] Found certificates: 1
[IPFS] Retrieving from IPFS URI: ipfs://QmXxx...
[IPFS] Successfully retrieved metadata from: https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxx...
```

**Success signs:**
- ✅ Certificate card appears with details
- ✅ Certificate image displays (if one was uploaded)
- ✅ No "Failed to fetch" errors
- ✅ All certificate data is visible

---

### Test 3: Verifier Role

1. Click "Verifier" tab
2. Enter a wallet address (the one that received the certificate)
3. Click "Verify Certificate"

**Watch the console** for:
```
[Verifier] Calling API to verify certificates
[API] Fetching certificates for address: 0x...
[API] Found certificates: 1
[Verifier] Fetching IPFS metadata for 1 certificate(s)
[IPFS] Retrieving from IPFS URI: ipfs://QmXxx...
```

**Success signs:**
- ✅ Certificate details appear below
- ✅ "Found certificate from [Institution]" message displays
- ✅ Verification badge shows
- ✅ No CORS errors

---

## Debugging: If Something Still Fails

### Open Developer Console
- Press `F12` or right-click → "Inspect"
- Click "Console" tab
- Look for `[Viewer]`, `[Verifier]`, `[API]`, or `[IPFS]` prefixed logs

### Common Issues & Solutions

#### Issue: "Failed to fetch certificate" in Viewer/Verifier

**Check these in order:**

1. **Is the API route running?**
   ```
   Look in console for: [API] Fetching certificates for address
   ```
   If not, the route might not have loaded. Restart dev server: `pnpm dev`

2. **Is the wallet address correct?**
   ```
   Make sure it's a valid 0x address with 40 hex characters after 0x
   ```

3. **Did you issue a certificate?**
   ```
   Only addresses that have received certificates will show results
   ```

#### Issue: CORS Error (If It Still Appears)

```
Access to fetch at 'https://rpc.sepolia.org/'
```

**This should NOT appear anymore.** If it does:

1. Restart dev server: `pnpm dev`
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check `app/api/certificates/get-for-address/route.ts` exists

#### Issue: IPFS Metadata Not Loading

```
[IPFS] Successfully retrieved metadata from: https://rose-known-carp-497.mypinata.cloud/...
```

If you see the above log, metadata is loading from your Pinata gateway. If not:

1. Check your PINATA_JWT in `.env.local`
2. Verify it matches: `A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC`
3. Check gateway in `.env.local`: `NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud`

---

## Expected Console Output (Full Success)

### When Verifying a Certificate:

```
[Viewer] Fetching certificates for address: 0x1234...
[Viewer] Calling API to fetch certificates
[API] Fetching certificates for address: 0x1234...
[Web3] Getting current block number...
[Web3] Current block: 7234567
[Web3] Querying Transfer events...
[Web3] Found 1 transfer event(s)
[Web3] Processing token ID: 1
[Web3] Retrieved certificate data for token 1
[Web3] Added certificate for token 1
[Web3] Returning 1 certificate(s)
[API] Found certificates: 1
[API] Returning success
[Viewer] API returned certificates: 1
[Viewer] Fetching IPFS metadata for 1 certificate(s)
[Viewer] Fetching metadata for token 1 URI: ipfs://QmAbcd...
[IPFS] Retrieving from IPFS URI: ipfs://QmAbcd...
[IPFS] Extracted CID: QmAbcd...
[IPFS] URLs to try: [
  'https://rose-known-carp-497.mypinata.cloud/ipfs/QmAbcd...',
  'https://gateway.pinata.cloud/ipfs/QmAbcd...',
  'https://ipfs.io/ipfs/QmAbcd...',
  'https://cloudflare-ipfs.com/ipfs/QmAbcd...'
]
[IPFS] Attempting to fetch from: https://rose-known-carp-497.mypinata.cloud/ipfs/QmAbcd...
[IPFS] Successfully retrieved metadata from: https://rose-known-carp-497.mypinata.cloud/ipfs/QmAbcd...
[Viewer] Successfully fetched metadata for token 1
```

**No errors above = Everything works perfectly!**

---

## Next Steps

If all tests pass:

1. ✅ Your app is fully functional
2. ✅ Issuer can issue certificates
3. ✅ Viewer can view their own certificates
4. ✅ Verifier can verify any certificate
5. ✅ All stored on blockchain & IPFS/Pinata

You're ready to deploy or share!
