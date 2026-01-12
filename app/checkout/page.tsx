"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, CreditCard, Smartphone, DollarSign, MapPin, Check, Store, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { useAuthStore } from "@/lib/auth-store"
import { ordersService } from "@/lib/api/services"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Price } from "@/components/ui/price"

const deliveryZones = [
  { id: "zona1", name: "Zona 1 - Centro", cost: 5.0, estimatedTime: "30-45 min" },
  { id: "zona2", name: "Zona 2 - Norte", cost: 7.5, estimatedTime: "45-60 min" },
  { id: "zona3", name: "Zona 3 - Sur", cost: 7.5, estimatedTime: "45-60 min" },
  { id: "zona4", name: "Zona 4 - Este", cost: 10.0, estimatedTime: "60-75 min" },
  { id: "zona5", name: "Zona 5 - Oeste", cost: 10.0, estimatedTime: "60-75 min" },
]

const pickupTimes = [
  { id: "5min", name: "5 minutos", minutes: 5 },
  { id: "10min", name: "10 minutos", minutes: 10 },
  { id: "15min", name: "15 minutos", minutes: 15 },
  { id: "20min", name: "20 minutos", minutes: 20 },
  { id: "30min", name: "30 minutos", minutes: 30 },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, getTotalItems } = useCartStore()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const [step, setStep] = useState(1)
  const [deliveryZone, setDeliveryZone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery")
  const [pickupTime, setPickupTime] = useState("")

  // Check authentication
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/checkout")
    }
  }, [isHydrated, isAuthenticated, router])

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    reference: "",
  })

  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  })

  const selectedZone = deliveryZones.find((z) => z.id === deliveryZone)
  const selectedPickupTime = pickupTimes.find((t) => t.id === pickupTime)
  const deliveryCost = deliveryType === "delivery" ? selectedZone?.cost || 0 : 0
  const subtotal = getTotalPrice()
  const total = subtotal + deliveryCost

  const handleConfirmOrder = async () => {
    setIsProcessing(true)
    try {
      // Mapear método de pago al formato del backend
      const paymentMethodMap = {
        card: "tarjeta",
        mobile: "pago_movil",
        cash: "efectivo",
      } as const

      // Crear pedido
      const orderData = {
        userId: user?.id,
        customerName: deliveryInfo.name,
        customerEmail: user?.email || "",
        customerPhone: deliveryInfo.phone,
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image || "",
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          customizations: item.customizations,
        })),
        subtotal: subtotal,
        deliveryCost: deliveryCost,
        total: total,
        deliveryType: deliveryType,
        deliveryAddress: deliveryType === "delivery" ? deliveryInfo.address : undefined,
        deliveryZone: deliveryType === "delivery" ? selectedZone?.name : undefined,
        pickupTime: deliveryType === "pickup" ? selectedPickupTime?.name : undefined,
        paymentMethod: paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap],
        notes: deliveryInfo.reference || undefined,
      }

      await ordersService.create(orderData)
      clearCart()
      router.push("/order-success")
    } catch (error) {
      console.error("Error al crear pedido:", error)
      alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Header />

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center border-rose-100">
            <CardContent className="p-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega algunos postres antes de proceder al checkout</p>
              <Link href="/menu">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white">Ver Menú</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <Header />

      {/* Progress Steps */}
      <div className="bg-white border-b border-rose-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                  step >= 1 ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500",
                )}
              >
                {step > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <span className={cn("font-medium", step >= 1 ? "text-rose-600" : "text-gray-500")}>Entrega</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                  step >= 2 ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500",
                )}
              >
                {step > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <span className={cn("font-medium", step >= 2 ? "text-rose-600" : "text-gray-500")}>Pago</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                  step >= 3 ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500",
                )}
              >
                3
              </div>
              <span className={cn("font-medium", step >= 3 ? "text-rose-600" : "text-gray-500")}>Confirmar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="h-6 w-6 text-rose-500" />
                    Información de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Tipo de Entrega</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("delivery")}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                          deliveryType === "delivery"
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-300",
                        )}
                      >
                        <MapPin className="h-5 w-5 text-rose-500" />
                        <div className="text-left">
                          <div className="font-medium">Delivery</div>
                          <div className="text-xs text-gray-600">Entrega a domicilio</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setDeliveryType("pickup")}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                          deliveryType === "pickup"
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-300",
                        )}
                      >
                        <Store className="h-5 w-5 text-rose-500" />
                        <div className="text-left">
                          <div className="font-medium">Retiro en Tienda</div>
                          <div className="text-xs text-gray-600">Sin costo de envío</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      value={deliveryInfo.name}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                      className="border-rose-200 focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+58 424-123-4567"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                      className="border-rose-200 focus:border-rose-500"
                    />
                  </div>

                  {deliveryType === "delivery" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          placeholder="Calle Principal, Edificio, Piso, Apartamento"
                          value={deliveryInfo.address}
                          onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                          className="border-rose-200 focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reference">Referencia (Opcional)</Label>
                        <Input
                          id="reference"
                          placeholder="Cerca del supermercado, portón azul"
                          value={deliveryInfo.reference}
                          onChange={(e) => setDeliveryInfo({ ...deliveryInfo, reference: e.target.value })}
                          className="border-rose-200 focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zone">Zona de Entrega</Label>
                        <Select value={deliveryZone} onValueChange={setDeliveryZone}>
                          <SelectTrigger className="border-rose-200 focus:border-rose-500">
                            <SelectValue placeholder="Selecciona tu zona" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryZones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name} - <Price value={zone.cost} showSymbol={true} /> ({zone.estimatedTime})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {deliveryType === "pickup" && (
                    <div className="space-y-2">
                      <Label htmlFor="pickupTime" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-rose-500" />
                        Tiempo de Espera Estimado
                      </Label>
                      <Select value={pickupTime} onValueChange={setPickupTime}>
                        <SelectTrigger className="border-rose-200 focus:border-rose-500">
                          <SelectValue placeholder="Selecciona el tiempo de espera" />
                        </SelectTrigger>
                        <SelectContent>
                          {pickupTimes.map((time) => (
                            <SelectItem key={time.id} value={time.id}>
                              {time.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Tu pedido estará listo para retirar en la tienda en el tiempo seleccionado
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white mt-6"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={
                      !deliveryInfo.name ||
                      !deliveryInfo.phone ||
                      (deliveryType === "delivery" && (!deliveryInfo.address || !deliveryZone)) ||
                      (deliveryType === "pickup" && !pickupTime)
                    }
                  >
                    Continuar al Pago
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CreditCard className="h-6 w-6 text-rose-500" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          paymentMethod === "card"
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-300",
                        )}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 text-rose-500" />
                          <span className="font-medium">Tarjeta de Crédito/Débito</span>
                        </Label>
                      </div>

                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          paymentMethod === "mobile"
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-300",
                        )}
                        onClick={() => setPaymentMethod("mobile")}
                      >
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Smartphone className="h-5 w-5 text-rose-500" />
                          <span className="font-medium">Pago Móvil</span>
                        </Label>
                      </div>

                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          paymentMethod === "cash"
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-rose-300",
                        )}
                        onClick={() => setPaymentMethod("cash")}
                      >
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                          <DollarSign className="h-5 w-5 text-rose-500" />
                          <span className="font-medium">Dólares en Efectivo</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Card Payment Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t border-rose-100">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                          className="border-rose-200 focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                        <Input
                          id="cardName"
                          placeholder="JUAN PEREZ"
                          value={cardInfo.name}
                          onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                          className="border-rose-200 focus:border-rose-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Fecha de Vencimiento</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                            className="border-rose-200 focus:border-rose-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                            className="border-rose-200 focus:border-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Payment Info */}
                  {paymentMethod === "mobile" && (
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Datos para Pago Móvil:</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Banco:</span> Banco Provincial
                        </p>
                        <p>
                          <span className="font-medium">Teléfono:</span> 0424-1234567
                        </p>
                        <p>
                          <span className="font-medium">Cédula:</span> V-12345678
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Realiza el pago y envía el comprobante al momento de la entrega
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cash Payment Info */}
                  {paymentMethod === "cash" && (
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Pago en Efectivo:</h4>
                      <p className="text-sm text-gray-700">
                        {deliveryType === "delivery"
                          ? "El pago se realizará en dólares al momento de la entrega. Por favor, ten el monto exacto disponible."
                          : "El pago se realizará en dólares al retirar tu pedido en la tienda. Por favor, ten el monto exacto disponible."}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1 border-rose-300 bg-transparent"
                      onClick={() => setStep(1)}
                    >
                      Volver
                    </Button>
                    <Button
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                      onClick={() => setStep(3)}
                      disabled={!paymentMethod}
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="text-2xl">Confirmar Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {deliveryType === "delivery" ? (
                        <MapPin className="h-5 w-5 text-rose-500" />
                      ) : (
                        <Store className="h-5 w-5 text-rose-500" />
                      )}
                      Información de {deliveryType === "delivery" ? "Entrega" : "Retiro"}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Nombre:</span> {deliveryInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">Teléfono:</span> {deliveryInfo.phone}
                      </p>
                      {deliveryType === "delivery" ? (
                        <>
                          <p>
                            <span className="font-medium">Dirección:</span> {deliveryInfo.address}
                          </p>
                          {deliveryInfo.reference && (
                            <p>
                              <span className="font-medium">Referencia:</span> {deliveryInfo.reference}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Zona:</span> {selectedZone?.name}
                          </p>
                          <p>
                            <span className="font-medium">Tiempo estimado:</span> {selectedZone?.estimatedTime}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <span className="font-medium">Tipo:</span> Retiro en Tienda
                          </p>
                          <p>
                            <span className="font-medium">Tiempo de espera:</span> {selectedPickupTime?.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Dirección de la tienda: Calle Principal, Centro Comercial Plaza, Local 15
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-rose-500" />
                      Método de Pago
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      {paymentMethod === "card" && <p>Tarjeta de Crédito/Débito</p>}
                      {paymentMethod === "mobile" && <p>Pago Móvil</p>}
                      {paymentMethod === "cash" && <p>Dólares en Efectivo</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-rose-300 bg-transparent"
                      onClick={() => setStep(2)}
                    >
                      Volver
                    </Button>
                    <Button
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                      size="lg"
                      onClick={handleConfirmOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Procesando..." : "Confirmar Pedido"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-rose-100 sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                        {item.customizations && (
                          <div className="text-xs text-gray-600 mt-1">
                            {item.customizations.size && <p>Tamaño: {item.customizations.size}</p>}
                            {item.customizations.portion && <p>Porción: {item.customizations.portion}</p>}
                            {item.customizations.doughType && <p>Masa: {item.customizations.doughType}</p>}
                            {item.customizations.glaze && <p>Glaseado: {item.customizations.glaze}</p>}
                            {item.customizations.filling && <p>Relleno: {item.customizations.filling}</p>}
                            {item.customizations.toppings && item.customizations.toppings.length > 0 && (
                              <p>Toppings: {item.customizations.toppings.join(", ")}</p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-semibold text-rose-600">
                          <Price value={Number(item.price) * item.quantity} />
                          {item.discount && <span className="text-xs text-green-600 ml-1">({item.discount}% OFF)</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-rose-100" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium"><Price value={subtotal} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{deliveryType === "delivery" ? "Envío" : "Retiro en Tienda"}</span>
                    <span className="font-medium">
                      {deliveryType === "delivery" ? <Price value={deliveryCost} /> : "Gratis"}
                    </span>
                  </div>
                </div>

                <Separator className="bg-rose-100" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-rose-600"><Price value={total} /></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
