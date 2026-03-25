import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const PINATA_JWT = process.env.PINATA_JWT;
    const PINATA_API_KEY = process.env.PINATA_API_KEY;

    if (!PINATA_JWT) {
      console.error("[Pinata] Missing PINATA_JWT env var");
      return NextResponse.json(
        { error: "Pinata JWT is not configured. Please add PINATA_JWT to .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();

    console.log("[Pinata] Uploading JSON metadata to IPFS");

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[Pinata] Upload JSON failed:", res.status, text);
      return NextResponse.json(
        { error: "Pinata upload failed", details: text },
        { status: res.status }
      );
    }

    const json = await res.json();
    console.log("[Pinata] JSON metadata uploaded successfully:", json.IpfsHash);
    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error("[Pinata] upload-json route error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
