"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import WalletStatus from "@/components/wallet-status"

interface NavigationProps {
  address: string
  role: string | null
  onDisconnect: () => void
  onRoleChange: (role: any) => void
}

export default function Navigation({ address, role, onDisconnect, onRoleChange }: NavigationProps) {
  const [showStatus, setShowStatus] = useState(false)

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">CertifyChain</h1>
            {role && <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {role}</p>}
          </div>

          <div className="flex items-center gap-4">
            {role && (
              <Button variant="outline" size="sm" onClick={() => onRoleChange(null)}>
                Change Role
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-4 border-b border-border">
                  <WalletStatus address={address} />
                </div>
                <DropdownMenuItem onClick={onDisconnect} className="text-destructive focus:text-destructive">
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
