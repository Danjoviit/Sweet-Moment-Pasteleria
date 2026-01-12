"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { exchangeRateService } from "@/lib/api/services"
import { clearExchangeRateCache } from "@/lib/currency"
import { Loader2, DollarSign } from "lucide-react"
import type { ExchangeRate } from "@/lib/api/types"

export function ExchangeRateManager() {
    const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
    const [newRate, setNewRate] = useState("")
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchExchangeRate()
    }, [])

    async function fetchExchangeRate() {
        try {
            setLoading(true)
            const rate = await exchangeRateService.get()
            setExchangeRate(rate)
            setNewRate(rate.usdToBs.toString())
            setError(null)
        } catch (err) {
            setError("Error al cargar la tasa de cambio")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()

        const rateValue = parseFloat(newRate)
        if (isNaN(rateValue) || rateValue <= 0) {
            setError("Ingrese una tasa válida mayor a 0")
            return
        }

        try {
            setUpdating(true)
            setError(null)
            setSuccess(false)

            const updated = await exchangeRateService.update(rateValue)
            setExchangeRate(updated)

            // Clear the cache so the new rate is fetched
            clearExchangeRateCache()

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError("Error al actualizar la tasa de cambio")
            console.error(err)
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-rose-600" />
                    <div>
                        <CardTitle>Tasa de Cambio USD → Bs</CardTitle>
                        <CardDescription>
                            Configurar la tasa de conversión de dólares a bolívares
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {exchangeRate && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Tasa actual</p>
                            <p className="text-3xl font-bold text-rose-600">
                                1 USD = {Number(exchangeRate.usdToBs).toFixed(2)} Bs
                            </p>
                            {exchangeRate.updatedBy && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Última actualización por {exchangeRate.updatedBy.name || exchangeRate.updatedBy.email}
                                    {" · "}
                                    {new Date(exchangeRate.updatedAt).toLocaleString("es-VE")}
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate">Nueva tasa (Bs por 1 USD)</Label>
                            <Input
                                id="rate"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                                placeholder="301.65"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Ejemplo: Si 1 USD = 301.65 Bs, ingrese 301.65
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                ✓ Tasa actualizada correctamente
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={updating}
                            className="w-full bg-rose-600 hover:bg-rose-700"
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                "Actualizar Tasa de Cambio"
                            )}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
