"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WalletStatusProps {
  address: string
}

// The WalletStatus component is responsible for displaying the connected wallet's address, balance, and network status. It fetches the wallet details using the Ethereum provider and updates the UI accordingly.
export default function WalletStatus({ address }: WalletStatusProps) {
  const [balance, setBalance] = useState<string>("")
  const [chainId, setChainId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // useEffect is used to fetch the wallet details (balance and network) when the component mounts or when the address prop changes
  useEffect(() => {
    const getWalletDetails = async () => {
      // We use the window.ethereum.request method to fetch the wallet's balance and current chain ID
      try {
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        // The balance is returned in Wei (the smallest unit of Ether), so we convert it to Ether by dividing by 1e18 and format it to 4 decimal places for display.
        const balanceETH = Number.parseInt(balanceWei, 16) / 1e18
        setBalance(balanceETH.toFixed(4))

        // We also fetch the current chain ID to determine if the user is connected to the correct network (Sepolia ETH Testnet).
        const chain = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chain)
      } catch (error) {
        console.error("Error fetching wallet details:", error)
      } finally {
        setLoading(false)
      }
    }

    getWalletDetails()
  }, [address])

  // We create a shortened version of the wallet address for display purposes, showing the first 6 and last 4 characters
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const isCorrectChain = chainId === "0xaa36a7"

  // The component renders a card that displays the wallet's address, balance, and network status. 
  return (
    <Card className="w-full border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Address</p>
          <p className="font-mono text-sm font-semibold text-foreground">{shortAddress}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-semibold text-sm text-foreground">{loading ? "Loading..." : `${balance} ETH`}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Network</p>
          <div className="flex items-center gap-2">
            <Badge variant={isCorrectChain ? "default" : "destructive"} className="text-xs">
              {isCorrectChain ? "Sepolia Testnet" : "Wrong Network"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
