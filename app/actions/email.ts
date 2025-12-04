"use server"

// Server Action para enviar correos usando EmailJS
// Las credenciales se manejan de forma segura en el servidor

interface SendEmailResult {
  success: boolean
  error?: string
}

interface PasswordResetEmailParams {
  toEmail: string
  toName: string
  resetLink: string
}

interface VerificationEmailParams {
  toEmail: string
  toName: string
  verificationLink: string
}

// Configuración de EmailJS (variables de entorno del servidor)
const getEmailConfig = () => ({
  serviceId: process.env.EMAILJS_SERVICE_ID || "service_momentos",
  resetTemplateId: process.env.EMAILJS_RESET_TEMPLATE_ID || "template_reset",
  verifyTemplateId: process.env.EMAILJS_VERIFY_TEMPLATE_ID || "template_verify",
  publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
  privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
})

export async function sendPasswordResetEmailAction(params: PasswordResetEmailParams): Promise<SendEmailResult> {
  const config = getEmailConfig()

  // Si no hay configuración, solo logueamos (modo desarrollo)
  if (!config.publicKey || !config.privateKey) {
    console.log("[Server] Email de recuperación (modo dev):", params)
    return { success: true }
  }

  try {
    // Usar EmailJS API REST desde el servidor
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.resetTemplateId,
        user_id: config.publicKey,
        accessToken: config.privateKey,
        template_params: {
          to_email: params.toEmail,
          to_name: params.toName,
          reset_link: params.resetLink,
          app_name: "Momentos Dulces",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error enviando email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar el correo",
    }
  }
}

export async function sendVerificationEmailAction(params: VerificationEmailParams): Promise<SendEmailResult> {
  const config = getEmailConfig()

  // Si no hay configuración, solo logueamos (modo desarrollo)
  if (!config.publicKey || !config.privateKey) {
    console.log("[Server] Email de verificación (modo dev):", params)
    return { success: true }
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.verifyTemplateId,
        user_id: config.publicKey,
        accessToken: config.privateKey,
        template_params: {
          to_email: params.toEmail,
          to_name: params.toName,
          verification_link: params.verificationLink,
          app_name: "Momentos Dulces",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error enviando email de verificación:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar el correo",
    }
  }
}
