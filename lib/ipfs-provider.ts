// Pinata dedicated gateway defaults to gateway but can be overridden
const RAW_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "rose-known-carp-497.mypinata.cloud"

// Token required for restricted Pinata gateway
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN ?? ""

// Public IPFS gateways as fallback
const PUBLIC_GATEWAYS = [
  "https://gateway.pinata.cloud",
  "https://ipfs.io",
  "https://cloudflare-ipfs.com",
]

function buildGatewayUrl(cid: string): string {
  // If user has a dedicated Pinata gateway configured
  if (RAW_GATEWAY) {
    const base = RAW_GATEWAY.startsWith("http")
      ? RAW_GATEWAY
      : `https://${RAW_GATEWAY}`
    const url = `${base}/ipfs/${cid}`
    return GATEWAY_TOKEN ? `${url}?pinataGatewayToken=${GATEWAY_TOKEN}` : url
  }
  // Otherwise public Pinata gateway
  return `${PUBLIC_GATEWAYS[0]}/ipfs/${cid}`
}

// Generate fallback URLs for public gateways in case the primary gateway fails
function getFallbackUrls(cid: string): string[] {
  return PUBLIC_GATEWAYS.map((gw) => `${gw}/ipfs/${cid}`)
}

// Uploads a file to IPFS via a Pinata API route and returns the accessible URL of the uploaded file.
export const uploadImageToIPFS = async (file: File): Promise<string> => {
  try {
    // We create a FormData object and append the file to it, then send a POST request to our API route that handles the Pinata upload
    console.log("Uploading image to Pinata IPFS (via API route)")
    const formData = new FormData()
    formData.append("file", file)

    // The API route will handle the interaction with Pinata, including authentication and error handling
    const response = await fetch("/api/pinata/upload-file", {
      method: "POST",
      body: formData,
    })

    // If not we log the error details and throw an error to be handled by the calling function.
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Pinata API response:", response.status, errorText)
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`)
    }

    // If the upload is successful, we parse the response to get the IPFS hash of the uploaded file, construct the accessible URL using our gateway configuration, and return it.
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

// Uploads JSON metadata to IPFS via a Pinata API route and returns the IPFS URI (ipfs://CID) to be stored on-chain.
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

    // If the upload fails, we log the error details and throw an error to be handled by the calling function.
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Pinata API response:", response.status, errorText)
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`)
    }

    // If the upload is successful, we parse the response to get the IPFS hash of the uploaded metadata and return it in the format ipfs://CID, which can be stored on-chain.
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

// Retrieves JSON metadata from IPFS given an IPFS URI (ipfs://CID) by trying multiple gateways.
export const retrieveFromIPFS = async (ipfsURI: string): Promise<any> => {
  try {
    if (!ipfsURI) {
      console.warn("[IPFS] Empty IPFS URI provided")
      return {}
    }

    // We first extract the CID from the provided IPFS URI, then we build a list of gateway URLs
    console.log("[IPFS] Retrieving from IPFS URI:", ipfsURI)

    // Extract CID from the IPFS URI by removing the "ipfs://" prefix and any leading "/ipfs/" segments
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

        //If the fetch fails due to a network error, timeout, or non-200 response, we catch the error, log it, and continue to the next gateway in the list.
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        //perform a GET request to the gateway URL with the appropriate headers and signal for timeout handling.
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // If we receive a 401 or 403 status code, it indicates that access to the gateway is denied, so we log a warning and skip to the next gateway without treating it as a an actual error.
        if (response.status === 401 || response.status === 403) {
          console.warn("[IPFS] Access denied (401/403) from gateway:", url)
          continue
        }

        // If we receive a non-200 response, we log the status and skip to the next gateway.
        if (!response.ok) {
          console.warn(`[IPFS] Gateway returned ${response.status}:`, url)
          continue
        }

        //check if the content type of the response is JSON, as we expect metadata to be in JSON format. If it's not JSON,log a warning and skip to the next gateway.
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

    // If all gateways fail, we log an error and return an empty object. The calling function should handle the case where metadata cannot be retrieved.
    console.error("[IPFS] All gateways failed for CID:", cid)
    console.error("[IPFS] Failed IPFS URI:", ipfsURI)
    return {}
  } catch (error) {
    console.error("[IPFS] Critical retrieval error:", error)
    return {}
  }
}

// The generateCertificateMetadata function creates a structured metadata object for a certificate, which includes the institution name, student name, degree name, graduation date, and an image URL
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

// The ipfsToGatewayUrl function takes an IPFS URI (in the format ipfs://CID) and converts it to a fully qualified URL using the configured gateway
export const ipfsToGatewayUrl = (ipfsURI: string): string => {
  if (!ipfsURI) return ""
  const cid = ipfsURI.replace("ipfs://", "").replace(/^\/ipfs\//, "")
  return buildGatewayUrl(cid)
}
