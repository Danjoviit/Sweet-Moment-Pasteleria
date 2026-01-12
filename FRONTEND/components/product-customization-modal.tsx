"use client"

import { useState } from "react"
import { X, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  stock: number
  basePrice?: number
}

interface CustomizationModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, customizations: any, finalPrice: number) => void
}

export function ProductCustomizationModal({ product, isOpen, onClose, onAddToCart }: CustomizationModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [selectedFilling, setSelectedFilling] = useState<string>("")
  const [selectedGlaze, setSelectedGlaze] = useState<string>("")
  const [selectedDoughType, setSelectedDoughType] = useState<string>("")
  const [selectedPortion, setSelectedPortion] = useState<string>("")

  if (!isOpen) return null

  // Define customization options based on category
  const sizeOptions =
    product.category === "fresas"
      ? [
        { id: "small", name: "Pequeño", price: 0 },
        { id: "medium", name: "Mediano", price: 3 },
        { id: "large", name: "Grande", price: 6 },
      ]
      : []

  const toppingOptions =
    product.category === "fresas"
      ? [
        { id: "peanuts", name: "Maní", price: 1 },
        { id: "condensed", name: "Leche Condensada", price: 1.5 },
        { id: "granola", name: "Granola", price: 1 },
        { id: "cookies", name: "Galleta", price: 1.5 },
      ]
      : product.category === "donas"
        ? [
          { id: "coconut", name: "Coco", price: 0.5 },
          { id: "peanuts", name: "Maní", price: 0.5 },
          { id: "sprinkles", name: "Chispas", price: 0.5 },
        ]
        : []

  const glazeOptions =
    product.category === "donas"
      ? [
        { id: "chocolate", name: "Chocolate", price: 0 },
        { id: "vanilla", name: "Vainilla", price: 0 },
        { id: "strawberry", name: "Fresa", price: 0 },
        { id: "caramel", name: "Caramelo", price: 0.5 },
      ]
      : []

  const doughTypeOptions =
    product.category === "donas"
      ? [
        { id: "traditional", name: "Tradicional", price: 0 },
        { id: "filled", name: "Rellena", price: 1.5 },
      ]
      : []

  const portionOptions =
    product.category === "tortas"
      ? [
        { id: "slice", name: "Porción", price: 0 },
        { id: "whole", name: "Torta Completa", price: 35 },
      ]
      : []

  const fillingOptions =
    product.category === "tortas"
      ? [
        { id: "chocolate", name: "Chocolate", price: 0 },
        { id: "vanilla", name: "Vainilla", price: 0 },
        { id: "dulce", name: "Dulce de Leche", price: 2 },
        { id: "fruit", name: "Frutas", price: 2 },
      ]
      : []

  const coveringOptions =
    product.category === "tortas"
      ? [
        { id: "buttercream", name: "Buttercream", price: 0 },
        { id: "fondant", name: "Fondant", price: 5 },
        { id: "ganache", name: "Ganache", price: 3 },
      ]
      : []

  // Calculate final price
  const calculatePrice = () => {
    let price = Number(product.basePrice || product.price)

    // Add size price
    if (selectedSize) {
      const sizeOption = sizeOptions.find((s) => s.id === selectedSize)
      if (sizeOption) price += sizeOption.price
    }

    // Add toppings price
    selectedToppings.forEach((topping) => {
      const toppingOption = toppingOptions.find((t) => t.id === topping)
      if (toppingOption) price += toppingOption.price
    })

    // Add glaze price
    if (selectedGlaze) {
      const glazeOption = glazeOptions.find((g) => g.id === selectedGlaze)
      if (glazeOption) price += glazeOption.price
    }

    // Add dough type price
    if (selectedDoughType) {
      const doughOption = doughTypeOptions.find((d) => d.id === selectedDoughType)
      if (doughOption) price += doughOption.price
    }

    // Add portion price
    if (selectedPortion) {
      const portionOption = portionOptions.find((p) => p.id === selectedPortion)
      if (portionOption) price += portionOption.price
    }

    // Add filling price
    if (selectedFilling) {
      const fillingOption = fillingOptions.find((f) => f.id === selectedFilling)
      if (fillingOption) price += fillingOption.price
    }

    return price
  }

  const finalPrice = calculatePrice()

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((t) => t !== toppingId) : [...prev, toppingId],
    )
  }

  const handleAddToCart = () => {
    const customizations: any = {}

    if (selectedSize) customizations.size = selectedSize
    if (selectedToppings.length > 0) customizations.toppings = selectedToppings
    if (selectedFilling) customizations.filling = selectedFilling
    if (selectedGlaze) customizations.glaze = selectedGlaze
    if (selectedDoughType) customizations.doughType = selectedDoughType
    if (selectedPortion) customizations.portion = selectedPortion

    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, customizations, finalPrice)
    }
    onClose()
  }

  const hasRequiredSelections = () => {
    if (product.category === "fresas") return selectedSize !== ""
    if (product.category === "donas") return selectedDoughType !== "" && selectedGlaze !== ""
    if (product.category === "tortas") return selectedPortion !== "" && selectedFilling !== ""
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-rose-100">
        <div className="sticky top-0 bg-white border-b border-rose-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Personaliza tu {product.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-rose-50">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Product Image */}
          <div className="flex gap-4">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Precio base: ${Number(product.basePrice || product.price).toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="bg-rose-100" />

          {/* Size Selection (Fresas con Crema) */}
          {sizeOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Tamaño <span className="text-rose-500">*</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedSize === size.id ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{size.name}</div>
                    {size.price > 0 && <div className="text-xs text-gray-600">+${size.price.toFixed(2)}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dough Type (Donas) */}
          {doughTypeOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Tipo de Masa <span className="text-rose-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {doughTypeOptions.map((dough) => (
                  <button
                    key={dough.id}
                    onClick={() => setSelectedDoughType(dough.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedDoughType === dough.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{dough.name}</div>
                    {dough.price > 0 && <div className="text-xs text-gray-600">+${dough.price.toFixed(2)}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Glaze Selection (Donas) */}
          {glazeOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Glaseado <span className="text-rose-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {glazeOptions.map((glaze) => (
                  <button
                    key={glaze.id}
                    onClick={() => setSelectedGlaze(glaze.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedGlaze === glaze.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{glaze.name}</div>
                    {glaze.price > 0 && <div className="text-xs text-gray-600">+${glaze.price.toFixed(2)}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portion Selection (Tortas) */}
          {portionOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Porción <span className="text-rose-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {portionOptions.map((portion) => (
                  <button
                    key={portion.id}
                    onClick={() => setSelectedPortion(portion.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedPortion === portion.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{portion.name}</div>
                    {portion.price > 0 && <div className="text-xs text-gray-600">+${portion.price.toFixed(2)}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filling Selection (Tortas) */}
          {fillingOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Relleno <span className="text-rose-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {fillingOptions.map((filling) => (
                  <button
                    key={filling.id}
                    onClick={() => setSelectedFilling(filling.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedFilling === filling.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{filling.name}</div>
                    {filling.price > 0 && <div className="text-xs text-gray-600">+${filling.price.toFixed(2)}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toppings Selection */}
          {toppingOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Toppings (Opcional)</h3>
              <div className="grid grid-cols-2 gap-3">
                {toppingOptions.map((topping) => (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedToppings.includes(topping.id)
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300",
                    )}
                  >
                    <div className="font-medium">{topping.name}</div>
                    <div className="text-xs text-gray-600">+${topping.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-rose-100" />

          {/* Quantity Selector */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="border-rose-300"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="border-rose-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Precio Total:</span>
              <span className="text-2xl font-bold text-rose-600">${(finalPrice * quantity).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              ${finalPrice.toFixed(2)} × {quantity} unidad{quantity > 1 ? "es" : ""}
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            size="lg"
            onClick={handleAddToCart}
            disabled={!hasRequiredSelections()}
          >
            Añadir al Carrito
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
