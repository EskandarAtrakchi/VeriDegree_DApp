"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import IssueCertificateForm from "@/components/issue-certificate-form"
import CertificatesList from "@/components/certificates-list"

interface IssuerDashboardProps {
  address: string
}

export default function IssuerDashboard({ address }: IssuerDashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Issuer Dashboard</h2>
        <p className="text-muted-foreground">Issue new educational certificates to students on the blockchain</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {showForm ? (
            <IssueCertificateForm
              issuerAddress={address}
              onSuccess={() => {
                setShowForm(false)
                setRefreshTrigger((t) => t + 1)
              }}
            />
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Issue New Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Ready to issue a new certificate? Click the button below to create a new educational certificate NFT.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Issuing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <CertificatesList issuerAddress={address} refresh={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}
