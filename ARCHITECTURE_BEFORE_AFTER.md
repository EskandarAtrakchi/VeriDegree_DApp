# Architecture: Before vs After

## BEFORE (Broken ❌)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Viewer/Verifier Dashboard Component                  │  │
│  │                                                      │  │
│  │  getCertificatesForAddress(address) → Direct RPC   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     │ Tries to call RPC directly             │
│                     ↓                                        │
│            ❌ CORS ERROR ❌                                  │
│    "No 'Access-Control-Allow-Origin' header"               │
│                                                              │
│  Browser blocks request - RPC endpoint refuses to respond   │
│  to requests from unauthorized origins                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                        ❌ FLOW BLOCKED HERE ❌
           (Never reaches blockchain, never reaches Pinata)
```

### Why This Failed

- `rpc.sepolia.org` is a public RPC endpoint with CORS restrictions
- It doesn't allow browser applications to call it directly
- This is a security feature to prevent abuse
- The request is blocked by the browser's CORS policy
- Pinata was never even reached because the blockchain query failed first

---

## AFTER (Fixed ✅)

```
┌──────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Viewer/Verifier Dashboard Component                    │ │
│  │                                                        │ │
│  │  fetch("/api/certificates/get-for-address") → Safe   │ │
│  │  (Calls our own server - NO CORS ISSUES)              │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                         │
│                     │ HTTP Request to own domain              │
│                     ↓                                         │
└─────────────────────┼──────────────────────────────────────────┘
                      │
                      │ Safe - same origin, no CORS issues
                      ↓
        ┌──────────────────────────────┐
        │   YOUR SERVER (Next.js)       │
        │                              │
        │ /api/certificates/           │
        │ get-for-address/route.ts      │
        │                              │
        │  getCertificatesForAddress()  │
        │  (server-side - safe!)        │
        └──────────┬───────────────────┘
                   │
                   │ Direct connection (server-to-server)
                   │ No CORS restrictions
                   ↓
        ┌──────────────────────────────┐
        │  Ethereum Sepolia RPC         │
        │  rpc.sepolia.org              │
        │                              │
        │  ✅ Query successful          │
        │  ✅ Returns certificate data   │
        └──────────┬───────────────────┘
                   │
                   │ Certificate metadata URIs
                   ↓
        ┌──────────────────────────────┐
        │   Pinata IPFS Gateway         │
        │   rose-known-carp-497.       │
        │   mypinata.cloud              │
        │                              │
        │  ✅ Fetches metadata           │
        │  ✅ Fetches certificate image  │
        └──────────┬───────────────────┘
                   │
                   │ Returns JSON metadata & image
                   ↓
        ┌──────────────────────────────┐
        │   YOUR SERVER (Next.js)       │
        │  Returns to client            │
        └──────────┬───────────────────┘
                   │
                   │ Returns full certificate data
                   ↓
┌──────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Viewer/Verifier Dashboard                             │ │
│  │                                                        │ │
│  │  ✅ Displays Certificate Details                      │ │
│  │  ✅ Shows Certificate Image                            │ │
│  │  ✅ Verification Complete                              │ │
│  │                                                        │ │
│  │  No CORS errors - Everything works!                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Why This Works

- Browser communicates with **its own server** (localhost:3000)
- No CORS issues - same origin policy allows it
- Server communicates with RPC endpoint (server-to-server)
- Server-to-server communication doesn't have CORS restrictions
- Server retrieves data from Pinata and returns it to browser
- Everything works seamlessly

---

## Key Difference

| Aspect | Before | After |
|--------|--------|-------|
| **Who queries RPC** | Browser (❌ CORS blocked) | Server (✅ No CORS) |
| **Request path** | Browser → RPC | Browser → Server → RPC |
| **CORS issue** | ❌ Blocks everything | ✅ Eliminated |
| **Security** | Exposed RPC to browser | Protected server route |
| **Status** | Broken | Working |

---

## The New API Route

```typescript
// app/api/certificates/get-for-address/route.ts

export async function POST(req: NextRequest) {
  // 1. Receive address from browser (client-safe)
  const { address } = await req.json()
  
  // 2. Query blockchain server-side (no CORS issues)
  const certificates = await getCertificatesForAddress(address)
  
  // 3. Return data to browser (client receives JSON)
  return NextResponse.json({ certificates })
}
```

This simple route:
- Acts as a gateway between browser and blockchain
- Eliminates all CORS issues
- Keeps the architecture clean
- Maintains security
- Allows Pinata integration to work properly

---

## Why Pinata Keys Weren't the Solution

```
Flow would have been:

Browser → ❌ CORS blocks at RPC ❌
  |
  └─→ Never reaches Pinata
      (Can't get metadata URIs because blockchain query failed)
```

Creating new Pinata keys would have:
- ❌ NOT fixed the RPC CORS issue
- ❌ NOT allowed the app to query the blockchain
- ❌ NOT solved the problem

The actual solution was to:
- ✅ Move blockchain queries to the server
- ✅ Let Pinata gateway work as-is
- ✅ Create proper separation of concerns

---

## Result

- ✅ Issuer issues NFTs (blockchain + Pinata)
- ✅ Viewer views certificates (blockchain + Pinata)
- ✅ Verifier verifies certificates (blockchain + Pinata)
- ✅ Everything works perfectly with original Pinata credentials
