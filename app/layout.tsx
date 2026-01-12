import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { DynamicProductBackground } from "@/components/ui/dynamic-product-background"
import { AuthProvider } from "@/components/auth-provider"
import { CurrencyProvider } from "@/lib/currency-context"

import { Inter as V0_Font_Inter, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _inter = V0_Font_Inter({ subsets: ['latin'], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200", "300", "400", "500", "600", "700", "800", "900"] })

export const metadata: Metadata = {
  title: "Momentos Dulces - Tienda de Postres",
  description: "Los mejores postres artesanales entregados en tu puerta",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <DynamicProductBackground />
        <div className="relative z-10">
          <AuthProvider>
            <CurrencyProvider>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </CurrencyProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
