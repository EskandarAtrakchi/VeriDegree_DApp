"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WalletStatusProps {
  address: string
}

export default function WalletStatus({ address }: WalletStatusProps) {
  const [balance, setBalance] = useState<string>("")
  const [chainId, setChainId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getWalletDetails = async () => {
      try {
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        const balanceETH = Number.parseInt(balanceWei, 16) / 1e18
        setBalance(balanceETH.toFixed(4))

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

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const isCorrectChain = chainId === "0xaa36a7"

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
