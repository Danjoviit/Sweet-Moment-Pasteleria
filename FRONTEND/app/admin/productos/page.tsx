"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Search, ArrowLeft, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { productsService, categoriesService } from "@/lib/api/services"
import type { Product, Category } from "@/lib/api/types"

export default function AdminProductosPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    basePrice: 0,
    stock: 0,
    isActive: true,
    image: "/postre.jpg",
  })

  const [variants, setVariants] = useState<Array<{ type: string; price: number; unit?: string }>>([])

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
      return
    }
    loadData()
  }, [isAuthenticated, user, router, isHydrated])

  const loadData = async () => {
    setIsLoading(true)
    const [productsData, categoriesData] = await Promise.all([productsService.getAll(), categoriesService.getAll()])
    setProducts(productsData)
    setCategories(categoriesData)
    setIsLoading(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateProduct = async () => {
    // Find category slug from category ID
    const selectedCategory = categories.find(cat => cat.id === formData.category)
    if (!selectedCategory) {
      alert('Por favor selecciona una categoría válida')
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('category', selectedCategory.slug) // Send slug, not ID
    formDataToSend.append('basePrice', formData.basePrice.toString())
    formDataToSend.append('stock', formData.stock.toString())
    formDataToSend.append('isActive', formData.isActive.toString())

    // Only append variants if there are any
    if (variants.length > 0) {
      formDataToSend.append('variants', JSON.stringify(variants))
    }

    if (imageFile) {
      formDataToSend.append('image', imageFile)
    }

    try {
      const newProduct = await productsService.create(formDataToSend as any)
      setProducts([...products, newProduct])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating product:', error)
      alert(`Error al crear producto: ${error}`)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    // Find category slug from category ID
    const selectedCategory = categories.find(cat => cat.id === formData.category)
    if (!selectedCategory) {
      alert('Por favor selecciona una categoría válida')
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('category', selectedCategory.slug) // Send slug, not ID
    formDataToSend.append('basePrice', formData.basePrice.toString())
    formDataToSend.append('stock', formData.stock.toString())
    formDataToSend.append('isActive', formData.isActive.toString())
    if (imageFile) {
      formDataToSend.append('image', imageFile)
    }

    const updated = await productsService.update(selectedProduct.id, formDataToSend as any)
    setProducts(products.map((p) => (p.id === selectedProduct.id ? updated : p)))
    setShowEditModal(false)
    resetForm()
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    await productsService.delete(selectedProduct.id)
    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setShowDeleteModal(false)
    setSelectedProduct(null)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      basePrice: product.basePrice,
      stock: product.stock,
      isActive: product.isActive,
      image: product.image,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      category: "",
      basePrice: 0,
      stock: 0,
      isActive: true,
      image: "/postre.jpg",
    })
    setVariants([])
    setImageFile(null)
    setSelectedProduct(null)
  }

  const addVariant = () => {
    setVariants([...variants, { type: "", price: 0, unit: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
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

      {/* Admin Sub-header */}
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
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
                <p className="text-sm text-gray-600">Administra el catálogo de postres</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card className="border-rose-100 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-rose-200"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border-rose-200">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-rose-100 overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-gray-800 text-white">Inactivo</Badge>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">Agotado</Badge>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Bajo Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.categoryName}</p>
                    </div>
                    <p className="text-lg font-bold text-rose-600">${product.basePrice}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{product.stock} en stock</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => openDeleteModal(product)}
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

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron productos</p>
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
            <DialogTitle>{showEditModal ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {showEditModal ? "Modifica los datos del producto" : "Completa los datos para crear un nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                className="border-rose-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
                className="border-rose-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-rose-200">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio Base ($) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number.parseFloat(e.target.value) || 0 })}
                  className="border-rose-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                  className="border-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span className="text-sm text-gray-600">{formData.isActive ? "Activo" : "Inactivo"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen del Producto</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                  }
                }}
                className="border-rose-200"
              />
              {imageFile && <p className="text-xs text-gray-600">Archivo seleccionado: {imageFile.name}</p>}
            </div>

            {/* Sección de Variantes */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Variantes (Opcional)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addVariant}
                  className="border-rose-300 text-rose-600 hover:bg-rose-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Variante
                </Button>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Tipo (ej: Completa)"
                      value={variant.type}
                      onChange={(e) => updateVariant(index, 'type', e.target.value)}
                      className="border-rose-200"
                    />
                    <Input
                      type="number"
                      placeholder="Precio"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      className="border-rose-200"
                      step="0.01"
                    />
                    <Input
                      placeholder="Unidad (Opcional)"
                      value={variant.unit || ''}
                      onChange={(e) => updateVariant(index, 'unit', e.target.value)}
                      className="border-rose-200"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeVariant(index)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-xs text-gray-500 italic">No hay variantes agregadas</p>
              )}
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
              onClick={showEditModal ? handleEditProduct : handleCreateProduct}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {showEditModal ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{selectedProduct?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600 text-white">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

