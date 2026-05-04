"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// The WalletConnection component is responsible for handling the connection to the user's Ethereum wallet (MetaMask) and ensuring that they are connected to the correct network (Sepolia ETH Testnet).
interface WalletConnectionProps {
  onConnect: (address: string) => void
}

// check if MetaMask is installed, requests access to the user's accounts, and attempts to switch to the Sepolia ETH Testnet. 
export default function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")

  // The connectWallet function is called when the user clicks the "Connect Wallet" button
  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    // We first check if the window.ethereum object is available, which indicates that MetaMask is installed. If it is not available, we set an error message and return early.
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed. Please install MetaMask.")
        setIsConnecting(false)
        return
      }

      // If MetaMask is available, we request access to the user's accounts using the eth_requestAccounts method.
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // If the user approves the connection and we receive an array of accounts, we attempt to switch to the Sepolia ETH Testnet using the wallet_switchEthereumChain method
      if (accounts.length > 0) {
        // Request to switch to Sepolia ETH Testnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 11155111 in hex for Sepolia
          })
        } catch (switchError: any) {
          // If the error code is 4902, it means the Sepolia network is not added to MetaMask, so next step is attempt to add it.
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

  // The component renders a button that allows the user to connect their wallet. If there is an error during the connection process, it displays the error message below the button.
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
