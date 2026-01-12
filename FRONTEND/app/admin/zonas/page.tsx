"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Edit, Trash2, ArrowLeft, DollarSign } from "lucide-react"
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
import { deliveryZonesService } from "@/lib/api/services"
import type { DeliveryZone } from "@/lib/api/types"
import { Price } from "@/components/ui/price"

export default function DeliveryZonesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    deliveryCost: "",
    estimatedTime: "",
    isActive: true
  })

  // Auth Check
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, isHydrated])

  // Fetch Zones
  const fetchZones = async () => {
    try {
      setLoading(true)
      const data = await deliveryZonesService.getAll()
      setZones(data)
    } catch (error) {
      console.error("Error fetching delivery zones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchZones()
    }
  }, [isAuthenticated, user])

  const resetForm = () => {
    setFormData({
      name: "",
      deliveryCost: "",
      estimatedTime: "30-45 min",
      isActive: true
    })
    setSelectedZone(null)
  }

  const openModal = (zone?: DeliveryZone) => {
    if (zone) {
      setSelectedZone(zone)
      setFormData({
        name: zone.name,
        deliveryCost: zone.price.toString(),
        estimatedTime: zone.estimatedTime || "30-45 min",
        isActive: zone.isActive
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.deliveryCost || !formData.estimatedTime) {
        alert("Por favor completa los campos requeridos")
        return
      }

      const payload = {
        name: formData.name,
        estimatedTime: formData.estimatedTime,
        isActive: formData.isActive,
        price: parseFloat(formData.deliveryCost)
      }

      if (selectedZone) {
        await deliveryZonesService.update(parseInt(selectedZone.id), payload)
      } else {
        await deliveryZonesService.create(payload)
      }

      await fetchZones()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving delivery zone:", error)
      alert("Error al guardar la zona de delivery")
    }
  }

  const handleDelete = async () => {
    if (!selectedZone) return
    try {
      await deliveryZonesService.delete(parseInt(selectedZone.id))
      await fetchZones()
      setShowDeleteModal(false)
      setSelectedZone(null)
    } catch (error) {
      console.error("Error deleting delivery zone:", error)
      alert("Error al eliminar la zona de delivery")
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
              <h1 className="text-2xl font-bold text-gray-900">Zonas de Delivery</h1>
              <p className="text-gray-600">Configura las áreas y costos de envío</p>
            </div>
          </div>
          <Button onClick={() => openModal()} className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Zona
          </Button>
        </div>

        <Card className="border-rose-100">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando zonas...</p>
              </div>
            ) : zones.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay zonas configuradas</h3>
                <p className="text-gray-600 mt-1">Agrega las áreas donde realizas envíos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rose-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Zona</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Tiempo Estimado</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Costo de Envío</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Estado</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b border-rose-50 hover:bg-rose-50/50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{zone.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">{zone.estimatedTime}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            <Price value={zone.price} />
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={zone.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}>
                            {zone.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openModal(zone)}>
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedZone(zone)
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedZone ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
              <DialogDescription>Configura los detalles del área de entrega</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Zona *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Zona Norte, Centro, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCost">Costo ($) *</Label>
                  <Input
                    id="deliveryCost"
                    type="number"
                    value={formData.deliveryCost}
                    onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Tiempo Estimado *</Label>
                  <Input
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    placeholder="30-45 min"
                  />
                </div>
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
              <DialogTitle>Eliminar Zona de Delivery</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la zona "{selectedZone?.name}"? Esta acción no se puede deshacer.
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
