"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Edit2, Trash2, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Header from "@/components/header"
import { useAuthStore, type UserAddress } from "@/lib/auth-store"
import { deliveryZonesService } from "@/lib/api/services"
import type { DeliveryZone } from "@/lib/api/types"

export default function DireccionesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, addAddress, updateAddress, deleteAddress } = useAuthStore()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    zone: "",
    isDefault: false,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/direcciones")
      return
    }

    const loadZones = async () => {
      try {
        const data = await deliveryZonesService.getAll()
        setZones(data)
      } catch (error) {
        console.error("Error loading zones:", error)
      } finally {
        setLoading(false)
      }
    }

    loadZones()
  }, [isAuthenticated, authLoading, router])

  const handleOpenDialog = (address?: UserAddress) => {
    if (address) {
      setSelectedAddress(address)
      setFormData({
        label: address.label,
        address: address.address,
        zone: address.zone,
        isDefault: address.isDefault,
      })
    } else {
      setSelectedAddress(null)
      setFormData({ label: "", address: "", zone: "", isDefault: false })
    }
    setDialogOpen(true)
  }

  const handleSaveAddress = async () => {
    if (!formData.label || !formData.address || !formData.zone) return

    if (selectedAddress) {
      await updateAddress(selectedAddress.id, formData)
    } else {
      await addAddress(formData)
    }
    setDialogOpen(false)
  }

  const handleDeleteAddress = async () => {
    if (selectedAddress) {
      await deleteAddress(selectedAddress.id)
      setDeleteDialogOpen(false)
      setSelectedAddress(null)
    }
  }

  const confirmDelete = (address: UserAddress) => {
    setSelectedAddress(address)
    setDeleteDialogOpen(true)
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

  const addresses = user?.addresses || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
              <p className="text-gray-600">Administra tus direcciones de entrega</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Dirección
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes direcciones guardadas</h2>
              <p className="text-gray-500 mb-6">Agrega una dirección para agilizar tus pedidos</p>
              <Button onClick={() => handleOpenDialog()} className="bg-rose-500 hover:bg-rose-600">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => {
              const zone = zones.find((z) => z.id === address.zone)
              return (
                <Card key={address.id} className={address.isDefault ? "border-rose-300 bg-rose-50/50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${address.isDefault ? "bg-rose-100" : "bg-gray-100"}`}>
                          <MapPin className={`h-5 w-5 ${address.isDefault ? "text-rose-600" : "text-gray-600"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{address.label}</h3>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                <Check className="h-3 w-3" />
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{address.address}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Zona: {zone?.name || address.zone} - Costo de envío: ${zone?.price ? Number(zone.price).toFixed(2) : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(address)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(address)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Dialog para crear/editar dirección */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAddress ? "Editar Dirección" : "Nueva Dirección"}</DialogTitle>
            <DialogDescription>
              {selectedAddress ? "Modifica los datos de tu dirección" : "Agrega una nueva dirección de entrega"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Etiqueta</Label>
              <Input
                id="label"
                placeholder="Ej: Casa, Oficina, etc."
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección completa</Label>
              <Input
                id="address"
                placeholder="Calle, número, referencias..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Zona de entrega</Label>
              <Select value={formData.zone} onValueChange={(value) => setFormData({ ...formData, zone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} - ${Number(zone.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isDefault">Establecer como predeterminada</Label>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="bg-rose-500 hover:bg-rose-600"
              disabled={!formData.label || !formData.address || !formData.zone}
            >
              {selectedAddress ? "Guardar Cambios" : "Agregar Dirección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La dirección "{selectedAddress?.label}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
