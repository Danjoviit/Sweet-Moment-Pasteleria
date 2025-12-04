"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import { useAuthStore } from "@/lib/auth-store"
import { useCartStore } from "@/lib/cart-store"
import { productsService } from "@/lib/api/services"
import type { Product } from "@/lib/api/types"

export default function FavoritosPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, toggleFavorite } = useAuthStore()
  const { addItem } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/favoritos")
      return
    }

    const loadFavorites = async () => {
      if (!user?.favorites?.length) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        const allProducts = await productsService.getAll()
        const favoriteProducts = allProducts.filter((p) => user.favorites?.includes(p.id))
        setProducts(favoriteProducts)
      } catch (error) {
        console.error("Error loading favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user) {
      loadFavorites()
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleRemoveFavorite = async (productId: number) => {
    await toggleFavorite(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || product.basePrice,
      image: product.image,
      quantity: 1,
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes favoritos aún</h2>
              <p className="text-gray-500 mb-6">Explora nuestro menú y guarda los productos que más te gusten</p>
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/menu">Ver Menú</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount && <Badge className="absolute top-2 left-2 bg-red-500">-{product.discount}%</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => handleRemoveFavorite(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/producto/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-rose-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      {product.discount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-rose-600">
                            ${((product.price || product.basePrice) * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ${(product.price || product.basePrice).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-rose-600">
                          ${(product.price || product.basePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-rose-500 hover:bg-rose-600"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
