"use client"

import { useEffect, useState } from "react"
import GameCanvas from "@/components/game-canvas"
import Link from "next/link"

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Portfolio projects data
  const projects = [
    {
      id: "project-branding",
      title: "Project Branding",
      image: "/placeholder.svg?height=300&width=400",
      color: "#4ECDC4",
      tags: ["Design", "Interactive Media"]
    },
    {
      id: "project-ux",
      title: "Project UX",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FFD166",
      tags: ["Design", "Interactive Media"]
    },
    {
      id: "project-development",
      title: "Project Development",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FF6B6B",
      tags: ["Development", "Design", "Professional standard"]
    },
    {
      id: "project-x",
      title: "Project X",
      image: "/placeholder.svg?height=300&width=400",
      color: "#FFB400",
      tags: ["Development", "Interactive Media", "Professional standard"]
    },
    {
      id: "portfolio-website",
      title: "Portfolio Website",
      image: "/placeholder.svg?height=300&width=400",
      color: "#8A4FFF",
      tags: ["Development", "Interactive Media"]
    },
    {
      id: "project-devsnip",
      title: "Project DevSnip",
      image: "/placeholder.svg?height=300&width=400",
      color: "#6ECBF5",
      tags: ["Development", "Design", "Professional standard"]
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

      <div className="absolute top-4 right-8 z-10">
        <div className="flex gap-8">
        {/* <Link href="#">
          <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M135.2 117.4L109.1 192l293.8 0-26.1-74.6C372.3 104.6 360.2 96 346.6 96L165.4 96c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32l181.2 0c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2l0 144 0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L96 400l0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L0 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
        </Link> */}
      <Link href="https://github.com/LKosters/portfolio-media" target="_blank">
        <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
      </Link>
        </div>
      </div>


      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        <p>Gebruik SPACE om tricks te doen en SHIFT om een speed boost te krijgen.</p>
        <p>Probeer de hoogste score te halen en zet je naam in de leaderboard!</p>
        <p>Gemaakt door Laurens Kosters, <a href="https://laurenskosters.nl/" target="_blank" className="text-blue-500">https://laurenskosters.nl/</a></p>
      </div>
    </main>
  )
}
