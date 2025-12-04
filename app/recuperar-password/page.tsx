"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { emailService } from "@/lib/email-service"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [resetLink, setResetLink] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("El correo electrónico es requerido")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El correo electrónico no es válido")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await emailService.sendPasswordResetEmail(email)

    setIsLoading(false)

    if (result.success) {
      setSuccess(true)
      if (result.token) {
        setResetLink(`${window.location.origin}/restablecer-password?token=${result.token}`)
      }
    } else {
      setError(result.error || "Error al enviar el correo")
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resetLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Error al copiar")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Header />

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Correo Enviado</h2>
              <p className="text-gray-600 mb-6">
                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con instrucciones para
                restablecer tu contraseña.
              </p>

              {resetLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <p className="text-sm text-amber-800 font-medium mb-2">
                        Modo Desarrollo - Enlace de recuperación:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-amber-100 px-2 py-1 rounded break-all flex-1">{resetLink}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 bg-transparent"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Link
                        href={resetLink}
                        className="text-xs text-amber-700 hover:text-amber-900 underline mt-2 block"
                      >
                        Ir al enlace de recuperación
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/login">
                <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Volver a Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Recuperar Contraseña</CardTitle>
            <CardDescription>Te enviaremos un enlace para restablecer tu contraseña</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
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
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>

            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-rose-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
