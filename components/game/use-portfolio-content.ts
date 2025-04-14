"use client"

import { useState, useEffect, useRef } from "react"
import { CameraState } from "./types"

export function usePortfolioContent(camera: CameraState) {
  const [portfolioContent, setPortfolioContent] = useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const prevProjectRef = useRef<string | null>(null)

  // Load portfolio content
  useEffect(() => {
    const projectId = camera.viewingProject
    // Only load content if the project ID has changed
    if (projectId !== prevProjectRef.current) {
      prevProjectRef.current = projectId
      
      if (projectId) {
        const loadPortfolioContent = async (id: string) => {
          setIsLoadingContent(true)
          try {
            const response = await fetch(`/api/portfolio/${id}`)
            if (!response.ok) throw new Error("Failed to load content")
            const data = await response.json()
            setPortfolioContent(data.content)
          } catch (error) {
            console.error("Error loading portfolio content:", error)
            setPortfolioContent("Failed to load content")
          } finally {
            setIsLoadingContent(false)
          }
        }
        
        loadPortfolioContent(projectId)
      } else {
        // Reset content when project is closed
        setPortfolioContent("")
      }
    }
  }, [camera.viewingProject])

  return { portfolioContent, isLoadingContent }
} 