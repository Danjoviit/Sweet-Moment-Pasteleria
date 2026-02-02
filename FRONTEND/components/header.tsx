"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartSidebar } from "@/components/cart-sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useCartStore } from "@/lib/cart-store"
import { useAuthStore } from "@/lib/auth-store"

export function Header() {
  const [cartOpen, setCartOpen] = useState(false)
  const { getTotalItems } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  const getDashboardLink = () => {
    if (!user) return "/perfil"
    switch (user.role) {
      case "admin":
        return "/admin"
      case "recepcionista":
        return "/recepcionista"
      default:
        return "/perfil"
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/momentos-dulces-logo.png" alt="Momentos Dulces" className="h-25 w-auto" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {user?.role === "admin" || user?.role === "recepcionista" ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/recepcionista"} className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                    Panel de Control
                  </Link>
                  <Link href="/menu" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                    Menú
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/menu" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                    Menú
                  </Link>
                  <Link href="/nosotros" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                    Nosotros
                  </Link>
                  <Link href="/contacto" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                    Contacto
                  </Link>
                </>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user?.role === "usuario" && <NotificationsDropdown />}

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-rose-50"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-rose-500 text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-rose-50">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                        <span className="text-rose-600 font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={getDashboardLink()}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        {user.role === "usuario" ? "Mi Perfil" : "Panel de Control"}
                      </DropdownMenuItem>
                    </Link>
                    {user.role === "usuario" && (
                      <>
                        <Link href="/pedidos">
                          <DropdownMenuItem className="cursor-pointer">Mis Pedidos</DropdownMenuItem>
                        </Link>
                        <Link href="/favoritos">
                          <DropdownMenuItem className="cursor-pointer">Mis Favoritos</DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default Header
