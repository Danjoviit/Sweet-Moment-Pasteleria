"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Header } from "@/components/header"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        // Obtener el usuario actual para redirigir según su rol
        const user = useAuthStore.getState().user
        switch (user?.role) {
          case "administrador":
            router.push("/admin")
            break
          case "recepcionista":
            router.push("/recepcionista")
            break
          case "usuario":
            router.push("/perfil")
            break
          default:
            router.push("/")
        }
      } else {
        setError(result.error || "Credenciales incorrectas. Intenta de nuevo.")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-rose-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-rose-200 focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/recuperar-password" className="text-xs text-rose-600 hover:text-rose-700">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-rose-200 focus:border-rose-500 pr-10"
                      required
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

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  <p className="font-medium mb-2">Credenciales de prueba:</p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Cliente:</span> usuario@momentosdulces.com
                    </p>
                    <p>
                      <span className="font-medium">Recepcionista:</span> recepcionista@momentosdulces.com
                    </p>
                    <p>
                      <span className="font-medium">Admin:</span> admin@momentosdulces.com
                    </p>
                    <p className="mt-2">
                      <span className="font-medium">Contraseña:</span> 123456
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro" className="text-rose-600 hover:text-rose-700 font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-rose-600">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
