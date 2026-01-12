import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Términos y Condiciones</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Información General</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Bienvenido a Momentos Dulces. Al acceder y utilizar nuestro sitio web y servicios, usted acepta cumplir
                con estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos que no
                utilice nuestros servicios.
              </p>
              <p>
                Momentos Dulces es una tienda de postres ubicada en Venezuela, dedicada a la elaboración y venta de
                productos de repostería artesanal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Pedidos y Pagos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <ul>
                <li>Todos los precios están expresados en bolívares (Bs).</li>
                <li>El pago debe realizarse al momento de confirmar el pedido.</li>
                <li>Aceptamos pagos mediante tarjeta de crédito/débito, pago móvil y efectivo.</li>
                <li>Los pedidos están sujetos a disponibilidad de inventario.</li>
                <li>
                  Nos reservamos el derecho de cancelar pedidos en caso de falta de stock o información incorrecta.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Entregas y Retiros</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Delivery:</h4>
              <ul>
                <li>El costo de envío varía según la zona de entrega.</li>
                <li>Los tiempos de entrega son estimados y pueden variar según condiciones externas.</li>
                <li>El cliente debe proporcionar una dirección válida y estar disponible para recibir el pedido.</li>
              </ul>
              <h4>Retiro en Tienda:</h4>
              <ul>
                <li>Los pedidos para retiro deben recogerse en el horario indicado.</li>
                <li>El tiempo de espera máximo es de 30 minutos después de la hora programada.</li>
                <li>Pedidos no retirados podrán ser cancelados sin derecho a reembolso.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Cancelaciones y Reembolsos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <ul>
                <li>Las cancelaciones deben solicitarse antes de que el pedido entre en preparación.</li>
                <li>No se aceptan devoluciones de productos perecederos una vez entregados.</li>
                <li>En caso de productos defectuosos, se realizará el reemplazo sin costo adicional.</li>
                <li>Los reembolsos, cuando apliquen, se procesarán en un plazo de 5-7 días hábiles.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Productos y Calidad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <ul>
                <li>Todos nuestros productos son elaborados con ingredientes frescos y de calidad.</li>
                <li>Las imágenes de los productos son referenciales y pueden variar ligeramente.</li>
                <li>Informamos sobre alérgenos conocidos, pero no podemos garantizar la ausencia total de trazas.</li>
                <li>Se recomienda consumir los productos en las fechas indicadas para mejor frescura.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Uso del Sitio Web</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <ul>
                <li>El usuario es responsable de mantener la confidencialidad de su cuenta.</li>
                <li>Está prohibido el uso del sitio para fines ilegales o no autorizados.</li>
                <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Para cualquier consulta sobre estos términos y condiciones, puede contactarnos a través de:</p>
              <ul>
                <li>Instagram: @sweetmoments</li>
                <li>Teléfono: 0414.3169960</li>
                <li>Email: contacto@momentosdulces.com</li>
              </ul>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 text-sm">Última actualización: Noviembre 2024</p>
        </div>
      </div>
    </div>
  )
}
