import { NextRequest, NextResponse } from "next/server";

// API route to upload JSON metadata to Pinata and return the IPFS hash
export async function POST(req: NextRequest) {
  try {
    // Load Pinata credentials from environment variables
    const PINATA_JWT = process.env.PINATA_JWT;
    const PINATA_API_KEY = process.env.PINATA_API_KEY;

    //
    if (!PINATA_JWT) {
      console.error("[Pinata] Missing PINATA_JWT env var");
      // Return a clear error message to the client if JWT is missing
      return NextResponse.json(
        { error: "Pinata JWT is not configured. Please add PINATA_JWT to .env.local" },
        { status: 500 }
      );
    }

    // Parse the incoming JSON metadata from the request body
    const body = await req.json();

    // Log the incoming request for debugging
    console.log("[Pinata] Uploading JSON metadata to IPFS");

    // Call Pinata API to upload the JSON metadata
    const res = await fetch(
      //  Using pinJSONToIPFS endpoint for JSON metadata upload
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        // Use POST method and include the Pinata JWT in the Authorization header
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    // Handle Pinata API response
    if (!res.ok) {
      const text = await res.text();
      console.error("[Pinata] Upload JSON failed:", res.status, text);
      return NextResponse.json(
        // Return the error details from Pinata to the client for better debugging
        { error: "Pinata upload failed", details: text },
        { status: res.status }
      );
    }

    // Parse and return the successful response from Pinata
    const json = await res.json();
    console.log("[Pinata] JSON metadata uploaded successfully:", json.IpfsHash);
    return NextResponse.json(json, { status: 200 });
    // Note: The response from Pinata typically includes the IPFS hash and other details about the pinned content
  } catch (err) {
    console.error("[Pinata] upload-json route error:", err);
    // Return a generic error response to the client in case of unexpected server errors
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
