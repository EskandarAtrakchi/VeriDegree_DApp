import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const PINATA_JWT = process.env.PINATA_JWT;

    if (!PINATA_JWT) {
      console.error("[Pinata] Missing PINATA_JWT env var");
      return NextResponse.json(
        { error: "Pinata JWT is not configured. Please add PINATA_JWT to .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("[Pinata] Uploading file to IPFS:", file.name, file.size, "bytes");

    const pinataForm = new FormData();
    pinataForm.append("file", file);

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

    if (!res.ok) {
      const text = await res.text();
      console.error("[Pinata] Upload file failed:", res.status, text);
      return NextResponse.json(
        { error: "Pinata upload failed", details: text },
        { status: res.status }
      );
    }

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
