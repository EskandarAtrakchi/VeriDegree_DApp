"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTRACT_ADDRESS } from "@/lib/web3-provider"

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
          Blockchain-Based Certificate Management
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance">
          Issue, verify, and manage educational certificates securely on the Ethereum Sepolia Testnet. Immutable
          credentials that stand the test of time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          {
            title: "Secure Issuance",
            description: "Issue tamper-proof certificates as soulbound NFTs on the blockchain",
          },
          {
            title: "Easy Verification",
            description: "Verify any certificate instantly with just a wallet address",
          },
          {
            title: "Soulbound Certificates",
            description: "Non-transferable certificates permanently bound to the recipient",
          },
        ].map((feature) => (
          <Card key={feature.title} className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Connect Your Wallet to Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Click the &quot;Connect Wallet&quot; button above to connect your MetaMask wallet and start managing
            certificates. Make sure you are on the Sepolia ETH Testnet.
          </p>
          <p className="text-sm text-muted-foreground">
            Contract:{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-primary underline"
            >
              {CONTRACT_ADDRESS}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
