"use client"

import { useState, useEffect, useRef } from "react"

interface GameImages {
  car: HTMLImageElement | null
  crouch: HTMLImageElement | null
  crash: HTMLImageElement | null
  road: HTMLImageElement | null
  background: HTMLImageElement | null
  loaded: boolean
}

export function useGameImages() {
  const carImageRef = useRef<HTMLImageElement | null>(null)
  const crouchImageRef = useRef<HTMLImageElement | null>(null)
  const crashImageRef = useRef<HTMLImageElement | null>(null)
  const roadImageRef = useRef<HTMLImageElement | null>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Load images
  useEffect(() => {
    const loadImage = (src: string, name: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          console.log(`Loaded image: ${name}`, img.width, img.height)
          resolve(img)
        }
        img.onerror = (e) => {
          console.error(`Failed to load image: ${name}`, e)
          reject(new Error(`Failed to load image: ${name}`))
        }
        img.src = src
      })
    }

    const loadAllImages = async () => {
      try {
        // Use direct blob URLs
        carImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/car-qD0rjY6qrJJoK1M2xfpeUYq7QFdEhn.gif",
          "car.gif",
        )
        crouchImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crouch-rbtQB2Aznp4ZIQ356UZfUNPc1z3RP5.gif",
          "crouch.gif",
        )
        crashImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crash-OO6PmxVuicGZL1TJwCi3rLNcqugSqA.gif",
          "crash.gif",
        )
        roadImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/road-LWGFReX6L3YEgnbn7JZuLsH9p7RNIw.png",
          "road.png",
        )
        bgImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg1.jpg-98F7BXTMNi32nQNYUpjqqVligqpz4P.jpeg",
          "bg1.jpeg",
        )

        setImagesLoaded(true)
      } catch (error) {
        console.error("Error loading images:", error)
        setDebugInfo(`Error loading images: ${error}`)
        // Continue even if images fail to load - we'll use fallbacks
        setImagesLoaded(true)
      }
    }

    loadAllImages()
  }, [])

  const images: GameImages = {
    car: carImageRef.current,
    crouch: crouchImageRef.current,
    crash: crashImageRef.current,
    road: roadImageRef.current,
    background: bgImageRef.current,
    loaded: imagesLoaded
  }

  return { images, debugInfo }
} 