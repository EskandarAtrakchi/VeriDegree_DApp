// Pinata dedicated gateway - defaults to your gateway but can be overridden
const RAW_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "rose-known-carp-497.mypinata.cloud"

// Token required for restricted Pinata gateway (optional)
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN ?? ""

// Public IPFS gateways as fallback
const PUBLIC_GATEWAYS = [
  "https://gateway.pinata.cloud",
  "https://ipfs.io",
  "https://cloudflare-ipfs.com",
]

function buildGatewayUrl(cid: string): string {
  // If user has a dedicated Pinata gateway configured, use that first
  if (RAW_GATEWAY) {
    const base = RAW_GATEWAY.startsWith("http")
      ? RAW_GATEWAY
      : `https://${RAW_GATEWAY}`
    const url = `${base}/ipfs/${cid}`
    return GATEWAY_TOKEN ? `${url}?pinataGatewayToken=${GATEWAY_TOKEN}` : url
  }
  // Otherwise use public Pinata gateway
  return `${PUBLIC_GATEWAYS[0]}/ipfs/${cid}`
}

function getFallbackUrls(cid: string): string[] {
  return PUBLIC_GATEWAYS.map((gw) => `${gw}/ipfs/${cid}`)
}

export const uploadImageToIPFS = async (file: File): Promise<string> => {
  try {
    console.log("Uploading image to Pinata IPFS (via API route)")
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/pinata/upload-file", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Pinata API response:", response.status, errorText)
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const ipfsHash = result.IpfsHash
    const imageURL = buildGatewayUrl(ipfsHash)
    console.log("Image uploaded to IPFS:", imageURL)
    return imageURL
  } catch (error) {
    console.error("Image upload error:", error)
    throw new Error(`Failed to upload image: ${error}`)
  }
}

export const uploadToIPFS = async (data: object): Promise<string> => {
  try {
    console.log("Uploading metadata to Pinata IPFS (via API route)")

    const response = await fetch("/api/pinata/upload-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Pinata API response:", response.status, errorText)
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const ipfsHash = result.IpfsHash
    console.log("Metadata uploaded to IPFS:", ipfsHash)
    // On-chain we store ipfs://CID
    return `ipfs://${ipfsHash}`
  } catch (error) {
    console.error("Pinata upload error:", error)
    throw new Error(`Failed to upload to IPFS: ${error}`)
  }
}

export const retrieveFromIPFS = async (ipfsURI: string): Promise<any> => {
  try {
    if (!ipfsURI) {
      console.warn("[IPFS] Empty IPFS URI provided")
      return {}
    }

    console.log("[IPFS] Retrieving from IPFS URI:", ipfsURI)

    const cid = ipfsURI.replace("ipfs://", "").replace(/^\/ipfs\//, "")
    console.log("[IPFS] Extracted CID:", cid)

    // Build all URLs to try
    const primaryUrl = buildGatewayUrl(cid)
    const fallbacks = getFallbackUrls(cid)
    const urlsToTry = [primaryUrl, ...fallbacks.filter((u) => u !== primaryUrl)]

    console.log("[IPFS] URLs to try:", urlsToTry)

    // Try each gateway with proper error handling
    for (const url of urlsToTry) {
      try {
        console.log("[IPFS] Attempting to fetch from:", url)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.status === 401 || response.status === 403) {
          console.warn("[IPFS] Access denied (401/403) from gateway:", url)
          continue
        }

        if (!response.ok) {
          console.warn(`[IPFS] Gateway returned ${response.status}:`, url)
          continue
        }

        const contentType = response.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) {
          console.warn("[IPFS] Response is not JSON from:", url)
          continue
        }

        const data = await response.json()
        console.log("[IPFS] Successfully retrieved metadata from:", url)
        return data
      } catch (err: any) {
        const errorMsg = err?.message || String(err)
        if (err?.name === "AbortError") {
          console.warn("[IPFS] Fetch timeout, trying next gateway:", url)
        } else {
          console.warn("[IPFS] Fetch error, trying next gateway:", url, errorMsg)
        }
      }
    }

    console.error("[IPFS] All gateways failed for CID:", cid)
    console.error("[IPFS] Failed IPFS URI:", ipfsURI)
    return {}
  } catch (error) {
    console.error("[IPFS] Critical retrieval error:", error)
    return {}
  }
}

export const generateCertificateMetadata = (
  institutionName: string,
  studentName: string,
  degreeName: string,
  graduationDate: string,
  imageURL: string,
) => {
  return {
    name: `${degreeName} - ${studentName}`,
    description: `Educational certificate from ${institutionName}`,
    image: imageURL || "",
    attributes: [
      { trait_type: "Institution", value: institutionName },
      { trait_type: "Student Name", value: studentName },
      { trait_type: "Degree", value: degreeName },
      { trait_type: "Graduation Date", value: graduationDate },
      { trait_type: "Certificate Type", value: "Educational" },
    ],
  }
}

export const ipfsToGatewayUrl = (ipfsURI: string): string => {
  if (!ipfsURI) return ""
  const cid = ipfsURI.replace("ipfs://", "").replace(/^\/ipfs\//, "")
  return buildGatewayUrl(cid)
}
