"use client"

import { useState, useEffect } from "react"
import { Filter, Tag, Sparkles, Clock, Star, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCartStore } from "@/lib/cart-store"
import { ProductCustomizationModal } from "@/components/product-customization-modal"
import { Header } from "@/components/header"
import { categoriesService, productsService } from "@/lib/api"
import type { Category, Product } from "@/lib/api"
import { Price } from "@/components/ui/price"

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [customizationModal, setCustomizationModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  })
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([categoriesService.getAll(), productsService.getAll()])
        setCategories([{ id: "all", name: "Todos", slug: "all", isActive: true }, ...categoriesData])
        setProducts(productsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((p) => p.category === selectedCategory)

  const handleProductClick = (product: Product) => {
    // Si el producto tiene personalizaciones, abrir el modal
    if (product.customizations && product.customizations.length > 0) {
      setCustomizationModal({ isOpen: true, product })
    } else if (product.variants && product.variants.length > 0) {
      setCustomizationModal({ isOpen: true, product })
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price || product.basePrice,
        image: product.image,
        discount: product.discount,
        isCombo: product.isCombo,
      })
    }
  }

  const handleAddCustomizedProduct = (product: Product, customizations: any, finalPrice: number) => {
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      customizations,
      discount: product.discount,
      isCombo: product.isCombo,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <Header />

      {/* Hero Section del Menú */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-8 w-8 text-rose-500" />
                <span className="text-rose-600 font-medium">Momentos Dulces</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Nuestro <span className="text-rose-500">Menú</span>
              </h1>
              <p className="text-lg text-gray-700 max-w-lg">
                Explora nuestra deliciosa selección de postres artesanales, hechos con amor para endulzar tus momentos
                especiales.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-gray-600">+500 clientes felices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-rose-400" />
                  <span className="text-sm text-gray-600">Entrega en 30-60 min</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Sparkles className="h-24 w-24 text-rose-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border-rose-100 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Categorías
                  </h2>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between group",
                          selectedCategory === category.slug
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                            : "bg-white text-gray-700 hover:bg-rose-50 border border-rose-100 hover:border-rose-200",
                        )}
                      >
                        <span>{category.name}</span>
                        {selectedCategory !== category.slug && (
                          <span className="text-xs text-gray-400 group-hover:text-rose-400">
                            {category.slug === "all"
                              ? products.length
                              : products.filter((p) => p.category === category.slug).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="mt-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800">¿Sabías qué?</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Puedes personalizar la mayoría de nuestros postres con tus ingredientes favoritos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white mb-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar por Categoría
            </Button>

            {mobileFilterOpen && (
              <Card className="border-rose-100 mb-4 shadow-lg">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.slug)
                          setMobileFilterOpen(false)
                        }}
                        className={cn(
                          "px-4 py-3 rounded-xl transition-all font-medium text-sm",
                          selectedCategory === category.slug
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                            : "bg-white text-gray-700 border border-rose-100",
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-600">
                  Mostrando <span className="font-bold text-rose-600">{filteredProducts.length}</span> productos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0
                const isLowStock = product.stock > 0 && product.stock <= 5
                const hasCustomizations =
                  (product.customizations && product.customizations.length > 0) ||
                  (product.variants && product.variants.length > 0)

                return (
                  <Card
                    key={product.id}
                    className={cn(
                      "group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl",
                      isOutOfStock ? "opacity-75" : "",
                    )}
                  >
                    <div className="relative overflow-hidden">
                      {/* Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        {product.discount && (
                          <Badge className="bg-green-500 text-white shadow-lg flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {product.discount}% OFF
                          </Badge>
                        )}
                        {product.isCombo && <Badge className="bg-purple-500 text-white shadow-lg">COMBO</Badge>}
                        {isLowStock && !isOutOfStock && (
                          <Badge className="bg-amber-500 text-white shadow-lg">¡Últimas unidades!</Badge>
                        )}
                        {isOutOfStock && <Badge className="bg-gray-700 text-white shadow-lg">Agotado</Badge>}
                      </div>

                      {/* Customizable badge */}
                      {hasCustomizations && !isOutOfStock && (
                        <Badge className="absolute top-3 right-3 z-10 bg-rose-500 text-white shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Personalizable
                        </Badge>
                      )}

                      {/* Image */}
                      <div
                        className={cn(
                          "relative aspect-square",
                          isOutOfStock && "after:absolute after:inset-0 after:bg-black/40",
                        )}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-500",
                            !isOutOfStock && "group-hover:scale-110",
                          )}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      {/* Category */}
                      <p className="text-xs font-medium text-rose-500 uppercase tracking-wide mb-1">
                        {product.categoryName || product.category}
                      </p>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                      )}

                      {/* Variants preview */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.variants.slice(0, 2).map((variant) => (
                            <span key={variant.id} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full">
                              {variant.type}: <Price value={variant.price} />
                            </span>
                          ))}
                          {product.variants.length > 2 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                              +{product.variants.length - 2} más
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Button */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            <Price value={product.price || product.basePrice || 0} />
                          </span>
                          {product.unit && <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>}
                        </div>
                        <Button
                          disabled={isOutOfStock}
                          size="sm"
                          className={cn(
                            "rounded-xl transition-all font-medium",
                            isOutOfStock
                              ? "bg-gray-300 cursor-not-allowed text-gray-500"
                              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300",
                          )}
                          onClick={() => !isOutOfStock && handleProductClick(product)}
                        >
                          {isOutOfStock ? "Agotado" : hasCustomizations ? "Personalizar" : "Añadir"}
                        </Button>
                      </div>

                      {/* Stock indicator */}
                      {!isOutOfStock && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Stock disponible</span>
                            <span className={cn(isLowStock ? "text-amber-600 font-medium" : "")}>
                              {product.stock} unidades
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                isLowStock ? "bg-amber-400" : "bg-green-400",
                              )}
                              style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-12 w-12 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
                <p className="text-gray-500">No encontramos productos en esta categoría.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-rose-400">Momentos Dulces</h3>
              <p className="text-gray-400">
                Los mejores postres artesanales, hechos con amor para endulzar tus momentos especiales.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/menu" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Menú
                  </a>
                </li>
                <li>
                  <a href="/nosotros" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Nosotros
                  </a>
                </li>
                <li>
                  <a href="/contacto" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">Instagram: @sweetmoments</p>
              <p className="text-gray-400">Tel: 0414.3169960</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Momentos Dulces. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {customizationModal.isOpen && customizationModal.product && (
        <ProductCustomizationModal
          product={customizationModal.product}
          isOpen={customizationModal.isOpen}
          onClose={() => setCustomizationModal({ isOpen: false, product: null })}
          onAddToCart={handleAddCustomizedProduct}
        />
      )}
    </div>
  )
}
