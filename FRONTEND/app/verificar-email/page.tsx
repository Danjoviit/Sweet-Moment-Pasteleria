"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useAuthStore } from "@/lib/auth-store"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const { verifyEmail } = useAuthStore()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error")
        setErrorMessage("Token de verificación inválido")
        return
      }

      const result = await verifyEmail(token)

      if (result.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Error al verificar el correo")
      }
    }

    verify()
  }, [token, verifyEmail])

  if (status === "loading") {
    return (
      <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-rose-500 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900">Verificando tu correo...</h2>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Correo Verificado</h2>
          <p className="text-gray-600 mb-6">
            Tu correo electrónico ha sido verificado exitosamente. Ya puedes iniciar sesión en tu cuenta.
          </p>
          <Link href="/login">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Iniciar Sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Verificación</h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <Link href="/registro">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Crear Nueva Cuenta</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <Suspense
          fallback={
            <Card className="max-w-md mx-auto border-rose-100 shadow-lg">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-12 w-12 text-rose-500 animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
              </CardContent>
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
