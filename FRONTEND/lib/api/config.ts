// Cambia esta URL cuando conectes tu backend Django
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Flag para usar datos mock o API real
export const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_API_URL

// Helper para construir URLs de API
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  USE_MOCK_DATA,
}
