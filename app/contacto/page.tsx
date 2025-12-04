"use client"

import type React from "react"

import Link from "next/link"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Gracias por tu mensaje. Pronto nos contactaremos contigo.")
    setFormData({ name: "", email: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contacto</h1>
              <p className="text-xl text-gray-600">¿Tienes preguntas? Nos encantaría escucharte</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-rose-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Teléfono</h3>
                      <p className="text-gray-600">+58 414-3169960</p>
                      <p className="text-sm text-gray-500 mt-1">Lun - Vie: 9:00 AM - 6:00 PM</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">info@momentosdulces.com</p>
                      <p className="text-sm text-gray-500 mt-1">Respuestas en 24 horas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Ubicación</h3>
                      <p className="text-gray-600">Centro Comercial, Local 5</p>
                      <p className="text-sm text-gray-500 mt-1">Tu ciudad, País</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horario</h3>
                      <p className="text-gray-600">Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Sábados: 10:00 AM - 4:00 PM</p>
                      <p className="text-gray-600">Domingos: Cerrado</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="border-rose-100 h-fit">
                <CardHeader>
                  <CardTitle>Envíanos un mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-rose-200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-rose-200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Mensaje</Label>
                      <textarea
                        id="message"
                        placeholder="Tu mensaje aquí..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500"
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-rose-400">Momentos Dulces</h3>
              <p className="text-gray-400">Los mejores postres artesanales, hechos con amor.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/menu" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Menú
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Inicio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <p className="text-gray-400">@sweetmoments</p>
              <p className="text-gray-400">Tel: +58 414-3169960</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Momentos Dulces. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
