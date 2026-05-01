import { NextRequest, NextResponse } from "next/server";

// API route to upload a file to Pinata and return the IPFS hash
export async function POST(req: NextRequest) {
  try {
    const PINATA_JWT = process.env.PINATA_JWT;
    // Validate Pinata JWT
    if (!PINATA_JWT) {
      console.error("[Pinata] Missing PINATA_JWT env var");
      return NextResponse.json(
        { error: "Pinata JWT is not configured. Please add PINATA_JWT to .env.local" },
        { status: 500 }
      );
    }
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Validate file input
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    // Log file details for debugging
    console.log("[Pinata] Uploading file to IPFS:", file.name, file.size, "bytes");

    // Create a new FormData instance for Pinata API
    const pinataForm = new FormData();
    pinataForm.append("file", file);

    // Call Pinata API to upload the file
    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: pinataForm,
      }
    );

    // Handle Pinata API response
    if (!res.ok) {
      const text = await res.text();
      console.error("[Pinata] Upload file failed:", res.status, text);
      return NextResponse.json(
        { error: "Pinata upload failed", details: text },
        { status: res.status }
      );
    }

    // Parse and return the successful response from Pinata
    const json = await res.json();
    console.log("[Pinata] File uploaded successfully:", json.IpfsHash);
    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error("[Pinata] upload-file route error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
