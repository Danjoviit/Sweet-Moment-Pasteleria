"use client"

import { useCurrencyContext } from "@/lib/currency-context"
import { formatCurrency } from "@/lib/format"

interface PriceProps {
    value: number | string
    className?: string
    showSymbol?: boolean
}

/**
 * Component to display prices in Bolivares with automatic conversion from USD
 * Uses CurrencyContext to avoid multiple API calls
 */
export function Price({ value, className = "", showSymbol = true }: PriceProps) {
    const { rate, loading } = useCurrencyContext()

    if (loading) {
        return <span className={className}>...</span>
    }

    return <span className={className}>{formatCurrency(value, rate, showSymbol)}</span>
}
