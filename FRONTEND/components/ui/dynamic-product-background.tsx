"use client"

import { useEffect, useState } from "react"

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
                    if (Array.isArray(data) && data.length > 0) {
                        setImages(data)
                        setTimeout(() => setLoaded(true), 200)
                    }
                }
            } catch (err) {
                console.error("Error fetching background images:", err)
            }
        }
        fetchImages()
    }, [])

    if (images.length === 0) return null

    // Repetir imágenes para llenar toda la pantalla horizontalmente
    const allImages = [...images, ...images, ...images, ...images, ...images, ...images]

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                pointerEvents: 'none',
                overflow: 'hidden',
                opacity: loaded ? 0.05 : 0,
                transition: 'opacity 1.5s ease-in-out'
            }}
            aria-hidden="true"
        >
            {/* Multiple rows of images scrolling horizontally */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                height: '100%',
                gap: '20px',
                padding: '20px 0'
            }}>
                {/* Row 1 */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    animation: 'scrollLeft 60s linear infinite'
                }}>
                    {allImages.map((src, index) => (
                        <div
                            key={`row1-${index}`}
                            style={{
                                flexShrink: 0,
                                width: '180px',
                                height: '120px',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={src}
                                alt=""
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'grayscale(100%)'
                                }}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Row 2 - opposite direction */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    animation: 'scrollRight 50s linear infinite'
                }}>
                    {allImages.reverse().map((src, index) => (
                        <div
                            key={`row2-${index}`}
                            style={{
                                flexShrink: 0,
                                width: '180px',
                                height: '120px',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={src}
                                alt=""
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'grayscale(100%)'
                                }}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Row 3 */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    animation: 'scrollLeft 70s linear infinite'
                }}>
                    {allImages.map((src, index) => (
                        <div
                            key={`row3-${index}`}
                            style={{
                                flexShrink: 0,
                                width: '180px',
                                height: '120px',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={src}
                                alt=""
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'grayscale(100%)'
                                }}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes scrollLeft {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                @keyframes scrollRight {
                    0% {
                        transform: translateX(-50%);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    )
}
