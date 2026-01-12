"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, ArrowLeft, FolderOpen } from "lucide-react"
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
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { categoriesService, productsService } from "@/lib/api/services"
import type { Category, Product } from "@/lib/api/types"

export default function AdminCategoriasPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) { router.push("/login")
      return
    }
    loadData()
  }, [isAuthenticated, user, router, isHydrated])

  const loadData = async () => {
    setIsLoading(true)
    const [categoriesData, productsData] = await Promise.all([categoriesService.getAll(), productsService.getAll()])
    setCategories(categoriesData)
    setProducts(productsData)
    setIsLoading(false)
  }

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.category === categoryId).length
  }

  const handleCreateCategory = async () => {
    const newCategory = await categoriesService.create({
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
    })
    setCategories([...categories, newCategory])
    setShowCreateModal(false)
    resetForm()
  }

  const handleEditCategory = async () => {
    if (!selectedCategory) return
    const updated = await categoriesService.update(selectedCategory.id, formData)
    setCategories(categories.map((c) => (c.id === selectedCategory.id ? updated : c)))
    setShowEditModal(false)
    resetForm()
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    await categoriesService.delete(selectedCategory.id)
    setCategories(categories.filter((c) => c.id !== selectedCategory.id))
    setShowDeleteModal(false)
    setSelectedCategory(null)
  }

  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true,
    })
    setSelectedCategory(null)
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
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
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
                <p className="text-sm text-gray-600">Organiza las categorías del menú</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="border-rose-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <Badge className={category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {category.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  {category.description && <p className="text-sm text-gray-600 mb-4">{category.description}</p>}

                  <div className="flex items-center justify-between pt-4 border-t border-rose-100">
                    <span className="text-sm text-gray-600">{getProductCount(category.id)} productos</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => openDeleteModal(category)}
                        disabled={getProductCount(category.id) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            <DialogTitle>{showEditModal ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {showEditModal ? "Modifica los datos de la categoría" : "Crea una nueva categoría para el menú"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                className="border-rose-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría"
                className="border-rose-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Categoría activa</Label>
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
              onClick={showEditModal ? handleEditCategory : handleCreateCategory}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {showEditModal ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              {getProductCount(selectedCategory?.id || "") > 0
                ? `No puedes eliminar "${selectedCategory?.name}" porque tiene productos asociados. Primero mueve o elimina los productos.`
                : `¿Estás seguro de que deseas eliminar "${selectedCategory?.name}"? Esta acción no se puede deshacer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300">
              Cancelar
            </Button>
            {getProductCount(selectedCategory?.id || "") === 0 && (
              <Button onClick={handleDeleteCategory} className="bg-red-500 hover:bg-red-600 text-white">
                Eliminar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



