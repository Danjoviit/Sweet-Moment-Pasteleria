"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function DynamicProductBackground() {
    const [images, setImages] = useState<string[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        async function fetchImages() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                const response = await fetch(`${apiUrl}/products/collage-images/`)
                if (response.ok) {
                    const data = await response.json()
                    console.log("DynamicBackground: Fetch success", data)
                    setImages(data)
                    // Empezar la animación de entrada un poco después
                    setTimeout(() => setLoaded(true), 100)
                } else {
                    console.error("DynamicBackground: Fetch failed", response.status)
                }
            } catch (error) {
                console.error("Error fetching background images:", error)
            }
        }

        fetchImages()
    }, [])

    if (images.length === 0) return null

    return (
        <div
            className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${loaded ? 'opacity-[0.07]' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 w-[120vw] h-[120vh] -ml-[10vw] -mt-[10vh] transform rotate-[-5deg]">
                {images.map((src, index) => (
                    <div key={index} className="relative aspect-square w-full h-full overflow-hidden rounded-lg opacity-80">
                        <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                        />
                    </div>
                ))}
                {/* Repetir imágenes si son pocas para llenar la pantalla */}
                {images.length < 20 && images.map((src, index) => (
                    <div key={`rep-${index}`} className="relative aspect-square w-full h-full overflow-hidden rounded-lg opacity-80">
                        <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                        />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 backdrop-blur-[1px]"></div>
        </div>
    )
}
