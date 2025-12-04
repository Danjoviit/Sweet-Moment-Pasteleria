"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, ArrowLeft, MapPin, Clock } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { deliveryZonesService } from "@/lib/api/services"
import type { DeliveryZone } from "@/lib/api/types"

export default function AdminZonasPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    estimatedTime: "",
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
    const data = await deliveryZonesService.getAll()
    setZones(data)
    setIsLoading(false)
  }

  const handleCreateZone = () => {
    const newZone: DeliveryZone = {
      id: `zona-${Date.now()}`,
      ...formData,
    }
    setZones([...zones, newZone])
    setShowCreateModal(false)
    resetForm()
  }

  const handleEditZone = () => {
    if (!selectedZone) return
    const updated = { ...selectedZone, ...formData }
    setZones(zones.map((z) => (z.id === selectedZone.id ? updated : z)))
    setShowEditModal(false)
    resetForm()
  }

  const handleDeleteZone = () => {
    if (!selectedZone) return
    setZones(zones.filter((z) => z.id !== selectedZone.id))
    setShowDeleteModal(false)
    setSelectedZone(null)
  }

  const openEditModal = (zone: DeliveryZone) => {
    setSelectedZone(zone)
    setFormData({
      name: zone.name,
      price: zone.price,
      estimatedTime: zone.estimatedTime,
      isActive: zone.isActive,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (zone: DeliveryZone) => {
    setSelectedZone(zone)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      estimatedTime: "",
      isActive: true,
    })
    setSelectedZone(null)
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
                <h1 className="text-2xl font-bold text-gray-900">Zonas de Delivery</h1>
                <p className="text-sm text-gray-600">Configura las zonas y tarifas de envío</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Zona
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando zonas...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay zonas de delivery configuradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="border-rose-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{zone.name}</h3>
                        <p className="text-2xl font-bold text-rose-600">${zone.price}</p>
                      </div>
                    </div>
                    <Badge className={zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {zone.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Tiempo estimado: {zone.estimatedTime}</span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-rose-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                      onClick={() => openEditModal(zone)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => openDeleteModal(zone)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditModal ? "Editar Zona" : "Nueva Zona de Delivery"}</DialogTitle>
            <DialogDescription>
              {showEditModal ? "Modifica los datos de la zona" : "Configura una nueva zona de cobertura"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Zona *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Centro, Norte, Zona Industrial"
                className="border-rose-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Costo de Envío ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                  className="border-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tiempo Estimado *</Label>
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="Ej: 20-30 min"
                  className="border-rose-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Zona activa</Label>
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
              onClick={showEditModal ? handleEditZone : handleCreateZone}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {showEditModal ? "Guardar Cambios" : "Crear Zona"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Zona</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la zona "{selectedZone?.name}"? Los pedidos existentes no se verán
              afectados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleDeleteZone} className="bg-red-500 hover:bg-red-600 text-white">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
