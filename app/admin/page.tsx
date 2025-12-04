"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Users, ShoppingBag, TrendingUp, Edit, Trash2, FolderOpen, Tag, MapPin, BarChart3 } from "lucide-react"
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

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    customer: "Juan Pérez",
    date: "2025-01-10",
    status: "received",
    items: 3,
    total: 82.5,
    zone: "Zona 1",
  },
  {
    id: "ORD-002",
    customer: "María González",
    date: "2025-01-10",
    status: "preparing",
    items: 2,
    total: 67.5,
    zone: "Zona 2",
  },
  {
    id: "ORD-003",
    customer: "Carlos Rodríguez",
    date: "2025-01-10",
    status: "in-transit",
    items: 2,
    total: 73.0,
    zone: "Zona 1",
  },
]

const mockProducts = [
  { id: 1, name: "Torta de Chocolate", category: "Tortas", price: 45.0, stock: 8 },
  { id: 2, name: "Cheesecake de Fresa", category: "Tortas", price: 38.0, stock: 12 },
  { id: 3, name: "Galletas Artesanales", category: "Galletas", price: 15.0, stock: 25 },
  { id: 4, name: "Brownie Premium", category: "Brownies", price: 22.0, stock: 3 },
  { id: 5, name: "Torta Red Velvet", category: "Tortas", price: 48.0, stock: 0 },
  { id: 6, name: "Macarons Franceses", category: "Especiales", price: 28.0, stock: 20 },
]

const mockStaff = [
  { id: 1, name: "Ana Martínez", role: "Chef", status: "active", phone: "+58 424-111-1111" },
  { id: 2, name: "Pedro Sánchez", role: "Repartidor", status: "active", phone: "+58 424-222-2222" },
  { id: 3, name: "Laura Torres", role: "Asistente", status: "active", phone: "+58 424-333-3333" },
  { id: 4, name: "Miguel Díaz", role: "Repartidor", status: "inactive", phone: "+58 424-444-4444" },
]

const statusConfig = {
  received: { label: "Recibido", color: "bg-blue-500" },
  preparing: { label: "En Preparación", color: "bg-amber-500" },
  "in-transit": { label: "En Camino", color: "bg-purple-500" },
  delivered: { label: "Entregado", color: "bg-green-500" },
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
  const { user, isAuthenticated, logout } = useAuthStore()
  const [editingProduct, setEditingProduct] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "administrador") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "administrador") {
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
                    <p className="text-3xl font-bold text-gray-900">$456</p>
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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders">Pedidos Activos</TabsTrigger>
            <TabsTrigger value="inventory">Inventario Rápido</TabsTrigger>
            <TabsTrigger value="staff">Personal</TabsTrigger>
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
                <div className="space-y-4">
                  {mockOrders.map((order) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig]
                    return (
                      <Card key={order.id} className="border-rose-100">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">Pedido #{order.id}</h3>
                                  <p className="text-sm text-gray-600">Cliente: {order.customer}</p>
                                  <p className="text-sm text-gray-600">
                                    Fecha: {new Date(order.date).toLocaleDateString("es-ES")}
                                  </p>
                                  <p className="text-sm text-gray-600">Zona: {order.zone}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-rose-600">${order.total.toFixed(2)}</p>
                                  <p className="text-sm text-gray-600">{order.items} items</p>
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
                                    <SelectItem value="received">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        Recibido
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="preparing">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        En Preparación
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="in-transit">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        En Camino
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Entregado
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-rose-100">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Producto</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoría</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Precio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockProducts.map((product) => (
                        <tr key={product.id} className="border-b border-rose-50 hover:bg-rose-50/50">
                          <td className="py-3 px-4">
                            {editingProduct === product.id ? (
                              <Input defaultValue={product.name} className="border-rose-200" />
                            ) : (
                              <span className="font-medium text-gray-900">{product.name}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{product.category}</td>
                          <td className="py-3 px-4">
                            {editingProduct === product.id ? (
                              <Input
                                type="number"
                                defaultValue={product.price}
                                className="w-24 border-rose-200"
                                step="0.01"
                              />
                            ) : (
                              <span className="font-semibold text-rose-600">${product.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {editingProduct === product.id ? (
                              <Input type="number" defaultValue={product.stock} className="w-20 border-rose-200" />
                            ) : (
                              <span className="text-gray-900">{product.stock} unidades</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {product.stock === 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">Agotado</Badge>
                            ) : product.stock <= 5 ? (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200">Bajo Stock</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-200">Disponible</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editingProduct === product.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => setEditingProduct(null)}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 bg-transparent"
                                  onClick={() => setEditingProduct(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                                  onClick={() => setEditingProduct(product.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card className="border-rose-100">
              <CardHeader>
                <CardTitle>Control de Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockStaff.map((staff) => (
                    <Card key={staff.id} className="border-rose-100">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{staff.name}</h3>
                            <p className="text-sm text-gray-600">{staff.role}</p>
                            <p className="text-sm text-gray-600">{staff.phone}</p>
                          </div>
                          <Badge
                            className={cn(
                              staff.status === "active"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-700 border-gray-200",
                            )}
                          >
                            {staff.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
