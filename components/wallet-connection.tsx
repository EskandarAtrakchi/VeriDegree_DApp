"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WalletConnectionProps {
  onConnect: (address: string) => void
}

export default function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      if (!window.ethereum) {
        setError("MetaMask not installed. Please install MetaMask.")
        setIsConnecting(false)
        return
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        // Request to switch to Sepolia ETH Testnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 11155111 in hex for Sepolia
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, add it
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            })
          }
        }

        onConnect(accounts[0])
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    }

    setIsConnecting(false)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
