"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CONTRACT_ADDRESS } from "@/lib/web3-provider"
import { retrieveFromIPFS, ipfsToGatewayUrl } from "@/lib/ipfs-provider"

interface ViewerDashboardProps {
  address: string
}

function resolveImageUrl(metadata: any): string | undefined {
  const image = metadata?.image
  if (!image || typeof image !== "string") return undefined

  if (image.startsWith("ipfs://")) {
    return ipfsToGatewayUrl(image)
  }

  return image
}

function resolveMetadataHttpUrl(ipfsURI: string | undefined): string | undefined {
  if (!ipfsURI) return undefined
  if (!ipfsURI.startsWith("ipfs://")) return ipfsURI
  return ipfsToGatewayUrl(ipfsURI)
}

interface CertificateData {
  tokenId: number
  institutionName: string
  studentName: string
  degreeName: string
  graduationDate: string
  metadataURI: string
  issuedAt: number
  metadata?: any
}

export default function ViewerDashboard({ address }: ViewerDashboardProps) {
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        console.log("[Viewer] Fetching certificates for address:", address)
        setLoading(true)
        setError("")
        setCertificates([])

        // Call backend API instead of directly querying blockchain
        console.log("[Viewer] Calling API to fetch certificates")
        const apiResponse = await fetch("/api/certificates/get-for-address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        })

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json()
          throw new Error(errorData.error || "Failed to fetch certificates from API")
        }

        const apiData = await apiResponse.json()
        console.log("[Viewer] API returned certificates:", apiData.count)
        
        const results = apiData.certificates
        if (results.length === 0) {
          setError("No certificate found for this wallet")
          return
        }

        // Fetch IPFS metadata for each certificate
        console.log("[Viewer] Fetching IPFS metadata for", results.length, 'certificate(s)')
        const certsWithMetadata: CertificateData[] = []
        for (const cert of results) {
          let metadata = null
          try {
            console.log("[Viewer] Fetching metadata for token", cert.tokenId, 'URI:', cert.metadataURI)
            metadata = await retrieveFromIPFS(cert.metadataURI)
            console.log("[Viewer] Successfully fetched metadata for token", cert.tokenId)
          } catch (err) {
            console.error("[Viewer] Failed to fetch metadata for token", cert.tokenId, err)
            // Continue anyway, certificate is still valid
          }
          certsWithMetadata.push({ ...cert, metadata })
        }

        setCertificates(certsWithMetadata)
      } catch (err: any) {
        console.error("[Viewer] Error fetching certificates:", err)
        setError(err.message || "Failed to fetch certificate")
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchCertificates()
    }
  }, [address])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your Certificates</h2>
        <p className="text-muted-foreground">View and share your educational certificates</p>
      </div>

      {loading ? (
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">No Certificate Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure the issuer has already issued a certificate to this wallet address.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {certificates.map((certificate) => {
            const imageUrl = resolveImageUrl(certificate.metadata)
            const metadataHttpUrl = resolveMetadataHttpUrl(certificate.metadataURI)

            return (
              <Card key={certificate.tokenId} className="border-border">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle>{certificate.degreeName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Certificate for ${certificate.degreeName}`}
                        className="max-w-sm rounded-lg border border-border shadow-lg"
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Student Name</p>
                      <p className="text-lg font-semibold text-foreground">{certificate.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Institution</p>
                      <p className="text-lg font-semibold text-foreground">{certificate.institutionName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Graduation Date</p>
                      <p className="text-lg font-semibold text-foreground">{certificate.graduationDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Issued</p>
                      <p className="text-lg font-semibold text-foreground">
                        {new Date(certificate.issuedAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Token ID</p>
                      <p className="text-lg font-semibold text-foreground">#{certificate.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">IPFS Metadata</p>
                      {metadataHttpUrl ? (
                        <a
                          href={metadataHttpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-primary underline break-all"
                        >
                          {certificate.metadataURI}
                        </a>
                      ) : (
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {certificate.metadataURI}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30">
                      Soulbound Certificate
                    </Badge>
                    <a
                      href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${certificate.tokenId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
