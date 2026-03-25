"use client"

import { ethers } from "ethers"

// -----------------------------
// Smart contract config - Sepolia ETH Testnet
// -----------------------------

export const CONTRACT_ADDRESS = "0xf16e31f337a0197C3F65893e4F0C4e483e70b447"
export const OWNER_ADDRESS = "0xcF023Bc92DD211cB173a2b2DFdd81ad0EE6e28DD"

// Sepolia chain info
export const SEPOLIA_CHAIN_ID = "0xaa36a7" // 11155111 in hex
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111

// Full ABI for the deployed SimpleEduCertificate contract
const CONTRACT_ABI = [
  // issueCertificate
  {
    inputs: [
      { internalType: "address", name: "student", type: "address" },
      { internalType: "string", name: "tokenURI_", type: "string" },
      { internalType: "string", name: "institutionName", type: "string" },
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "degreeName", type: "string" },
      { internalType: "string", name: "graduationDate", type: "string" },
    ],
    name: "issueCertificate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // certificates(uint256) - public mapping getter
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
  // owner()
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // ownerOf(uint256)
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // tokenURI(uint256)
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // balanceOf(address)
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Transfer event
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
]

// -----------------------------
// Provider and contract helpers
// -----------------------------

export const getProvider = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed")
  }
  return new ethers.BrowserProvider(window.ethereum)
}

export const getReadOnlyProvider = () => {
  return new ethers.JsonRpcProvider("https://rpc.sepolia.org")
}

export const getSignerContract = async () => {
  const provider = getProvider()
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

export const getReadOnlyContract = () => {
  const provider = getReadOnlyProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

// -----------------------------
// Write: issue certificate
// -----------------------------

export const issueCertificate = async (
  issuerAddress: string,
  studentAddress: string,
  ipfsURI: string,
  institutionName: string,
  studentName: string,
  degreeName: string,
  graduationDate: string,
) => {
  try {
    const contract = await getSignerContract()
    console.log("Calling issueCertificate on contract:", CONTRACT_ADDRESS)

    const tx = await contract.issueCertificate(
      studentAddress,
      ipfsURI,
      institutionName,
      studentName,
      degreeName,
      graduationDate,
    )

    const receipt = await tx.wait()
    console.log("Certificate issued successfully, tx hash:", tx.hash)
    return receipt
  } catch (error) {
    console.error("Certificate issuance error (web3-provider):", error)
    throw error
  }
}

// -----------------------------
// Read: get certificate data for a specific tokenId
// -----------------------------

export const getCertificateByTokenId = async (tokenId: number) => {
  try {
    const contract = getReadOnlyContract()
    const cert = await contract.certificates(tokenId)
    const tokenOwner = await contract.ownerOf(tokenId)
    const uri = await contract.tokenURI(tokenId)

    return {
      tokenId,
      institutionName: cert.institutionName,
      studentName: cert.studentName,
      degreeName: cert.degreeName,
      graduationDate: cert.graduationDate,
      metadataURI: cert.metadataURI,
      issuedAt: Number(cert.issuedAt),
      owner: tokenOwner,
      tokenURI: uri,
    }
  } catch (error) {
    console.error("Error fetching certificate by tokenId:", error)
    throw error
  }
}

// -----------------------------
// Read: find all certificates for a wallet address using Transfer events
// -----------------------------

export const getCertificatesForAddress = async (walletAddress: string) => {
  try {
    console.log("[Web3] Fetching certificates for address:", walletAddress)
    
    const contract = getReadOnlyContract()
    const provider = getReadOnlyProvider()

    console.log("[Web3] Getting current block number...")
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 1000000)
    console.log("[Web3] Current block:", currentBlock, "Searching from block:", fromBlock)

    const filter = contract.filters.Transfer(ethers.ZeroAddress, walletAddress)
    console.log("[Web3] Querying Transfer events...")
    
    const events = await contract.queryFilter(filter, fromBlock, currentBlock)
    console.log("[Web3] Found", events.length, "transfer event(s)")

    const certificates = []
    for (const event of events) {
      try {
        const log = event as ethers.EventLog
        const tid = Number(log.args[2])
        console.log("[Web3] Processing token ID:", tid)
        
        const cert = await contract.certificates(tid)
        console.log("[Web3] Retrieved certificate data for token", tid)

        let currentOwner
        try {
          currentOwner = await contract.ownerOf(tid)
        } catch (err) {
          console.warn("[Web3] Could not determine owner for token", tid, "- skipping")
          continue
        }

        if (currentOwner.toLowerCase() === walletAddress.toLowerCase()) {
          certificates.push({
            tokenId: tid,
            institutionName: cert.institutionName,
            studentName: cert.studentName,
            degreeName: cert.degreeName,
            graduationDate: cert.graduationDate,
            metadataURI: cert.metadataURI,
            issuedAt: Number(cert.issuedAt),
          })
          console.log("[Web3] Added certificate for token", tid)
        }
      } catch (err) {
        console.error("[Web3] Error processing event:", err)
      }
    }

    console.log("[Web3] Returning", certificates.length, "certificate(s)")
    return certificates
  } catch (error) {
    console.error("[Web3] Error fetching certificates for address:", error)
    throw error
  }
}

// -----------------------------
// Read: get all issued certificates using Transfer events (for issuer view)
// -----------------------------

export const getAllIssuedCertificates = async () => {
  try {
    const contract = getReadOnlyContract()
    const provider = getReadOnlyProvider()

    const filter = contract.filters.Transfer(ethers.ZeroAddress)
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 1000000)

    const events = await contract.queryFilter(filter, fromBlock, currentBlock)

    const certificates = []
    for (const event of events) {
      try {
        const log = event as ethers.EventLog
        const tid = Number(log.args[2])
        const to = log.args[1] as string
        const cert = await contract.certificates(tid)

        certificates.push({
          tokenId: tid,
          studentAddress: to,
          institutionName: cert.institutionName,
          studentName: cert.studentName,
          degreeName: cert.degreeName,
          graduationDate: cert.graduationDate,
          metadataURI: cert.metadataURI,
          issuedAt: Number(cert.issuedAt),
        })
      } catch (err) {
        console.error("Error processing mint event:", err)
      }
    }

    return certificates
  } catch (error) {
    console.error("Error fetching all certificates:", error)
    throw error
  }
}
