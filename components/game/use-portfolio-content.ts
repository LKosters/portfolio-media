"use client"

import { useState, useEffect, useRef } from "react"

export function usePortfolioContent() {
  const [portfolioContent, setPortfolioContent] = useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeProjectTitle, setActiveProjectTitle] = useState<string>("")
  const [activeProjectColor, setActiveProjectColor] = useState<string | undefined>(undefined)
  const [activeProjectTags, setActiveProjectTags] = useState<string[]>([])
  const prevProjectRef = useRef<string | null>(null)

  // Load portfolio content
  useEffect(() => {
    // Only load content if the project ID has changed
    if (activeProjectId !== prevProjectRef.current) {
      prevProjectRef.current = activeProjectId
      
      if (activeProjectId) {
        const loadPortfolioContent = async (id: string) => {
          setIsLoadingContent(true)
          try {
            console.log("Loading portfolio content for:", id)
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
        
        loadPortfolioContent(activeProjectId)
      } else {
        // Reset content when project is closed
        setPortfolioContent("")
      }
    }
  }, [activeProjectId])

  const viewProject = (projectId: string | null, projectTitle: string = "", projectColor?: string, projectTags: string[] = []) => {
    if (projectId) {
      setActiveProjectId(projectId)
      setActiveProjectTitle(projectTitle)
      setActiveProjectColor(projectColor)
      setActiveProjectTags(projectTags)
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }

  const closeProject = () => {
    setIsModalOpen(false)
    // Don't clear activeProjectId immediately to prevent content flashing
    // It will be cleared when a new project is selected
  }

  return { 
    portfolioContent, 
    isLoadingContent, 
    isModalOpen, 
    activeProjectId,
    activeProjectTitle,
    activeProjectColor,
    activeProjectTags,
    viewProject, 
    closeProject 
  }
} 