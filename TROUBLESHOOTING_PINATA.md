# Pinata Certificate Retrieval Troubleshooting Guide

## Overview

This guide helps you diagnose and fix issues with retrieving certificates from Pinata IPFS gateway when verifying or viewing certificates.

## Common Issues & Solutions

### Issue 1: "Failed to fetch" Error When Retrieving Certificates

**Symptoms:**
- Certificate was issued successfully
- Error appears when trying to verify or view certificate
- Console shows "TypeError: Failed to fetch"

**Causes:**
1. Pinata gateway is not accessible
2. Incorrect gateway configuration
3. CORS issues
4. Gateway token not properly configured

**Solutions:**

#### Solution A: Verify Pinata Gateway Configuration

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Check logs for messages like `[IPFS] Attempting to fetch from: https://rose-known-carp-497.mypinata.cloud/ipfs/...`

**Action:**
- Ensure your `.env.local` has:
```env
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud
```

- If you have a gateway token, add:
```env
NEXT_PUBLIC_PINATA_GATEWAY_TOKEN=your_gateway_token_here
```

#### Solution B: Check Gateway Access Directly

1. From the Certificate Details, find the metadata IPFS hash
2. Try accessing it directly in your browser:
```
https://rose-known-carp-497.mypinata.cloud/ipfs/[CID]
```

3. If you get a 401/403 error:
   - Your gateway may require an access token
   - Contact Pinata support or regenerate gateway

4. If you get a timeout or connection error:
   - Your gateway may be experiencing issues
   - Use Pinata's default gateway as fallback (automatic)

#### Solution C: Enable Fallback Gateways

The app automatically tries multiple gateways:
1. Your dedicated Pinata gateway (fastest)
2. Pinata public gateway
3. IPFS.io gateway
4. Cloudflare IPFS gateway

If primary gateway fails, it automatically tries others. Check console logs to see which gateway succeeded.

### Issue 2: Metadata Shows But Image Doesn't Load

**Symptoms:**
- Certificate details appear (student name, degree, etc.)
- Certificate image doesn't load
- Or image loads very slowly

**Causes:**
1. Image stored on IPFS separately from metadata
2. Image gateway different from metadata gateway
3. Image IPFS hash is different from metadata hash

**Solutions:**

1. Check the actual image IPFS hash in metadata:
   - In browser console, look for logs like `[IPFS] Successfully retrieved metadata from: ...`
   - The metadata contains an `image` field with its own IPFS hash

2. Ensure images use same gateway:
   - Images uploaded during certificate issuance go to same Pinata gateway
   - Should be automatic, but verify in console logs

3. Manual image retrieval:
   - Get the image IPFS hash from certificate details
   - Try in browser: `https://rose-known-carp-497.mypinata.cloud/ipfs/[IMAGE_CID]`

### Issue 3: Certificate Found But All Metadata Fails to Load

**Symptoms:**
- Certificate details partially show (from blockchain)
- Metadata retrieval fails for all gateways
- No image displays

**Causes:**
1. Metadata was never uploaded to IPFS
2. Incorrect metadata URI stored on blockchain
3. All IPFS gateways are down (unlikely but possible)

**Solutions:**

#### Check if metadata was uploaded:

1. During issuance in console, look for:
   - `[IPFS] Uploading metadata to Pinata IPFS (via API route)` - upload started
   - `[IPFS] Metadata uploaded to IPFS: [HASH]` - upload successful
   - `Calling smart contract to issue certificate` - blockchain write

2. If metadata upload failed:
   - Check `.env.local` has correct `PINATA_JWT`
   - Verify JWT token is not expired
   - Try issuing certificate again

#### Verify metadata URI on blockchain:

