import { create } from "zustand"
import { persist } from "zustand/middleware"
import { API_CONFIG } from "./api/config"

export type UserRole = "usuario" | "recepcionista" | "administrador"

export interface UserAddress {
  id: string
  label: string
  address: string
  zone: string
  isDefault: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  addresses?: UserAddress[]
  favorites?: number[]
  isVerified?: boolean
  createdAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  checkSession: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
  addAddress: (address: Omit<UserAddress, "id">) => Promise<{ success: boolean; error?: string }>
  updateAddress: (id: string, address: Partial<UserAddress>) => Promise<{ success: boolean; error?: string }>
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>
  toggleFavorite: (productId: number) => Promise<{ success: boolean; error?: string }>
  setHydrated: () => void
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  role?: UserRole
}

const mockUsersDB: (User & { password: string })[] = [
  {
    id: "user-1",
    name: "Juan Pérez",
    email: "usuario@momentosdulces.com",
    password: "123456",
    role: "usuario",
    phone: "+58 424-111-1111",
    isVerified: true,
    favorites: [],
    addresses: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "recep-1",
    name: "María González",
    email: "recepcionista@momentosdulces.com",
    password: "123456",
    role: "recepcionista",
    phone: "+58 424-222-2222",
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-1",
    name: "Carlos Rodríguez",
    email: "admin@momentosdulces.com",
    password: "123456",
    role: "administrador",
    phone: "+58 424-333-3333",
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
]

const pendingVerifications: Map<string, string> = new Map()
const passwordResetTokens: Map<string, string> = new Map()

const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  // Si estamos en modo mock, no hacemos petición real
  if (API_CONFIG.USE_MOCK_DATA) {
    return null
  }

  // Adjuntar Authorization si existe token en localStorage (cliente)
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    // Mantener credentials por compatibilidad con cookies si el backend las usa
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error de conexión" }))
    throw new Error(error.message || "Error en la petición")
  }

  return response.json()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => {
        set({ isHydrated: true })
      },

      checkSession: async () => {
        set({ isLoading: true })

        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            // En modo mock, verificar si hay token guardado
            const storedToken = localStorage.getItem("auth-token")
            if (storedToken) {
              // Simular verificación de token
              const userId = storedToken.split("-")[1]
              const user = mockUsersDB.find(
                (u) =>
                  u.id === `user-${userId}` ||
                  u.id === `recep-${userId}` ||
                  u.id === `admin-${userId}` ||
                  u.id === userId,
              )
              if (user) {
                const { password: _, ...userWithoutPassword } = user
                set({ user: userWithoutPassword, isAuthenticated: true })
              } else {
                localStorage.removeItem("auth-token")
                set({ user: null, isAuthenticated: false })
              }
            }
          } else {
            // Petición real al backend para verificar sesión
            const data = await apiRequest("/auth/me/")
            if (data && data.user) {
              set({ user: data.user, isAuthenticated: true })
            } else {
              set({ user: null, isAuthenticated: false })
            }
          }
        } catch {
          // Si hay error, limpiar sesión
          localStorage.removeItem("auth-token")
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            // Simulación para desarrollo
            await new Promise((resolve) => setTimeout(resolve, 500))

            const user = mockUsersDB.find((u) => u.email.toLowerCase() === email.toLowerCase())

            if (!user) {
              return { success: false, error: "El correo electrónico no está registrado" }
            }

            if (user.password !== password) {
              return { success: false, error: "La contraseña es incorrecta" }
            }

            if (!user.isVerified) {
              return { success: false, error: "Por favor verifica tu correo electrónico antes de iniciar sesión" }
            }

            localStorage.setItem("auth-token", `token-${user.id}`)

            const { password: _, ...userWithoutPassword } = user
            set({ user: userWithoutPassword, isAuthenticated: true })
            return { success: true }
          } else {
            // Petición real al backend Django
            const data = await apiRequest("/auth/login/", {
              method: "POST",
              body: JSON.stringify({ email, password }),
            })

            if (data.token) {
              localStorage.setItem("auth-token", data.token)
            }

            set({ user: data.user, isAuthenticated: true })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al iniciar sesión" }
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })

        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500))

            const existingUser = mockUsersDB.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
            if (existingUser) {
              return { success: false, error: "Este correo electrónico ya está registrado" }
            }

            const newUser: User & { password: string } = {
              id: `user-${Date.now()}`,
              name: data.name,
              email: data.email,
              password: data.password,
              phone: data.phone,
              role: data.role || "usuario",
              isVerified: false,
              favorites: [],
              addresses: [],
              createdAt: new Date().toISOString(),
            }

            mockUsersDB.push(newUser)

            const verificationToken = `verify-${Date.now()}-${Math.random().toString(36).substring(7)}`
            pendingVerifications.set(verificationToken, newUser.id)

            console.log(`[MOCK] Token de verificación para ${data.email}: ${verificationToken}`)

            return { success: true }
          } else {
            await apiRequest("/auth/register/", {
              method: "POST",
              body: JSON.stringify(data),
            })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al registrarse" }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          if (!API_CONFIG.USE_MOCK_DATA) {
            await apiRequest("/auth/logout/", { method: "POST" })
          }
        } catch {
          // Ignorar errores de logout
        } finally {
          localStorage.removeItem("auth-token")
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 300))

            set((state) => ({
              user: state.user ? { ...state.user, ...data } : null,
            }))

            const currentUser = get().user
            if (currentUser) {
              const index = mockUsersDB.findIndex((u) => u.id === currentUser.id)
              if (index !== -1) {
                mockUsersDB[index] = { ...mockUsersDB[index], ...data }
              }
            }

            return { success: true }
          } else {
            const updatedUser = await apiRequest("/auth/profile/", {
              method: "PATCH",
              body: JSON.stringify(data),
            })
            set({ user: updatedUser })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al actualizar perfil" }
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500))

            const user = mockUsersDB.find((u) => u.email.toLowerCase() === email.toLowerCase())
            if (user) {
              const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(7)}`
              passwordResetTokens.set(resetToken, user.id)
              console.log(`[MOCK] Token de recuperación para ${email}: ${resetToken}`)
            }

            return { success: true }
          } else {
            await apiRequest("/auth/password-reset/", {
              method: "POST",
              body: JSON.stringify({ email }),
            })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al solicitar recuperación" }
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500))

            const userId = passwordResetTokens.get(token)
            if (!userId) {
              return { success: false, error: "El enlace de recuperación es inválido o ha expirado" }
            }

            const userIndex = mockUsersDB.findIndex((u) => u.id === userId)
            if (userIndex === -1) {
              return { success: false, error: "Usuario no encontrado" }
            }

            mockUsersDB[userIndex].password = newPassword
            passwordResetTokens.delete(token)

            return { success: true }
          } else {
            await apiRequest("/auth/password-reset/confirm/", {
              method: "POST",
              body: JSON.stringify({ token, new_password: newPassword }),
            })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al restablecer contraseña" }
        }
      },

      verifyEmail: async (token: string) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500))

            const userId = pendingVerifications.get(token)
            if (!userId) {
              return { success: false, error: "El enlace de verificación es inválido o ha expirado" }
            }

            const userIndex = mockUsersDB.findIndex((u) => u.id === userId)
            if (userIndex === -1) {
              return { success: false, error: "Usuario no encontrado" }
            }

            mockUsersDB[userIndex].isVerified = true
            pendingVerifications.delete(token)

            return { success: true }
          } else {
            await apiRequest("/auth/verify-email/", {
              method: "POST",
              body: JSON.stringify({ token }),
            })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al verificar email" }
        }
      },

      resendVerificationEmail: async () => {
        try {
          const currentUser = get().user
          if (!currentUser) {
            return { success: false, error: "No hay sesión activa" }
          }

          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 500))

            const verificationToken = `verify-${Date.now()}-${Math.random().toString(36).substring(7)}`
            pendingVerifications.set(verificationToken, currentUser.id)

            console.log(`[MOCK] Nuevo token de verificación: ${verificationToken}`)

            return { success: true }
          } else {
            await apiRequest("/auth/resend-verification/", { method: "POST" })
            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al reenviar verificación" }
        }
      },

      addAddress: async (address: Omit<UserAddress, "id">) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 300))

            const newAddress: UserAddress = {
              ...address,
              id: `addr-${Date.now()}`,
            }

            set((state) => {
              if (!state.user) return state

              const addresses = state.user.addresses || []
              const updatedAddresses = address.isDefault
                ? addresses.map((a) => ({ ...a, isDefault: false }))
                : addresses

              return {
                user: {
                  ...state.user,
                  addresses: [...updatedAddresses, newAddress],
                },
              }
            })

            return { success: true }
          } else {
            const newAddress = await apiRequest("/auth/addresses/", {
              method: "POST",
              body: JSON.stringify(address),
            })

            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    addresses: [...(state.user.addresses || []), newAddress],
                  }
                : null,
            }))

            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al agregar dirección" }
        }
      },

      updateAddress: async (id: string, addressData: Partial<UserAddress>) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 300))

            set((state) => {
              if (!state.user || !state.user.addresses) return state

              let addresses = state.user.addresses.map((a) => (a.id === id ? { ...a, ...addressData } : a))

              if (addressData.isDefault) {
                addresses = addresses.map((a) => (a.id === id ? a : { ...a, isDefault: false }))
              }

              return {
                user: {
                  ...state.user,
                  addresses,
                },
              }
            })

            return { success: true }
          } else {
            await apiRequest(`/auth/addresses/${id}/`, {
              method: "PATCH",
              body: JSON.stringify(addressData),
            })

            set((state) => {
              if (!state.user || !state.user.addresses) return state

              return {
                user: {
                  ...state.user,
                  addresses: state.user.addresses.map((a) => (a.id === id ? { ...a, ...addressData } : a)),
                },
              }
            })

            return { success: true }
          }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al actualizar dirección" }
        }
      },

      deleteAddress: async (id: string) => {
        try {
          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          } else {
            await apiRequest(`/auth/addresses/${id}/`, { method: "DELETE" })
          }

          set((state) => {
            if (!state.user || !state.user.addresses) return state

            return {
              user: {
                ...state.user,
                addresses: state.user.addresses.filter((a) => a.id !== id),
              },
            }
          })

          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al eliminar dirección" }
        }
      },

      toggleFavorite: async (productId: number) => {
        try {
          const user = get().user
          if (!user) {
            return { success: false, error: "Debes iniciar sesión para agregar favoritos" }
          }

          const favorites = user.favorites || []
          const isFavorite = favorites.includes(productId)

          if (API_CONFIG.USE_MOCK_DATA) {
            await new Promise((resolve) => setTimeout(resolve, 200))
          } else {
            if (isFavorite) {
              await apiRequest(`/auth/favorites/${productId}/`, { method: "DELETE" })
            } else {
              await apiRequest("/auth/favorites/", {
                method: "POST",
                body: JSON.stringify({ product_id: productId }),
              })
            }
          }

          set((state) => {
            if (!state.user) return state

            return {
              user: {
                ...state.user,
                favorites: isFavorite ? favorites.filter((id) => id !== productId) : [...favorites, productId],
              },
            }
          })

          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Error al actualizar favoritos" }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
