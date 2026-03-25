"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllIssuedCertificates } from "@/lib/web3-provider"

interface CertificatesListProps {
  issuerAddress: string
  refresh: number
}

interface CertEntry {
  tokenId: number
  studentAddress: string
  studentName: string
  degreeName: string
  institutionName: string
  graduationDate: string
  issuedAt: number
}

export default function CertificatesList({ issuerAddress, refresh }: CertificatesListProps) {
  const [certificates, setCertificates] = useState<CertEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
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

    fetchCertificates()
  }, [issuerAddress, refresh])

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
