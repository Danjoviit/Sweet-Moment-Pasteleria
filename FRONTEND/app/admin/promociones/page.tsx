"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tag, Plus, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"
import { promotionsService } from "@/lib/api/services"
import type { Promotion } from "@/lib/api/types"
import { format } from "date-fns"

export default function PromotionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    validFrom: "",
    validUntil: "",
    isActive: true
  })

  // Auth Check
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, isHydrated])

  // Fetch Promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const data = await promotionsService.getAll()
      setPromotions(data)
    } catch (error) {
      console.error("Error fetching promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchPromotions()
    }
  }, [isAuthenticated, user])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "0",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    })
    setSelectedPromo(null)
  }

  const openModal = (promo?: Promotion) => {
    if (promo) {
      setSelectedPromo(promo)
      setFormData({
        name: promo.name,
        description: promo.description || "",
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue.toString(),
        minPurchase: (promo.minPurchase || 0).toString(),
        validFrom: promo.validFrom.split('T')[0],
        validUntil: promo.validUntil.split('T')[0],
        isActive: promo.isActive
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
        alert("Por favor completa los campos requeridos")
        return
      }

      const payload: any = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString()
      }

      if (selectedPromo) {
        await promotionsService.update(selectedPromo.id, payload)
      } else {
        await promotionsService.create(payload)
      }

      await fetchPromotions()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving promotion:", error)
      alert("Error al guardar la promoción")
    }
  }

  const handleDelete = async () => {
    if (!selectedPromo) return
    try {
      await promotionsService.delete(selectedPromo.id)
      await fetchPromotions()
      setShowDeleteModal(false)
      setSelectedPromo(null)
    } catch (error) {
      console.error("Error deleting promotion:", error)
      alert("Error al eliminar la promoción")
    }
  }

  if (!isHydrated) return null

  return (
    <div className="min-h-screen bg-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
              <p className="text-gray-600">Gestiona los descuentos y cupones</p>
            </div>
          </div>
          <Button onClick={() => openModal()} className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </Button>
        </div>

        <Card className="border-rose-100">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando promociones...</p>
              </div>
            ) : promotions.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay promociones</h3>
                <p className="text-gray-600 mt-1">Crea la primera promoción para tus clientes</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rose-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Nombre</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Código</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Descuento</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Validez</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Estado</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((promo) => (
                      <tr key={promo.id} className="border-b border-rose-50 hover:bg-rose-50/50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{promo.name}</div>
                          {promo.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{promo.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                            {promo.code}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-rose-600">
                            {promo.discountType === 'percentage'
                              ? `${promo.discountValue}%`
                              : `$${promo.discountValue}`
                            }
                          </span>
                          {promo.minPurchase > 0 && (
                            <div className="text-xs text-gray-500">
                              Min: ${promo.minPurchase}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(promo.validUntil).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={promo.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}>
                            {promo.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openModal(promo)}>
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedPromo(promo)
                              setShowDeleteModal(true)
                            }}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPromo ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
              <DialogDescription>Configura los detalles del descuento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Estado</Label>
                  <Select
                    value={formData.isActive ? "true" : "false"}
                    onValueChange={(val) => setFormData({ ...formData, isActive: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activa</SelectItem>
                      <SelectItem value="false">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Descuento de Verano"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Aplica para todos los postres..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Tipo *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Valor *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPurchase">Compra Mínima ($)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido Desde *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido Hasta *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Promoción</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la promoción "{selectedPromo?.name}"? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
              <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
