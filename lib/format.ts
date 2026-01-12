/**
 * Utility functions for number formatting and currency conversion
 */

/**
 * Safely formats a number to fixed decimal places
 * Handles both numbers and strings from backend
 */
export function formatPrice(value: number | string | undefined, decimals: number = 2): string {
    const num = Number(value || 0)
    return num.toFixed(decimals)
}

/**
 * Safely converts a value to number
 */
export function toNumber(value: number | string | undefined): number {
    return Number(value || 0)
}

/**
 * Convert USD price to Bolivares using exchange rate
 */
export function convertUsdToBs(usdPrice: number | string, exchangeRate: number): number {
    const usd = toNumber(usdPrice)
    return usd * exchangeRate
}

/**
 * Format price in Bolivares with proper formatting (American format: 1,234.56)
 */
export function formatCurrency(value: number | string, exchangeRate: number = 1, showSymbol: boolean = true): string {
    const bsPrice = convertUsdToBs(value, exchangeRate)

    // Format with thousands separators and 2 decimals
    const formatted = bsPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    return showSymbol ? `Bs ${formatted}` : formatted
}

