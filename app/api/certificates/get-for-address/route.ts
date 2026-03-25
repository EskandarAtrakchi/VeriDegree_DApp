import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

// Smart contract config
const CONTRACT_ADDRESS = "0xf16e31f337a0197C3F65893e4F0C4e483e70b447";

// deployment block number for the contract on Sepolia
const DEPLOYMENT_BLOCK = 10238797;

// Contract ABI
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "certificates",
    outputs: [
      { internalType: "string", name: "institutionName", type: "string" },
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "degreeName", type: "string" },
      { internalType: "string", name: "graduationDate", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint256", name: "issuedAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    console.log("[API] Fetching certificates for address:", address);

    // ✅ Reliable RPC
    const RPC_URL =
      process.env.SEPOLIA_RPC_URL ||
      "https://ethereum-sepolia.publicnode.com";

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Ensure connection
    try {
      await provider.getBlockNumber();
    } catch (err) {
      console.error("[API] RPC connection failed:", err);
      return NextResponse.json(
        { success: false, error: "RPC unavailable" },
        { status: 503 }
      );
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const currentBlock = await provider.getBlockNumber();

    // CHUNK SETTINGS
    const CHUNK_SIZE = 50000;

    const filter = contract.filters.Transfer(
      ethers.ZeroAddress,
      address
    );

    let events: ethers.Log[] = [];

    console.log("[API] Fetching logs from deployment block...");

    for (
      let start = DEPLOYMENT_BLOCK;
      start <= currentBlock;
      start += CHUNK_SIZE
    ) {
      const end = Math.min(start + CHUNK_SIZE - 1, currentBlock);

      console.log(`[API] Fetching from ${start} to ${end}`);

      try {
        const chunk = await contract.queryFilter(filter, start, end);
        events = events.concat(chunk);
      } catch (err) {
        console.error("[API] Chunk error:", err);
      }
    }

    console.log("[API] Total events found:", events.length);

    const certificates = [];

    for (const event of events) {
      try {
        const log = event as ethers.EventLog;
        const tid = Number(log.args[2]);

        const cert = await contract.certificates(tid);

        let currentOwner;
        try {
          currentOwner = await contract.ownerOf(tid);
        } catch {
          continue;
        }

        if (currentOwner.toLowerCase() === address.toLowerCase()) {
          certificates.push({
            tokenId: tid,
            institutionName: cert.institutionName,
            studentName: cert.studentName,
            degreeName: cert.degreeName,
            graduationDate: cert.graduationDate,
            metadataURI: cert.metadataURI,
            issuedAt: Number(cert.issuedAt),
          });
        }
      } catch (err) {
        console.error("[API] Error processing event:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        certificates,
        count: certificates.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API] Error fetching certificates:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch certificates",
      },
      { status: 500 }
    );
  }
}
