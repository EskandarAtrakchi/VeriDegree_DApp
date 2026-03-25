# Server/Client Error - FIXED

## The Problem
The API route was trying to call `getCertificatesForAddress()` which is a client-side function (marked with `'use client'`). Server-side code cannot call client-side functions.

Error:
```
Attempted to call getCertificatesForAddress() from the server but getCertificatesForAddress is on the client.
```

## The Solution
Rewrote the API route (`app/api/certificates/get-for-address/route.ts`) to be completely server-side independent by:

1. **Creating server-side provider**: Uses ethers.js to connect directly to Sepolia RPC
   ```typescript
   const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org")
   ```

2. **Server-side contract instance**: Creates contract with minimal ABI needed for querying
   ```typescript
   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
   ```

3. **Direct blockchain queries**: Queries Transfer events and certificate data directly
   ```typescript
   const events = await contract.queryFilter(filter, fromBlock, currentBlock)
   const cert = await contract.certificates(tid)
   ```

4. **No client dependencies**: Zero imports from client-side code

## What Changed

### File: `app/api/certificates/get-for-address/route.ts`

Before:
```typescript
import { getCertificatesForAddress } from "@/lib/web3-provider"
// ... tried to call client-side function
```

After:
```typescript
import { ethers } from "ethers"
// ... creates own provider and contract
// ... completely server-side implementation
```

## Testing the Fix

### Step 1: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
pnpm dev
```

### Step 2: Test Viewer Dashboard
1. Open http://localhost:3000
2. Switch to "Viewer" tab
3. You should automatically see your certificates (if you have any)
4. Check console - should show `[Viewer] Fetching certificates for address`

### Step 3: Test Verifier Dashboard
1. Open http://localhost:3000
2. Switch to "Verifier" tab
3. Enter your wallet address (0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD)
4. Click "Verify Certificate"
5. Should show your certificates
6. Check console - should show `[Verifier] Verifying certificate for address`

### Step 4: Check Console Logs
You should see progression without errors:
```
[API] Fetching certificates for address: 0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD
[API] Getting current block number...
[API] Current block: 7261838 Searching from block: 6261838
[API] Querying Transfer events...
[API] Found 1 transfer event(s)
[API] Processing token ID: 0
[API] Retrieved certificate data for token 0
[API] Added certificate for token 0
[API] Returning 1 certificate(s)
```

## Expected Behavior

### Success Scenario
```
POST /api/certificates/get-for-address 200
[API] Returning 1 certificate(s)
[Viewer/Verifier] Certificates fetched
```

### If No Certificates Found
```
POST /api/certificates/get-for-address 200
[API] Returning 0 certificate(s)
[Viewer] No certificate found for this wallet
```

### Error Handling
If there's an RPC issue:
```
POST /api/certificates/get-for-address 500
[API] Error fetching certificates: [error message]
```

## Technical Details

### API Route Responsibilities
- ✅ Connect to Sepolia RPC (server-side)
- ✅ Query smart contract for Transfer events
- ✅ Verify current certificate ownership
- ✅ Return certificate metadata

### Client Responsibilities (Dashboard)
- ✅ Call API route with wallet address
- ✅ Fetch IPFS metadata from gateway
- ✅ Display certificates to user

## Common Issues & Solutions

### Issue: Still getting "Failed to fetch"
**Solution**: Check browser console for the actual error. It might be:
1. Wallet address not found on blockchain
2. IPFS metadata not available
3. Network error

### Issue: API returns 500 error
**Solution**: Check server logs for RPC connection issues. Try:
1. Restart the dev server
2. Check internet connection
3. Verify smart contract address is correct

### Issue: Certificates not showing
**Solution**: Make sure you:
1. Issued at least one certificate (as issuer)
2. Verified the transaction went through
3. Checking the correct wallet address in verifier

## Summary
The API route is now fully server-side and independent. It no longer depends on client-side functions, which eliminates the server/client error you were experiencing. Test it with the steps above!
