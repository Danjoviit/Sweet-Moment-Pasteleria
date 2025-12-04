"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Edit2, Trash2, ArrowLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Header from "@/components/header"
import { useAuthStore } from "@/lib/auth-store"
import { reviewsService, productsService } from "@/lib/api/services"
import type { Review, Product } from "@/lib/api/types"

export default function ResenasPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [reviews, setReviews] = useState<(Review & { product?: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/resenas")
      return
    }

    const loadReviews = async () => {
      if (!user) return

      try {
        const userReviews = await reviewsService.getByUser(Number(user.id))
        const products = await productsService.getAll()

        const reviewsWithProducts = userReviews.map((review) => ({
          ...review,
          product: products.find((p) => p.id === review.productId),
        }))

        setReviews(reviewsWithProducts)
      } catch (error) {
        console.error("Error loading reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user) {
      loadReviews()
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleEditReview = (review: Review) => {
    setSelectedReview(review)
    setEditForm({ rating: review.rating, comment: review.comment })
    setEditDialogOpen(true)
  }

  const handleSaveReview = async () => {
    if (!selectedReview) return

    try {
      await reviewsService.update(selectedReview.id, editForm)
      setReviews((prev) => prev.map((r) => (r.id === selectedReview.id ? { ...r, ...editForm } : r)))
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating review:", error)
    }
  }

  const handleDeleteReview = async () => {
    if (!selectedReview) return

    try {
      await reviewsService.delete(selectedReview.id)
      setReviews((prev) => prev.filter((r) => r.id !== selectedReview.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const confirmDelete = (review: Review) => {
    setSelectedReview(review)
    setDeleteDialogOpen(true)
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star className={`h-5 w-5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Reseñas</h1>
            <p className="text-gray-600">
              {reviews.length} {reviews.length === 1 ? "reseña publicada" : "reseñas publicadas"}
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No has escrito reseñas aún</h2>
              <p className="text-gray-500 mb-6">Compra productos y comparte tu experiencia con otros clientes</p>
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/menu">Ver Menú</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {review.product && (
                      <Link href={`/producto/${review.product.slug}`} className="shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={review.product.image || "/placeholder.svg"}
                            alt={review.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/producto/${review.product?.slug}`}
                            className="font-semibold text-gray-900 hover:text-rose-600 transition-colors"
                          >
                            {review.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Compra verificada
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditReview(review)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(review)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3">{review.comment}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString("es-VE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog para editar reseña */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reseña</DialogTitle>
            <DialogDescription>Modifica tu reseña para "{selectedReview?.productName}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Calificación</Label>
              {renderStars(editForm.rating, true, (rating) => setEditForm({ ...editForm, rating }))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                placeholder="Escribe tu opinión..."
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveReview}
              className="bg-rose-500 hover:bg-rose-600"
              disabled={!editForm.comment.trim()}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu reseña para "{selectedReview?.productName}" será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
