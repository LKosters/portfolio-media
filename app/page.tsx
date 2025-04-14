"use client"

import { useEffect, useState } from "react"
import GameCanvas from "@/components/game-canvas"

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Portfolio projects data
  const projects = [
    {
      id: "home",
      title: "Home",
      description: "Welcome to my portfolio",
      image: "/placeholder.svg?height=300&width=400",
      details:
        "Welcome to my interactive portfolio! Use the arrow keys or WASD to drive the car and explore my projects. Touch the hovering buttons to learn more about each project.",
      color: "#FF6B6B", // Red
    },
    {
      id: "branding",
      title: "Project Branding",
      description: "Brand identity and logo design",
      image: "/placeholder.svg?height=300&width=400",
      details:
        "I create memorable brand identities that resonate with target audiences. My branding work includes logo design, color palettes, typography, and brand guidelines.",
      color: "#4ECDC4", // Teal
    },
    {
      id: "devsnip",
      title: "Project DevSnip",
      description: "Web development and coding projects",
      image: "/placeholder.svg?height=300&width=400",
      details:
        "DevSnip is a collection of my web development projects. I specialize in creating responsive, user-friendly websites and applications using modern technologies like React, Next.js, and more.",
      color: "#6ECBF5", // Blue
    },
    {
      id: "gamedev",
      title: "Project GameDev",
      description: "Game development and interactive experiences",
      image: "/placeholder.svg?height=300&width=400",
      details:
        "I create engaging games and interactive experiences using web technologies. This portfolio itself is an example of my game development skills!",
      color: "#FFD166", // Yellow
    },
  ]

  useEffect(() => {
    // Check if all images are loaded
    const checkImagesLoaded = async () => {
      const imageUrls = [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/car-qD0rjY6qrJJoK1M2xfpeUYq7QFdEhn.gif", // car.gif
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crouch-rbtQB2Aznp4ZIQ356UZfUNPc1z3RP5.gif", // crouch.gif
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crash-OO6PmxVuicGZL1TJwCi3rLNcqugSqA.gif", // crash.gif
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/road-LWGFReX6L3YEgnbn7JZuLsH9p7RNIw.png", // road.png
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg1.jpg-98F7BXTMNi32nQNYUpjqqVligqpz4P.jpeg", // bg1.jpeg
      ]

      try {
        // Create an array of promises for loading each image
        const imagePromises = imageUrls.map((url) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              console.log(`Loaded image: ${url}`, img.width, img.height)
              resolve(true)
            }
            img.onerror = () => {
              console.warn(`Failed to load image: ${url}`)
              resolve(false) // Resolve anyway to continue loading
            }
            img.src = url
            img.crossOrigin = "anonymous"
          })
        })

        // Wait for all images to load or fail
        await Promise.all(imagePromises)
      } catch (error) {
        console.error("Error loading images:", error)
      }
    }

    checkImagesLoaded()
  }, [])

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <GameCanvas onProjectSelect={handleProjectSelect} projects={projects} />
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        <p>Use arrow keys or WASD to move, W to jump</p>
        <p>Crouch (down arrow or S) on a project button to view its content</p>
      </div>
    </main>
  )
}
