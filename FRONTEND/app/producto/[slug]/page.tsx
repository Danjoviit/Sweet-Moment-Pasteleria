"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart, Share2, Star, Clock, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"
import { useCartStore } from "@/lib/cart-store"
import { productsService } from "@/lib/api"
import type { Product } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | string[]>>({})
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productsService.getBySlug(params.slug as string)
        if (data) {
          setProduct(data)
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.slug])

  const calculatePrice = () => {
    if (!product) return 0

    let price = product.price || product.basePrice

    // Si hay variante seleccionada
    if (selectedVariant && product.variants) {
      const variant = product.variants.find((v) => v.id === selectedVariant)
      if (variant) price = variant.price
    }

    // Agregar modificadores de personalización
    if (product.customizations) {
      product.customizations.forEach((customization) => {
        const selected = selectedCustomizations[customization.id]
        if (selected) {
          if (Array.isArray(selected)) {
            selected.forEach((optionId) => {
              const option = customization.options.find((o) => o.id === optionId)
              if (option) price += option.priceModifier
            })
          } else {
            const option = customization.options.find((o) => o.id === selected)
            if (option) price += option.priceModifier
          }
        }
      })
    }

    return price * quantity
  }

  const handleAddToCart = () => {
    if (!product) return

    const finalPrice = calculatePrice() / quantity

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      customizations: selectedCustomizations,
    })

    router.push("/menu")
  }

  const handleCustomizationChange = (customizationId: string, value: string, isMultiple: boolean) => {
    setSelectedCustomizations((prev) => {
      if (isMultiple) {
        const current = (prev[customizationId] as string[]) || []
        const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
        return { ...prev, [customizationId]: updated }
      }
      return { ...prev, [customizationId]: value }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Button onClick={() => router.push("/menu")} className="bg-rose-500 hover:bg-rose-600 text-white">
            Volver al Menú
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className={cn("rounded-full bg-white/80 backdrop-blur", isFavorite && "text-red-500")}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount && <Badge className="bg-green-500 text-white">{product.discount}% OFF</Badge>}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge className="bg-amber-500 text-white">¡Últimas unidades!</Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-rose-500 font-medium mb-2">{product.categoryName}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              {product.description && <p className="text-gray-600 text-lg">{product.description}</p>}
            </div>

            {/* Rating & Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-gray-600 ml-2">(24 reseñas)</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-500" />
                Preparación: 15-20 min
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-rose-500" />
                Delivery disponible
              </span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <Card className="border-rose-100">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Selecciona una opción</h3>
                  <RadioGroup
                    value={selectedVariant?.toString()}
                    onValueChange={(value) => setSelectedVariant(Number.parseInt(value))}
                    className="space-y-2"
                  >
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                          selectedVariant === variant.id
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-200",
                        )}
                        onClick={() => setSelectedVariant(variant.id)}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={variant.id.toString()} id={`variant-${variant.id}`} />
                          <Label htmlFor={`variant-${variant.id}`} className="cursor-pointer font-medium">
                            {variant.type}
                          </Label>
                        </div>
                        <span className="font-bold text-rose-600">${Number(variant.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Customizations */}
            {product.customizations && product.customizations.length > 0 && (
              <div className="space-y-4">
                {product.customizations.map((customization) => (
                  <Card key={customization.id} className="border-rose-100">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{customization.name}</h3>
                      {customization.type === "topping" ? (
                        // Multiple selection for toppings
                        <div className="grid grid-cols-2 gap-2">
                          {customization.options.map((option) => {
                            const isSelected = ((selectedCustomizations[customization.id] as string[]) || []).includes(
                              option.id,
                            )
                            return (
                              <div
                                key={option.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                                  isSelected ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-rose-200",
                                )}
                                onClick={() => handleCustomizationChange(customization.id, option.id, true)}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox checked={isSelected} />
                                  <span className="text-sm">{option.name}</span>
                                </div>
                                {option.priceModifier > 0 && (
                                  <span className="text-xs text-rose-600">+${option.priceModifier}</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        // Single selection
                        <RadioGroup
                          value={(selectedCustomizations[customization.id] as string) || ""}
                          onValueChange={(value) => handleCustomizationChange(customization.id, value, false)}
                          className="grid grid-cols-2 gap-2"
                        >
                          {customization.options.map((option) => (
                            <div
                              key={option.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                                selectedCustomizations[customization.id] === option.id
                                  ? "border-rose-500 bg-rose-50"
                                  : "border-gray-200 hover:border-rose-200",
                              )}
                              onClick={() => handleCustomizationChange(customization.id, option.id, false)}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={option.id} id={`${customization.id}-${option.id}`} />
                                <Label htmlFor={`${customization.id}-${option.id}`} className="cursor-pointer text-sm">
                                  {option.name}
                                </Label>
                              </div>
                              {option.priceModifier > 0 && (
                                <span className="text-xs text-rose-600">+${option.priceModifier}</span>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="rounded-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-lg font-semibold shadow-lg shadow-rose-200"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar - ${calculatePrice().toFixed(2)}
              </Button>
            </div>

            {/* Stock Info */}
            <p className="text-sm text-gray-500">
              Stock disponible:{" "}
              <span className={cn(product.stock <= 5 ? "text-amber-600 font-medium" : "")}>
                {product.stock} unidades
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
