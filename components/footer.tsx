import Link from "next/link"
import { Phone, Mail, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/momentos-dulces-logo.png" alt="Momentos Dulces" className="h-16 w-16 object-contain" />
              <div>
                <h3 className="text-xl font-bold text-rose-400">Momentos Dulces</h3>
                <p className="text-sm text-gray-400">Tienda de Postres</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-md">
              Somos una repostería nacida del corazón, con la ilusión de llevar felicidad en cada bocado. Endulza el día
              de quienes siempre te regalan momentos dulces.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Menú
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/pedidos" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Mis Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Instagram className="h-4 w-4 text-rose-400" />
                @sweetmoments
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-rose-400" />
                0414.3169960
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-rose-400" />
                info@momentosdulces.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">&copy; 2025 Momentos Dulces. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/terminos" className="text-gray-400 hover:text-rose-400 text-sm transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="text-gray-400 hover:text-rose-400 text-sm transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
