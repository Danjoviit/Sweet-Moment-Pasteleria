import { z } from "zod"

// ==================== SCHEMAS DE VALIDACIÓN ====================

// Categoría
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z.string().min(1, "El slug es requerido"),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const createCategorySchema = categorySchema.omit({ id: true })
export const updateCategorySchema = categorySchema.partial()

// Variante de Producto
export const productVariantSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, "El tipo es requerido"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  unit: z.string().optional(),
})

// Opción de Personalización
export const customizationOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  priceModifier: z.number().default(0),
})

// Personalización de Producto
export const productCustomizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["size", "topping", "filling", "glaze", "doughType", "portion"]),
  options: z.array(customizationOptionSchema).min(1, "Debe tener al menos una opción"),
})

// Producto
export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "El nombre es requerido").max(200),
  slug: z.string().min(1, "El slug es requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  categoryName: z.string().optional(),
  image: z.string().min(1, "La imagen es requerida"),
  price: z.number().optional(),
  basePrice: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  variants: z.array(productVariantSchema).optional(),
  customizations: z.array(productCustomizationSchema).optional(),
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
  discount: z.number().min(0).max(100).optional(),
  isCombo: z.boolean().optional(),
  unit: z.string().optional(),
})

export const createProductSchema = productSchema.omit({ id: true })
export const updateProductSchema = productSchema.partial()
export const updateStockSchema = z.object({
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
})

// Item de Pedido
export const orderItemSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  productName: z.string(),
  productImage: z.string(),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  customizations: z.record(z.union([z.string(), z.array(z.string())])).optional(),
})

// Pedido
export const orderStatusSchema = z.enum(["recibido", "en_preparacion", "listo", "en_camino", "entregado", "cancelado"])

export const deliveryTypeSchema = z.enum(["delivery", "pickup"])

export const paymentMethodSchema = z.enum(["tarjeta", "pago_movil", "efectivo"])

export const paymentStatusSchema = z.enum(["pendiente", "pagado", "fallido"])

export const orderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  userId: z.number().optional(),
  customerName: z.string().min(1, "El nombre es requerido"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(1, "El teléfono es requerido"),
  items: z.array(orderItemSchema).min(1, "Debe tener al menos un producto"),
  subtotal: z.number().min(0),
  deliveryCost: z.number().min(0),
  total: z.number().min(0),
  status: orderStatusSchema.default("recibido"),
  deliveryType: deliveryTypeSchema,
  deliveryAddress: z.string().optional(),
  deliveryZone: z.string().optional(),
  pickupTime: z.string().optional(),
  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema.default("pendiente"),
  notes: z.string().optional(),
})

export const createOrderSchema = orderSchema.omit({ id: true, orderNumber: true })
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
})

// Usuario
export const userRoleSchema = z.enum(["usuario", "recepcionista", "admin"])

export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: userRoleSchema.default("usuario"),
  avatar: z.string().optional(),
})

export const createUserSchema = userSchema.omit({ id: true }).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const updateUserSchema = userSchema.partial()

// Autenticación
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, "Token inválido"),
    newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

// Dirección
export const addressSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "La etiqueta es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  zone: z.string().min(1, "La zona es requerida"),
  isDefault: z.boolean().default(false),
})

export const createAddressSchema = addressSchema.omit({ id: true })
export const updateAddressSchema = addressSchema.partial()

// Zona de Delivery
export const deliveryZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  estimatedTime: z.string().min(1, "El tiempo estimado es requerido"),
  isActive: z.boolean().default(true),
})

export const createDeliveryZoneSchema = deliveryZoneSchema.omit({ id: true })
export const updateDeliveryZoneSchema = deliveryZoneSchema.partial()

// Promoción
export const discountTypeSchema = z.enum(["percentage", "fixed"])

export const promotionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  discountType: discountTypeSchema,
  discountValue: z.number().min(0, "El valor del descuento debe ser mayor o igual a 0"),
  code: z.string().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  minPurchase: z.number().optional(),
  isActive: z.boolean().default(true),
})

export const createPromotionSchema = promotionSchema.omit({ id: true })
export const updatePromotionSchema = promotionSchema.partial()

// Reseña
export const reviewSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  productId: z.number(),
  productName: z.string(),
  rating: z.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
  isVerifiedPurchase: z.boolean().default(false),
})

export const createReviewSchema = z.object({
  productId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).optional(),
})

// Notificación
export const notificationTypeSchema = z.enum(["order_status", "promotion", "system"])

export const notificationSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: notificationTypeSchema,
  isRead: z.boolean().default(false),
  orderId: z.string().optional(),
})

// Checkout
export const checkoutSchema = z
  .object({
    customerName: z.string().min(1, "El nombre es requerido"),
    customerEmail: z.string().email("Email inválido"),
    customerPhone: z.string().min(1, "El teléfono es requerido"),
    deliveryType: deliveryTypeSchema,
    deliveryAddress: z.string().optional(),
    deliveryZone: z.string().optional(),
    pickupTime: z.string().optional(),
    paymentMethod: paymentMethodSchema,
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.deliveryType === "delivery") {
        return data.deliveryAddress && data.deliveryZone
      }
      return true
    },
    {
      message: "La dirección y zona son requeridas para delivery",
      path: ["deliveryAddress"],
    },
  )
  .refine(
    (data) => {
      if (data.deliveryType === "pickup") {
        return data.pickupTime
      }
      return true
    },
    {
      message: "El tiempo de retiro es requerido",
      path: ["pickupTime"],
    },
  )

// ==================== TIPOS INFERIDOS ====================

export type CategoryInput = z.infer<typeof createCategorySchema>
export type ProductInput = z.infer<typeof createProductSchema>
export type OrderInput = z.infer<typeof createOrderSchema>
export type UserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddressInput = z.infer<typeof createAddressSchema>
export type DeliveryZoneInput = z.infer<typeof createDeliveryZoneSchema>
export type PromotionInput = z.infer<typeof createPromotionSchema>
export type ReviewInput = z.infer<typeof createReviewSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
