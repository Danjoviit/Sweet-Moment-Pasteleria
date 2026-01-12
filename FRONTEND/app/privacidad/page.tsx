import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Política de Privacidad</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>En Momentos Dulces recopilamos la siguiente información:</p>
              <ul>
                <li>
                  <strong>Información de registro:</strong> nombre, correo electrónico, teléfono.
                </li>
                <li>
                  <strong>Información de pedidos:</strong> dirección de entrega, historial de compras, preferencias.
                </li>
                <li>
                  <strong>Información de pago:</strong> procesada de forma segura a través de proveedores de pago.
                </li>
                <li>
                  <strong>Información de navegación:</strong> cookies, dirección IP, tipo de dispositivo.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Uso de la Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Utilizamos su información para:</p>
              <ul>
                <li>Procesar y entregar sus pedidos correctamente.</li>
                <li>Comunicarnos con usted sobre el estado de sus pedidos.</li>
                <li>Enviar notificaciones sobre promociones y ofertas especiales (con su consentimiento).</li>
                <li>Mejorar nuestros productos y servicios.</li>
                <li>Cumplir con obligaciones legales y fiscales.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Protección de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal:</p>
              <ul>
                <li>Encriptación de datos sensibles.</li>
                <li>Acceso restringido a información personal solo a personal autorizado.</li>
                <li>Servidores seguros y protocolos de seguridad actualizados.</li>
                <li>Revisiones periódicas de nuestras prácticas de seguridad.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Compartir Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>No vendemos ni alquilamos su información personal. Solo compartimos datos con:</p>
              <ul>
                <li>
                  <strong>Proveedores de servicios:</strong> empresas de delivery, procesadores de pago.
                </li>
                <li>
                  <strong>Autoridades:</strong> cuando sea requerido por ley.
                </li>
              </ul>
              <p>Todos nuestros proveedores están obligados a mantener la confidencialidad de su información.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Utilizamos cookies para:</p>
              <ul>
                <li>Mantener su sesión iniciada.</li>
                <li>Recordar sus preferencias y carrito de compras.</li>
                <li>Analizar el uso del sitio para mejoras.</li>
              </ul>
              <p>
                Puede configurar su navegador para rechazar cookies, aunque esto podría afectar algunas funcionalidades
                del sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Sus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Usted tiene derecho a:</p>
              <ul>
                <li>Acceder a su información personal almacenada.</li>
                <li>Solicitar la corrección de datos incorrectos.</li>
                <li>Solicitar la eliminación de su cuenta y datos.</li>
                <li>Oponerse al procesamiento de sus datos para fines de marketing.</li>
                <li>Retirar su consentimiento en cualquier momento.</li>
              </ul>
              <p>Para ejercer estos derechos, contáctenos a través de nuestros canales oficiales.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Conservamos su información personal mientras mantenga una cuenta activa o según sea necesario para
                proporcionarle servicios. También podemos retener cierta información para cumplir con obligaciones
                legales, resolver disputas y hacer cumplir nuestros acuerdos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cambios en esta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios
                significativos publicando la nueva política en nuestro sitio web y, cuando sea apropiado, enviándole una
                notificación por correo electrónico.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Si tiene preguntas sobre esta política de privacidad o sobre cómo manejamos su información, puede
                contactarnos:
              </p>
              <ul>
                <li>Instagram: @sweetmoments</li>
                <li>Teléfono: 0414.3169960</li>
                <li>Email: privacidad@momentosdulces.com</li>
              </ul>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 text-sm">Última actualización: Noviembre 2024</p>
        </div>
      </div>
    </div>
  )
}
