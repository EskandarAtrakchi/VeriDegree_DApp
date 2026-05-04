"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllIssuedCertificates } from "@/lib/web3-provider"
 
// This component fetches and displays a list of all certificates issued by the connected issuer.
interface CertificatesListProps {
  issuerAddress: string
  refresh: number
}

// Define the structure of a certificate entry for type safety and easier handling of certificate data.
interface CertEntry {
  tokenId: number
  studentAddress: string
  studentName: string
  degreeName: string
  institutionName: string
  graduationDate: string
  issuedAt: number
}
 
// uses the getAllIssuedCertificates function to retrieve the data and manages loading state to provide feedback to the user while data is being fetched.
export default function CertificatesList({ issuerAddress, refresh }: CertificatesListProps) {
  const [certificates, setCertificates] = useState<CertEntry[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect is used to fetch the certificates when the component mounts or when the issuerAddress or refresh props change. It sets the loading state to true while fetching and updates the certificates state with the retrieved data. If there's an error during fetching, it logs the error to the console.
  useEffect(() => {
    const fetchCertificates = async () => {
      // Ensure that the issuerAddress is available before attempting to fetch certificates. If it's not available, we can skip the fetch and set loading to false. 
      try {
        setLoading(true)
        const certs = await getAllIssuedCertificates()
        setCertificates(certs)
      } catch (error) {
        console.error("Error fetching certificates:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch certificates if the issuerAddress is available. This prevents unnecessary fetch attempts when the component first mounts and the issuerAddress is not yet set.
    fetchCertificates()
  }, [issuerAddress, refresh])

  // The component renders a card that displays the list of issued certificates. If the data is still loading, it shows a loading spinner. If there are no certificates, it displays a message indicating that no certificates have been issued yet. Otherwise, it maps over the certificates array and displays each certificate's details in a styled format.
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Issued Certificates</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : certificates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No certificates issued yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {certificates.map((cert) => (
              <div key={cert.tokenId} className="p-3 bg-muted/30 rounded border border-border text-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground truncate">{cert.studentName}</p>
                  <span className="text-xs text-muted-foreground">#{cert.tokenId}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{cert.degreeName}</p>
                <p className="text-xs text-muted-foreground truncate">{cert.institutionName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To: {cert.studentAddress.slice(0, 6)}...{cert.studentAddress.slice(-4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
