"use client"

import { useState, useEffect } from "react"
import { exchangeRateService } from "./api/services"

// Cache for exchange rate to avoid repeated API calls
let cachedRate: number | null = null
let lastFetch: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached exchange rate or fetch from API
 */
export async function getExchangeRate(): Promise<number> {
    const now = Date.now()

    // Return cached rate if still valid
    if (cachedRate !== null && now - lastFetch < CACHE_DURATION) {
        return cachedRate
    }

    try {
        const response = await exchangeRateService.get()
        cachedRate = Number(response.usdToBs)
        lastFetch = now
        return cachedRate
    } catch (error) {
        console.error("Error fetching exchange rate:", error)
        // Fallback to default rate if API fails
        return 301.65
    }
}

/**
 * Clear the exchange rate cache (useful after updating the rate)
 */
export function clearExchangeRateCache() {
    cachedRate = null
    lastFetch = 0
}

/**
 * Hook to use exchange rate with automatic fetching and caching
 */
export function useCurrency() {
    const [rate, setRate] = useState<number>(301.65) // Default rate
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function fetchRate() {
            try {
                setLoading(true)
                const fetchedRate = await getExchangeRate()
                if (mounted) {
                    setRate(fetchedRate)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error("Unknown error"))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchRate()

        return () => {
            mounted = false
        }
    }, [])

    return { rate, loading, error }
}
