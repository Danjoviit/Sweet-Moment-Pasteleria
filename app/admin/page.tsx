"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Users, ShoppingBag, TrendingUp, Edit, Trash2, FolderOpen, Tag, MapPin, BarChart3, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { ordersService, productsService, usersService } from "@/lib/api/services"
import type { Order, Product, User } from "@/lib/api/types"
import { ExchangeRateManager } from "@/components/admin/exchange-rate-manager"
import { Price } from "@/components/ui/price"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const statusConfig = {
  recibido: { label: "Recibido", color: "bg-blue-500" },
  en_preparacion: { label: "En Preparación", color: "bg-amber-500" },
  listo: { label: "Listo", color: "bg-purple-500" },
  en_camino: { label: "En Camino", color: "bg-indigo-500" },
  entregado: { label: "Entregado", color: "bg-green-500" },
  cancelado: { label: "Cancelado", color: "bg-red-500" },
}

const adminMenuItems = [
  {
    title: "Productos",
    description: "Gestionar catálogo de postres",
    icon: Package,
    href: "/admin/productos",
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "Categorías",
    description: "Organizar categorías del menú",
    icon: FolderOpen,
    href: "/admin/categorias",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Promociones",
    description: "Descuentos y ofertas",
    icon: Tag,
    href: "/admin/promociones",
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Zonas de Delivery",
    description: "Configurar zonas y tarifas",
    icon: MapPin,
    href: "/admin/zonas",
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    href: "/admin/reportes",
    color: "bg-amber-100 text-amber-600",
  },
]

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore()
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [staff, setStaff] = useState<User[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, isHydrated])

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true)
        const allOrders = await ordersService.getAll()
        // Get last 10 orders (sorted by creation date, newest first)
        const last10 = allOrders.slice(-10).reverse()
        setOrders(last10)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      fetchOrders()
    }
  }, [isAuthenticated, user])

  // Fetch products for inventory
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const allProducts = await productsService.getAll()
        // Filter for low stock items (less than 10)
        setProducts(allProducts.filter(p => p.stock < 10))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchProducts()
    }
  }, [isAuthenticated, user])

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true)
        const users = await usersService.getAll()
        // Ensure users is an array before filtering
        const userArray = Array.isArray(users) ? users : []

        // Filter for staff only (admin or recepcionista roles)
        // Using includes for safer checking and normalization if needed
        const staffUsers = userArray.filter(u => {
          const role = (u.role || '').toLowerCase();
          return ['admin', 'recepcionista'].includes(role);
        })

        console.log("All users:", userArray.length, "Staff users:", staffUsers.length)
        setStaff(staffUsers)
      } catch (error) {
        console.error('Error fetching staff:', error)
      } finally {
        setLoadingStaff(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchStaff()
    }
  }, [isAuthenticated, user])

  // Staff Management State
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showDeleteStaffModal, setShowDeleteStaffModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "recepcionista",
    phone: "",
  })

  const resetStaffForm = () => {
    setStaffFormData({
      name: "",
      email: "",
      password: "",
      role: "recepcionista",
      phone: "",
    })
    setSelectedStaff(null)
  }

  const openStaffModal = (staffMember?: User) => {
    if (staffMember) {
      setSelectedStaff(staffMember)
      setStaffFormData({
        name: staffMember.name,
        email: staffMember.email,
        password: "", // Password not shown
        role: staffMember.role,
        phone: staffMember.phone || "",
      })
    } else {
      resetStaffForm()
    }
    setShowStaffModal(true)
  }

  const handleCreateStaff = async () => {
    try {
      if (!staffFormData.email || !staffFormData.password || !staffFormData.name) {
        alert("Por favor completa los campos requeridos")
        return
      }

      const newStaff = await usersService.create(staffFormData)
      setStaff([...staff, newStaff])
      setShowStaffModal(false)
      resetStaffForm()
    } catch (error) {
      console.error("Error creating staff:", error)
      alert("Error al crear personal")
    }
  }

  const handleEditStaff = async () => {
    if (!selectedStaff) return
    try {
      const dataToUpdate: any = { ...staffFormData }
      if (!dataToUpdate.password) delete dataToUpdate.password // Don't update password if empty

      const updatedStaff = await usersService.update(selectedStaff.id, dataToUpdate)
      setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s))
      setShowStaffModal(false)
      resetStaffForm()
    } catch (error) {
      console.error("Error updating staff:", error)
      alert("Error al actualizar personal")
    }
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return
    try {
      await usersService.delete(selectedStaff.id) // Assuming delete method exists on usersService
      setStaff(staff.filter(s => s.id !== selectedStaff.id))
      setShowDeleteStaffModal(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error("Error deleting staff:", error)
      // If delete is not implemented in service, just remove from state for now or show error
      alert("Error al eliminar personal")
    }
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

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="sticky top-0 z-50">
        <Header />
        <div className="bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-rose-600">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">Administrador</p>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent">
                  Ver Tienda
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pedidos Hoy</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ventas Hoy</p>
                    <p className="text-3xl font-bold text-gray-900"><Price value={456} /></p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Productos</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Personal Activo</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Acceso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {adminMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="border-rose-100 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orders">Pedidos Activos</TabsTrigger>
            <TabsTrigger value="inventory">Inventario Rápido</TabsTrigger>
            <TabsTrigger value="staff">Personal</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-rose-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Pedidos</CardTitle>
                <Link href="/admin/pedidos">
                  <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 bg-transparent">
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay pedidos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig]
                      return (
                        <Card key={order.id} className="border-rose-100">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">Pedido #{order.orderNumber}</h3>
                                    <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                                    <p className="text-sm text-gray-600">
                                      Fecha: {new Date(order.createdAt).toLocaleDateString("es-ES")}
                                    </p>
                                    <p className="text-sm text-gray-600">Zona: {order.deliveryZone || "Retiro en tienda"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-rose-600"><Price value={order.total} /></p>
                                    <p className="text-sm text-gray-600">{order.items.length} items</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <Label htmlFor={`status-${order.id}`} className="text-sm font-medium">
                                    Estado:
                                  </Label>
                                  <Select
                                    defaultValue={order.status}
                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                  >
                                    <SelectTrigger className="w-48 border-rose-200">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="recibido">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                                          Recibido
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="en_preparacion">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                                          En Preparación
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="listo">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                                          Listo
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="en_camino">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                          En Camino
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="entregado">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-green-500" />
                                          Entregado
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="cancelado">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-red-500" />
                                          Cancelado
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Badge className={cn("ml-auto", status.color, "text-white")}>{status.label}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-rose-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventario Rápido</CardTitle>
                <Link href="/admin/productos">
                  <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 bg-transparent">
                    Gestionar Productos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando inventario...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay productos con stock bajo</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-rose-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Producto</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoría</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Precio</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: Product) => (
                          <tr key={product.id} className="border-b border-rose-50 hover:bg-rose-50/50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{product.name}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{product.categoryName || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <span className="text-gray-900 font-medium"><Price value={product.basePrice} /></span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-900 font-medium">{product.stock}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={product.stock === 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                                {product.stock === 0 ? 'Agotado' : 'Bajo Stock'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card className="border-rose-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Control de Personal</CardTitle>
                <Button onClick={() => openStaffModal()} className="bg-rose-500 hover:bg-rose-600 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Nuevo Personal
                </Button>
              </CardHeader>
              <CardContent>
                {loadingStaff ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando personal...</p>
                  </div>
                ) : staff.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay personal registrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.map((member: User) => (
                      <Card key={member.id} className="border-rose-100">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.role}</p>
                              <p className="text-sm text-gray-600">{member.phone || 'Sin teléfono'}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Activo
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                              onClick={() => openStaffModal(member)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => {
                                setSelectedStaff(member)
                                setShowDeleteStaffModal(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExchangeRateManager />
              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle>Otras Configuraciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Próximamente: Configuración de impuestos, métodos de pago, y más.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Create/Edit Modal */}
      <Dialog open={showStaffModal} onOpenChange={(open) => {
        if (!open) resetStaffForm()
        setShowStaffModal(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStaff ? "Editar Personal" : "Nuevo Personal"}</DialogTitle>
            <DialogDescription>
              {selectedStaff ? "Modifica los datos del miembro del personal" : "Registra un nuevo miembro del equipo"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Nombre *</Label>
              <Input
                id="staff-name"
                value={staffFormData.name}
                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                disabled={!!selectedStaff}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">{selectedStaff ? "Nueva Contraseña (opcional)" : "Contraseña *"}</Label>
              <Input
                id="staff-password"
                type="password"
                value={staffFormData.password}
                onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                placeholder={selectedStaff ? "Dejar en blanco para mantener actual" : "******"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Teléfono</Label>
              <Input
                id="staff-phone"
                value={staffFormData.phone}
                onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                placeholder="+58 ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Rol *</Label>
              <Select
                value={staffFormData.role}
                onValueChange={(value: any) => setStaffFormData({ ...staffFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStaffModal(false)}>Cancelar</Button>
            <Button onClick={selectedStaff ? handleEditStaff : handleCreateStaff} className="bg-rose-500 hover:bg-rose-600">
              {selectedStaff ? "Guardar Cambios" : "Crear Personal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Delete Modal */}
      <Dialog open={showDeleteStaffModal} onOpenChange={setShowDeleteStaffModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Personal</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedStaff?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteStaffModal(false)}>Cancelar</Button>
            <Button onClick={handleDeleteStaff} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

