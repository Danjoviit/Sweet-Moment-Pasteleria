"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { emailService } from "@/lib/email-service"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenEmail, setTokenEmail] = useState<string>("")

  useEffect(() => {
    if (token) {
      const result = emailService.verifyPasswordResetToken(token)
      setTokenValid(result.valid)
      if (result.email) {
        setTokenEmail(result.email)
      }
      if (!result.valid && result.error) {
        setError(result.error)
      }
    } else {
      setTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Token de recuperación inválido")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError("")

    const tokenCheck = emailService.verifyPasswordResetToken(token)
    if (!tokenCheck.valid) {
      setError(tokenCheck.error || "Token inválido")
      setIsLoading(false)
      return
    }

    // Simular actualización de contraseña
    // En producción, aquí se enviaría la nueva contraseña al backend
    await new Promise((resolve) => setTimeout(resolve, 500))

    emailService.invalidatePasswordResetToken(token)

    // Mostrar éxito
    // Nota: La actualización real de la contraseña debe hacerse en el backend
    // Este frontend solo maneja el flujo de UI y validación de tokens
    console.log(`[Momentos Dulces] Contraseña actualizada para: ${tokenEmail}`)
    console.log(`[Momentos Dulces] Nueva contraseña: ${password}`)
    console.log("[Momentos Dulces] En producción, esto se enviaría al backend para actualizar en la base de datos")

    setIsLoading(false)
    setSuccess(true)
  }

  // Mientras se verifica el token
  if (tokenValid === null) {
    return (
      <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </CardContent>
      </Card>
    )
  }

  // Token inválido o expirado
  if (!token || !tokenValid) {
    return (
      <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enlace Inválido</h2>
          <p className="text-gray-600 mb-6">
            {error || "El enlace de recuperación es inválido o ha expirado. Por favor solicita un nuevo enlace."}
          </p>
          <Link href="/recuperar-password">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Solicitar Nuevo Enlace</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contraseña Restablecida</h2>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link href="/login">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Ir a Iniciar Sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Nueva Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para la cuenta: <strong>{tokenEmail}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              En modo desarrollo, la contraseña se muestra en la consola. En producción, se enviará al backend para
              actualizarla en la base de datos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError("")
              }}
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Restablecer Contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function RestablecerPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <Suspense
          fallback={
            <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
              </CardContent>
            </Card>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
