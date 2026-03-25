"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CONTRACT_ADDRESS } from "@/lib/web3-provider"
import { retrieveFromIPFS, ipfsToGatewayUrl } from "@/lib/ipfs-provider"

interface VerifierDashboardProps {
  address: string
}

interface CertificateResult {
  tokenId: number
  institutionName: string
  studentName: string
  degreeName: string
  graduationDate: string
  metadataURI: string
  issuedAt: number
}

interface VerificationResult {
  found: boolean
  certificates: CertificateResult[]
  metadataMap: Record<number, any>
}

const RAW_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "rose-known-carp-497.mypinata.cloud"
const PINATA_GATEWAY = RAW_GATEWAY.startsWith("http")
  ? RAW_GATEWAY
  : `https://${RAW_GATEWAY}`

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

export default function VerifierDashboard({ address }: VerifierDashboardProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      if (!walletAddress) {
        throw new Error("Please enter a wallet address")
      }

      if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid wallet address format")
      }

      console.log("[Verifier] Verifying certificate for address:", walletAddress)

      // Call backend API instead of directly querying blockchain
      console.log("[Verifier] Calling API to verify certificates")
      const apiResponse = await fetch("/api/certificates/get-for-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: walletAddress }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || "Failed to verify certificates")
      }

      const apiData = await apiResponse.json()
      console.log("[Verifier] API returned certificates:", apiData.count)
      
      const certificates = apiData.certificates

      if (certificates.length > 0) {
        console.log("[Verifier] Fetching IPFS metadata for", certificates.length, "certificate(s)")
        
        // Fetch IPFS metadata for each with better error tracking
        const metadataMap: Record<number, any> = {}
        for (const cert of certificates) {
          try {
            console.log("[Verifier] Fetching metadata for token", cert.tokenId, "URI:", cert.metadataURI)
            const md = await retrieveFromIPFS(cert.metadataURI)
            metadataMap[cert.tokenId] = md
            console.log("[Verifier] Successfully fetched metadata for token", cert.tokenId)
          } catch (err) {
            console.error("[Verifier] Failed to fetch metadata for token", cert.tokenId, ":", err)
            // Continue anyway - certificate data is still valid even without metadata image
            metadataMap[cert.tokenId] = {}
          }
        }

        setResult({
          found: true,
          certificates,
          metadataMap,
        })
      } else {
        setResult({
          found: false,
          certificates: [],
          metadataMap: {},
        })
      }
    } catch (err: any) {
      console.error("[Verifier] Verification error:", err)
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Verify Certificate</h2>
        <p className="text-muted-foreground">Check if a wallet holds a valid educational certificate</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Enter Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Wallet Address to Verify
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Verifying..." : "Verify Certificate"}
                </Button>
              </form>

              {result && (
                <div className="mt-6 pt-6 border-t border-border">
                  {result.found && result.certificates.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30">
                          Certificate Verified
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.certificates.length} certificate{result.certificates.length > 1 ? "s" : ""} found
                        </span>
                      </div>

                      {result.certificates.map((cert) => {
                        const metadata = result.metadataMap[cert.tokenId]
                        const imageUrl = resolveImageUrl(metadata)
                        const metadataHttpUrl = resolveMetadataHttpUrl(cert.metadataURI)

                        return (
                          <div key={cert.tokenId} className="border border-border rounded-lg p-4 space-y-4">
                            {imageUrl && (
                              <div className="flex justify-center mb-4">
                                <img
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={`Certificate for ${cert.degreeName}`}
                                  className="max-w-sm rounded-lg border border-border shadow-lg"
                                />
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Student Name</p>
                                <p className="text-lg font-semibold text-foreground">{cert.studentName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Institution</p>
                                <p className="text-lg font-semibold text-foreground">{cert.institutionName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Degree</p>
                                <p className="text-lg font-semibold text-foreground">{cert.degreeName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Graduation Date</p>
                                <p className="text-lg font-semibold text-foreground">{cert.graduationDate}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Issued Date</p>
                                <p className="text-lg font-semibold text-foreground">
                                  {new Date(cert.issuedAt * 1000).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Token ID</p>
                                <p className="text-lg font-semibold text-foreground">#{cert.tokenId}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                              {metadataHttpUrl && (
                                <a
                                  href={metadataHttpUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary underline"
                                >
                                  View IPFS Metadata
                                </a>
                              )}
                              <a
                                href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${cert.tokenId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary underline"
                              >
                                View on Etherscan
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/50 border border-muted rounded p-4">
                      <p className="text-muted-foreground">No certificate found for this wallet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-border bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-sm">Verification Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Real-time blockchain verification</p>
              <p>Tamper-proof certificates</p>
              <p>Instant credential checking</p>
              <p>No contact with issuer needed</p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs">
                  Network: <span className="font-semibold text-foreground">Sepolia Testnet</span>
                </p>
                <p className="text-xs mt-1">
                  Contract:{" "}
                  <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary underline"
                  >
                    {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
