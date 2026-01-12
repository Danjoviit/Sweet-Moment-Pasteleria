"use client"
import { Heart, Award, Users, Clock, Sparkles, Phone, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"

const values = [
  {
    icon: Heart,
    title: "Amor en cada bocado",
    description: "Horneamos con amor y dedicación para crear experiencias únicas de unión y alegría.",
  },
  {
    icon: Award,
    title: "Calidad artesanal",
    description: "Utilizamos los mejores ingredientes para garantizar postres de la más alta calidad.",
  },
  {
    icon: Users,
    title: "Familia y tradición",
    description: "Somos una repostería nacida del corazón, con la ilusión de llevar felicidad.",
  },
  {
    icon: Clock,
    title: "3 años endulzando",
    description: "Desde hace 3 años hemos endulzado momentos especiales de nuestros clientes.",
  },
]

const stats = [
  { number: "3+", label: "Años de experiencia" },
  { number: "500+", label: "Clientes felices" },
  { number: "1000+", label: "Postres entregados" },
  { number: "100%", label: "Hecho con amor" },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-rose-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-rose-500" />
              <span className="text-rose-600 font-medium text-sm">Nuestra Historia</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sobre <span className="text-rose-500">Momentos Dulces</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Somos una repostería nacida del corazón, con la ilusión de llevar felicidad en cada bocado. Desde hace 3
              años, hemos endulzado momentos especiales y convertido nuestros postres en pequeños mensajeros de "te
              quiero", "te amo" o "te extraño".
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-rose-500 mb-1">{stat.number}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra <span className="text-rose-500">Misión</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Horneamos con amor y dedicación para crear experiencias únicas de unión y alegría. Cada postre que sale
                de nuestra cocina lleva consigo el deseo de hacer feliz a alguien especial.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                En esta temporada, hemos creado detalles llenos de cariño para sorprender a esa persona especial, tu
                amigo secreto o incluso a ti mismo. Tenemos desde postres pequeños para endulzar el día hasta tortas y
                frasquitos perfectos para compartir o llevar a casa.
              </p>
              <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-xl">
                <div className="p-3 bg-rose-100 rounded-full">
                  <Heart className="h-6 w-6 text-rose-500" />
                </div>
                <p className="text-rose-700 font-medium italic">
                  "Endulza el día de quienes siempre te regalan momentos dulces"
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/beautiful-assorted-desserts-and-pastries-display.jpg"
                  alt="Nuestros postres"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
                <p className="text-3xl font-bold text-rose-500">3</p>
                <p className="text-gray-600 text-sm">Años de amor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-b from-white to-rose-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros <span className="text-rose-500">Valores</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lo que nos hace especiales y nos impulsa a seguir creando dulces momentos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">¿Listo para endulzar tu día?</h2>
                  <p className="text-rose-100 mb-6">
                    Contáctanos para hacer tu pedido o resolver cualquier duda. Estamos aquí para ayudarte a crear
                    momentos dulces.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Phone className="h-5 w-5" />
                      </div>
                      <span>0414.3169960</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Mail className="h-5 w-5" />
                      </div>
                      <span>@sweetmoments</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img
                    src="/momentos-dulces-logo.png"
                    alt="Momentos Dulces"
                    className="w-48 h-48 object-contain bg-white rounded-full p-4 shadow-2xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2025 Momentos Dulces. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
