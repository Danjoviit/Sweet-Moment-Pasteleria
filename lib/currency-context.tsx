"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { exchangeRateService } from "./api/services"

interface CurrencyContextType {
    rate: number
    loading: boolean
    error: Error | null
    refreshRate: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [rate, setRate] = useState<number>(301.65) // Default rate
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchRate = async () => {
        try {
            setLoading(true)
            const response = await exchangeRateService.get()
            setRate(Number(response.usdToBs))
            setError(null)
        } catch (err) {
            console.error("Error fetching exchange rate:", err)
            setError(err instanceof Error ? err : new Error("Unknown error"))
            // Keep default rate on error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRate()
    }, [])

    const refreshRate = async () => {
        await fetchRate()
    }

    return (
        <CurrencyContext.Provider value={{ rate, loading, error, refreshRate }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrencyContext() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error("useCurrencyContext must be used within a CurrencyProvider")
    }
    return context
}