1. Go to Etherscan: https://sepolia.etherscan.io/address/0xf16e31f337a0197C3F65893e4F0C4e483e70b447
2. Find your token (token #)
3. Call `certificates(tokenId)` in Read Contract
4. Check the `metadataURI` field - should be `ipfs://QmXxx...`

### Issue 4: Gateway Token Errors (401/403)

**Symptoms:**
- Error with code 401 or 403 when accessing gateway
- "Access denied" errors

**Causes:**
1. Gateway token is invalid or expired
2. Gateway token not provided but required
3. Wrong token format

**Solutions:**

1. **Regenerate Access Token:**
   - Go to Pinata dashboard: https://app.pinata.cloud
   - Click "Gateways" on the left
   - Find `rose-known-carp-497`
   - Click "View Token" or create new token
   - Copy the new token

2. **Update .env.local:**
```env
NEXT_PUBLIC_PINATA_GATEWAY_TOKEN=your_new_token_here
```

3. **Restart dev server:**
   - Stop: Ctrl+C
   - Start: `pnpm dev`
   - Clear browser cache (Cmd+Shift+Delete)

### Issue 5: Timeout When Retrieving Large Certificates

**Symptoms:**
- Request hangs for 15+ seconds
- Then fails with timeout error

**Causes:**
1. Large image or metadata file
2. Gateway is slow
3. Network connection issues

**Solutions:**

1. Use faster gateway:
   - Try Cloudflare IPFS: `https://cloudflare-ipfs.com/ipfs/[CID]`
   - Try Pinata gateway.pinata.cloud: `https://gateway.pinata.cloud/ipfs/[CID]`

2. Optimize image during issuance:
   - Compress certificate image before uploading
   - Recommended: < 2MB per image
   - Tools: TinyPNG, ImageOptim

3. Check network:
   - Verify your internet connection is stable
   - Try from different network if possible

## Debugging Steps

### Step 1: Enable Console Logging

All operations log with `[IPFS]`, `[Web3]`, `[Viewer]`, or `[Verifier]` prefixes.

**Check console for:**
1. Upload logs when issuing:
   ```
   [IPFS] Uploading metadata to Pinata IPFS (via API route)
   [IPFS] Metadata uploaded to IPFS: QmXxx...
   ```

2. Retrieval logs when verifying:
   ```
   [IPFS] Retrieving from IPFS URI: ipfs://QmXxx...
   [IPFS] Attempting to fetch from: https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxx...
   [IPFS] Successfully retrieved metadata from: https://...
   ```

### Step 2: Test Gateway Directly

```bash
# Replace CID with actual hash
curl -v https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxx...

# With gateway token
curl -v "https://rose-known-carp-497.mypinata.cloud/ipfs/QmXxx...?pinataGatewayToken=YOUR_TOKEN"
```

### Step 3: Verify Blockchain Data

Check Etherscan for stored certificate data:
1. Network: Sepolia
2. Contract: 0xf16e31f337a0197C3F65893e4F0C4e483e70b447
3. Method: Read as Proxy
4. Function: certificates
5. Enter tokenId

### Step 4: Check Pinata Dashboard

1. Go to: https://app.pinata.cloud
2. Click "Files" to see uploaded files
3. Search for certificate metadata
4. Verify file exists and is pinned

## Environment Variables Checklist

For certificate retrieval to work, ensure:

```env
# Required for issuing (backend)
PINATA_JWT=A5zHFxm4fJbBBreUq3bcK2fnCuWh0m8JMKXVyN40TdU3QV8Cb4dxH7LbMbPVP2eC
PINATA_API_KEY=f73dd98a8fea79f31463

# Required for retrieving (frontend)
NEXT_PUBLIC_PINATA_GATEWAY=rose-known-carp-497.mypinata.cloud

# Optional but recommended
NEXT_PUBLIC_PINATA_GATEWAY_TOKEN=your_gateway_token_if_required
```

## Advanced: Manual Testing

### Test 1: Issue Certificate Manually

```javascript
// In browser console
const metadata = {
  name: "Test Certificate",
  description: "Test",
  image: "ipfs://QmXxx...",
  attributes: []
};

// Upload metadata
fetch('/api/pinata/upload-json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(metadata)
})
.then(r => r.json())
.then(d => console.log('Hash:', d.IpfsHash));
```

### Test 2: Retrieve Certificate Manually

```javascript
// Get the IPFS hash and test retrieval
const hash = "QmXxx..."; // from blockchain
const gateway = "https://rose-known-carp-497.mypinata.cloud";
const url = `${gateway}/ipfs/${hash}`;

fetch(url)
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Failed:', e));
```

## Getting Help

If issues persist:

1. **Check Browser Console (F12):**
   - All errors logged with [IPFS], [Web3], etc. prefixes
   - Copy full error message

2. **Pinata Support:**
   - Visit: https://www.pinata.cloud/
   - Check gateway status
   - Contact support with gateway name

3. **Project Logs:**
   - Check `.next/server/logs` if available
   - Look for API route errors

4. **Test Network:**
   - Ensure Sepolia testnet is selected in MetaMask
   - Check RPC provider status

## Summary

The certificate retrieval system:
- ✅ Issues certificates to blockchain
- ✅ Stores metadata on Pinata IPFS
- ✅ Retrieves from dedicated gateway first
- ✅ Falls back to public gateways
- ✅ Logs all operations for debugging
- ✅ Handles timeouts gracefully
- ✅ Continues if image fails (metadata still shows)

Most "Failed to fetch" errors are resolved by:
1. Verifying `.env.local` gateway configuration
2. Testing gateway access in browser directly
3. Checking Pinata dashboard for file existence
4. Regenerating gateway token if needed
5. Clearing browser cache and restarting dev server
