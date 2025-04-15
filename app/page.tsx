"use client"

import { useEffect, useState } from "react"
import GameCanvas from "@/components/game-canvas"

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Portfolio projects data
  const projects = [
    {
      id: "branding",
      title: "Project Branding",
      image: "/placeholder.svg?height=300&width=400",
      color: "#4ECDC4",
    },
    {
      id: "project-ux",
      title: "Project UX",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FFD166",
    },
    {
      id: "project-development",
      title: "Project Development",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FF6B6B",
    },
    {
      id: "project-x",
      title: "Project X",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FFB400",
    },
    {
      id: "devsnip",
      title: "Project DevSnip",
      image: "/placeholder.svg?height=300&width=400",
      color: "#6ECBF5",
    },
  ]

  // Learning outcomes data
  const learningOutcomes = [
    {
      id: "interactive-media",
      title: "Interactive Media",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FF9F1C",
    },
    {
      id: "development",
      title: "Development",
      image: "/placeholder.svg?height=300&width=400",
      color: "#2EC4B6",
    },
    {
      id: "design",
      title: "Design",
      image: "/placeholder.svg?height=300&width=400",
      color: "#E71D36",
    },
    {
      id: "professional-standard",
      title: "Professional",
      image: "/placeholder.svg?height=300&width=400",
      color: "#7209B7",
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
      <GameCanvas 
        onProjectSelect={handleProjectSelect} 
        projects={projects} 
        learningOutcomes={learningOutcomes}
      />
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        <p>Use arrow keys or WASD to move, W to jump</p>
        <p>Crouch (down arrow or S) on a project button to view its content</p>
      </div>
    </main>
  )
}
