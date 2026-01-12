"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCartStore } from "@/lib/cart-store"
import { Header } from "@/components/header"

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false)
  const { addItem, getTotalItems } = useCartStore()

  const featuredProducts = [
    {
      id: 1,
      name: "Torta de Chocolate",
      price: 45.0,
      image: "/delicious-chocolate-cake-with-frosting.jpg",
      badge: "¡Popular!",
    },
    {
      id: 2,
      name: "Cheesecake de Fresa",
      price: 38.0,
      image: "/strawberry-cheesecake.png",
      badge: "Nuevo",
    },
    {
      id: 3,
      name: "Galletas Artesanales",
      price: 15.0,
      image: "/artisan-cookies-assortment.jpg",
      badge: null,
    },
    {
      id: 4,
      name: "Brownie Premium",
      price: 22.0,
      image: "/premium-chocolate-brownie-with-nuts.jpg",
      badge: "¡Popular!",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-pink-100/50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/beautiful-assorted-desserts-and-pastries-display.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Sweet Moments: Tus postres favoritos a un clic de distancia
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 text-pretty">
              Ordena en línea y recibe la dulzura en tu puerta
            </p>
            <Link href="/menu">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Ver Menú Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Favoritos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre los postres más populares que nuestros clientes aman
            </p>
            <div className="mt-8">
              <Button
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = "/catalogo-momentos-dulces.pdf"
                  link.download = "Catalogo-Momentos-Dulces.pdf"
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
              >
                Descargar Catálogo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-rose-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  {product.badge && (
                    <Badge className="absolute top-3 right-3 z-10 bg-rose-500 text-white">{product.badge}</Badge>
                  )}
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-rose-600">${Number(product.price).toFixed(2)}</span>
                    <Button className="bg-rose-500 hover:bg-rose-600 text-white" onClick={() => addItem(product)}>
                      Añadir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-rose-400">Sweet Moments</h3>
              <p className="text-gray-400">
                Los mejores postres artesanales, hechos con amor y entregados en tu puerta.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/menu" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Menú
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">Email: info@sweetmoments.com</p>
              <p className="text-gray-400">Tel: +58 424-123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sweet Moments. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
