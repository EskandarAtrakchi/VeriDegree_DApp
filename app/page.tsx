"use client"

import { useState, useEffect } from "react"
import WalletConnection from "@/components/wallet-connection"
import Navigation from "@/components/navigation"
import IssuerDashboard from "@/components/issuer-dashboard"
import ViewerDashboard from "@/components/viewer-dashboard"
import VerifierDashboard from "@/components/verifier-dashboard"
import LandingPage from "@/components/landing-page"

// Define the possible user roles in the application
type Role = "issuer" | "viewer" | "verifier" | null

// Main page component that handles wallet connection and role selection
export default function Home() {
  // State variables to manage wallet connection status, user address, and selected role
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [role, setRole] = useState<Role>(null)

  // useEffect hook to check if the user is already connected to a wallet when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsConnected(true)
            setAddress(accounts[0])
          }
          // Listen for account changes to update the connection status and address accordingly
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    //  Call the checkConnection function when the component mounts
    checkConnection()
  }, [])

  //  If the user is not connected to a wallet, show the landing page with a wallet connection prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">CertifyChain</h1>
          <WalletConnection
            onConnect={(addr) => {
              setIsConnected(true)
              setAddress(addr)
            }}
          />
        </div>
        <LandingPage />
      </div>
    )
  }

  // If the user is connected but has not selected a role, show the role selection screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation
        address={address}
        role={role}
        onDisconnect={() => {
          setIsConnected(false)
          setAddress("")
          setRole(null)
        }}
        onRoleChange={setRole}
      />

      {!role ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Select Your Role</h2>
            <p className="text-muted-foreground text-lg">Choose how you want to interact with the certificate system</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: "issuer" as Role,
                title: "Issuer",
                description: "Issue new educational certificates to students",
                icon: "📝",
              },
              {
                id: "viewer" as Role,
                title: "Viewer",
                description: "View and display your certificate",
                icon: "👁️",
              },
              {
                id: "verifier" as Role,
                title: "Verifier",
                description: "Verify certificates issued by others",
                icon: "✓",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setRole(item.id)}
                className="bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : role === "issuer" ? (
        <IssuerDashboard address={address} />
      ) : role === "viewer" ? (
        <ViewerDashboard address={address} />
      ) : (
        <VerifierDashboard address={address} />
      )}
    </div>
  )
}
