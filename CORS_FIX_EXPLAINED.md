# CORS Issue Fix - Complete Explanation

## The Real Problem (Not Pinata!)

Your viewer and verifier dashboards were failing with this error:

```
Access to fetch at 'https://rpc.sepolia.org/' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check
```

This is **NOT a Pinata problem** - it's a **blockchain RPC (Remote Procedure Call) CORS issue**.

## Why This Happened

The original code had this architecture:

```
Browser Client
    ↓
Direct RPC Call to rpc.sepolia.org (BLOCKED BY CORS)
    ↗️ NO CORS HEADERS RETURNED
Server blocks the request
```

The viewer and verifier dashboards were trying to query the Ethereum Sepolia blockchain directly from the browser using `rpc.sepolia.org`. This public RPC endpoint doesn't allow cross-origin requests from browsers for security reasons.

## The Solution

We've implemented a proper architecture:

```
Browser Client
    ↓
Calls /api/certificates/get-for-address (Server-side route)
    ↓
Server queries Ethereum RPC (NO CORS - server-to-server communication)
    ↓
Server returns certificates to browser
    ↓
Browser displays certificates
```

## What Changed

### New Backend API Route
**File:** `app/api/certificates/get-for-address/route.ts`

This new API route:
- Accepts wallet address from the browser
- Queries the blockchain server-side (no CORS issues)
- Returns certificate data as JSON
- Handles errors gracefully

### Updated Components

#### Viewer Dashboard (`components/viewer-dashboard.tsx`)
```javascript
// OLD (BROKEN):
const results = await getCertificatesForAddress(address)  // Direct call, browser tries to access RPC

// NEW (FIXED):
const apiResponse = await fetch("/api/certificates/get-for-address", {
  method: "POST",
  body: JSON.stringify({ address }),
})
const apiData = await apiResponse.json()
const results = apiData.certificates
```

#### Verifier Dashboard (`components/verifier-dashboard.tsx`)
Same pattern as viewer dashboard - now calls the API route instead of directly querying the blockchain.

## Why This Works

1. **Server-to-Server Communication** - The API route on your server calls the RPC endpoint. There are no CORS restrictions between servers.

2. **Browser Safety** - The browser only communicates with your own server (`localhost:3000`), not with external RPC providers.

3. **No New Dependencies** - Uses standard Next.js API routes, no additional packages needed.

4. **Same Pinata Integration** - The Pinata retrieval still works the same way; we just fixed the blockchain query.

## Testing the Fix

```bash
# 1. Make sure you're running the dev server
pnpm dev

# 2. Check the browser console for logs like:
[Viewer] Calling API to fetch certificates
[API] Fetching certificates for address: 0x...
[API] Found certificates: 1
[IPFS] Retrieving from IPFS URI: ipfs://QmXxx...

# 3. No more CORS errors!
```

## Why Your New Pinata Key Wasn't the Solution

Creating a new Pinata API key would not have fixed this issue because:

1. **The error was RPC, not Pinata** - The error clearly showed `rpc.sepolia.org` was blocked
2. **Pinata reads were working** - The fallback gateways (including the public one) would have worked eventually
3. **The real bottleneck** - Your app couldn't even get to the point of reading from Pinata because it couldn't query the blockchain first

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Issue** | CORS error on RPC calls from browser | ✅ Fixed - RPC called from server |
| **Architecture** | Browser → RPC (blocked) | ✅ Browser → API → RPC |
| **Pinata Keys** | Not the problem | Still not the problem |
| **Status** | Viewer/Verifier broken | ✅ Fully functional |

Your original Pinata credentials are perfectly fine and not used in the error. The fix separates concerns properly: blockchain queries happen server-side, IPFS retrieval still happens client-side with Pinata gateways.
