"use client"

import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/lib/auth-store"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkSession, isHydrated } = useAuthStore()

  useEffect(() => {
    if (isHydrated) {
      checkSession()
    }
  }, [isHydrated, checkSession])

  return <>{children}</>
}
