"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, ArrowLeft, Tag, Percent, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { promotionsService } from "@/lib/api/services"
import type { Promotion } from "@/lib/api/types"

export default function AdminPromocionesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    code: "",
    validFrom: "",
    validUntil: "",
    minPurchase: 0,
    isActive: true,
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "administrador") {
      router.push("/login")
      return
    }
    loadData()
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    setIsLoading(true)
    const data = await promotionsService.getAll()
    setPromotions(data)
    setIsLoading(false)
  }

  const handleCreatePromotion = async () => {
    const newPromotion: Promotion = {
      id: Date.now(),
      ...formData,
      validFrom: formData.validFrom || new Date().toISOString(),
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    setPromotions([...promotions, newPromotion])
    setShowCreateModal(false)
    resetForm()
  }

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return
    const updated = { ...selectedPromotion, ...formData }
    setPromotions(promotions.map((p) => (p.id === selectedPromotion.id ? updated : p)))
    setShowEditModal(false)
    resetForm()
  }

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return
    setPromotions(promotions.filter((p) => p.id !== selectedPromotion.id))
    setShowDeleteModal(false)
    setSelectedPromotion(null)
  }

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      code: promotion.code || "",
      validFrom: promotion.validFrom.split("T")[0],
      validUntil: promotion.validUntil.split("T")[0],
      minPurchase: promotion.minPurchase || 0,
      isActive: promotion.isActive,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      code: "",
      validFrom: "",
      validUntil: "",
      minPurchase: 0,
      isActive: true,
    })
    setSelectedPromotion(null)
  }

  const isPromotionExpired = (promotion: Promotion) => {
    return new Date(promotion.validUntil) < new Date()
  }

  if (!isAuthenticated || user?.role !== "administrador") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="bg-white border-b border-rose-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Promociones y Descuentos</h1>
                <p className="text-sm text-gray-600">Gestiona ofertas especiales</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Promoción
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando promociones...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay promociones creadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion) => (
              <Card key={promotion.id} className="border-rose-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          promotion.discountType === "percentage" ? "bg-blue-100" : "bg-green-100"
                        }`}
                      >
                        {promotion.discountType === "percentage" ? (
                          <Percent className="h-6 w-6 text-blue-600" />
                        ) : (
                          <DollarSign className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{promotion.name}</h3>
                        <p className="text-lg font-semibold text-rose-600">
                          {promotion.discountType === "percentage"
                            ? `${promotion.discountValue}% OFF`
                            : `-$${promotion.discountValue}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        !promotion.isActive
                          ? "bg-gray-100 text-gray-700"
                          : isPromotionExpired(promotion)
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                      }
                    >
                      {!promotion.isActive ? "Inactiva" : isPromotionExpired(promotion) ? "Expirada" : "Activa"}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{promotion.description}</p>

                  {promotion.code && (
                    <div className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Código:</p>
                      <p className="font-mono font-bold text-gray-900">{promotion.code}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(promotion.validFrom).toLocaleDateString("es-ES")} -{" "}
                      {new Date(promotion.validUntil).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  {promotion.minPurchase && promotion.minPurchase > 0 && (
                    <p className="text-sm text-gray-500 mb-4">Compra mínima: ${promotion.minPurchase}</p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-rose-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                      onClick={() => openEditModal(promotion)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => openDeleteModal(promotion)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        open={showCreateModal || showEditModal}
        onOpenChange={() => {
          setShowCreateModal(false)
          setShowEditModal(false)
          resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showEditModal ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
            <DialogDescription>
              {showEditModal ? "Modifica los datos de la promoción" : "Crea una nueva promoción o descuento"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: 5 Cupcakes por $20"
                className="border-rose-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la promoción"
                className="border-rose-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Tipo de Descuento</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger className="border-rose-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Valor</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number.parseFloat(e.target.value) || 0 })}
                  className="border-rose-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código Promocional (opcional)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: DULCE20"
                className="border-rose-200 uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Válido Desde</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="border-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido Hasta</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="border-rose-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Compra Mínima ($)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number.parseFloat(e.target.value) || 0 })}
                  className="border-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span className="text-sm text-gray-600">{formData.isActive ? "Activa" : "Inactiva"}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false)
                setShowEditModal(false)
                resetForm()
              }}
              className="border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={showEditModal ? handleEditPromotion : handleCreatePromotion}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {showEditModal ? "Guardar Cambios" : "Crear Promoción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Promoción</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{selectedPromotion?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleDeletePromotion} className="bg-red-500 hover:bg-red-600 text-white">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
