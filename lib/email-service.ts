// Servicio de email para enviar correos desde el frontend
// En modo desarrollo simula el envío, en producción usa Server Actions

// Almacén local para tokens de recuperación (en producción esto estaría en el backend)
const passwordResetTokens = new Map<string, { email: string; expires: number }>()
const verificationTokens = new Map<string, { email: string; expires: number }>()

// Generar token único
const generateToken = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
}

// Obtener URL base de la aplicación
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export const emailService = {
  // Enviar correo de recuperación de contraseña
  sendPasswordResetEmail: async (
    email: string,
    userName?: string,
  ): Promise<{ success: boolean; error?: string; token?: string; resetLink?: string }> => {
    try {
      // Generar token de recuperación
      const token = generateToken()
      const resetLink = `${getBaseUrl()}/restablecer-password?token=${token}`

      // Guardar token con expiración de 1 hora
      passwordResetTokens.set(token, {
        email: email.toLowerCase(),
        expires: Date.now() + 3600000, // 1 hora
      })

      // En desarrollo, mostrar en consola y retornar el enlace
      console.log("========================================")
      console.log("[Momentos Dulces] CORREO DE RECUPERACIÓN")
      console.log("========================================")
      console.log(`Para: ${email}`)
      console.log(`Nombre: ${userName || "Usuario"}`)
      console.log(`Token: ${token}`)
      console.log(`Enlace: ${resetLink}`)
      console.log("========================================")

      return { success: true, token, resetLink }
    } catch (error) {
      console.error("Error al enviar correo:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al enviar el correo",
      }
    }
  },

  // Verificar token de recuperación
  verifyPasswordResetToken: (token: string): { valid: boolean; email?: string; error?: string } => {
    const tokenData = passwordResetTokens.get(token)

    if (!tokenData) {
      return { valid: false, error: "El enlace de recuperación es inválido" }
    }

    if (Date.now() > tokenData.expires) {
      passwordResetTokens.delete(token)
      return { valid: false, error: "El enlace de recuperación ha expirado" }
    }

    return { valid: true, email: tokenData.email }
  },

  // Invalidar token después de usar
  invalidatePasswordResetToken: (token: string): void => {
    passwordResetTokens.delete(token)
  },

  // Enviar correo de verificación de email
  sendVerificationEmail: async (
    email: string,
    userName?: string,
  ): Promise<{ success: boolean; error?: string; token?: string; verificationLink?: string }> => {
    try {
      // Generar token de verificación
      const token = generateToken()
      const verificationLink = `${getBaseUrl()}/verificar-email?token=${token}`

      // Guardar token con expiración de 24 horas
      verificationTokens.set(token, {
        email: email.toLowerCase(),
        expires: Date.now() + 86400000, // 24 horas
      })

      // En desarrollo, mostrar en consola y retornar el enlace
      console.log("==========================================")
      console.log("[Momentos Dulces] CORREO DE VERIFICACIÓN")
      console.log("==========================================")
      console.log(`Para: ${email}`)
      console.log(`Nombre: ${userName || "Usuario"}`)
      console.log(`Token: ${token}`)
      console.log(`Enlace: ${verificationLink}`)
      console.log("==========================================")

      return { success: true, token, verificationLink }
    } catch (error) {
      console.error("Error al enviar correo de verificación:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al enviar el correo",
      }
    }
  },

  // Verificar token de verificación de email
  verifyEmailToken: (token: string): { valid: boolean; email?: string; error?: string } => {
    const tokenData = verificationTokens.get(token)

    if (!tokenData) {
      return { valid: false, error: "El enlace de verificación es inválido" }
    }

    if (Date.now() > tokenData.expires) {
      verificationTokens.delete(token)
      return { valid: false, error: "El enlace de verificación ha expirado" }
    }

    return { valid: true, email: tokenData.email }
  },

  // Invalidar token de verificación después de usar
  invalidateVerificationToken: (token: string): void => {
    verificationTokens.delete(token)
  },
}

export default emailService
