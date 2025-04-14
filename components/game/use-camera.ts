"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { CameraState } from "./types"
import { easeOutQuart, easeInOutQuart } from "./constants"

const initialCameraState: CameraState = {
  y: 0,
  targetY: 0,
  isMoving: false,
  viewingProject: null,
  contentScrollY: 0,
  animationProgress: 0,
  animationDuration: 60,
  startY: 0
}

export function useCamera() {
  const [camera, setCamera] = useState<CameraState>(initialCameraState)
  const cameraRef = useRef<CameraState>(initialCameraState)
  const previousAnimationRef = useRef<number>(0)

  // Update cameraRef when camera state changes
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  // Handle mouse wheel for scrolling content
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (cameraRef.current.viewingProject !== null) {
        e.preventDefault()
        setCamera(prev => ({
          ...prev,
          contentScrollY: Math.max(0, prev.contentScrollY + e.deltaY)
        }))
      }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  // Handle mouse click for closing portfolio content
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cameraRef.current.viewingProject !== null) {
        const canvas = document.querySelector('canvas')
        if (!canvas) return
        
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        // Check if close button was clicked
        if (x > canvas.width - 100 && x < canvas.width - 70 && y > 60 && y < 90) {
          // Reset camera position with animation
          setCamera(prev => ({
            ...prev,
            targetY: 0,
            isMoving: true,
            viewingProject: null,
            contentScrollY: 0,
            animationProgress: 0,
            startY: prev.y
          }))
        }
      }
    }
    
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Function to update camera position with animation - memoize to avoid creating new function references
  const updateCameraAnimation = useCallback(() => {
    if (!cameraRef.current.isMoving) return

    const newProgress = cameraRef.current.animationProgress + 1
    if (newProgress === previousAnimationRef.current) return

    previousAnimationRef.current = newProgress
    const progress = newProgress / cameraRef.current.animationDuration
    
    if (progress >= 1) {
      setCamera(prev => ({
        ...prev,
        y: prev.targetY,
        isMoving: false,
        animationProgress: 0
      }))
    } else {
      const easedProgress = cameraRef.current.targetY > cameraRef.current.y 
        ? easeOutQuart(progress)
        : easeInOutQuart(progress)
      
      const newY = cameraRef.current.startY + 
        (cameraRef.current.targetY - cameraRef.current.startY) * easedProgress

      setCamera(prev => ({
        ...prev,
        y: newY,
        animationProgress: newProgress
      }))
    }
  }, [])

  const viewProject = useCallback((projectId: string | null) => {
    if (projectId === null) {
      setCamera(prev => ({
        ...prev,
        targetY: 0,
        isMoving: true,
        viewingProject: null,
        contentScrollY: 0,
        animationProgress: 0,
        startY: prev.y
      }))
    } else {
      if (cameraRef.current.viewingProject !== projectId) {
        setCamera(prev => ({
          ...prev,
          targetY: -1000,
          isMoving: true,
          viewingProject: projectId,
          animationProgress: 0,
          startY: prev.y
        }))
      }
    }
  }, [])

  return { 
    camera, 
    cameraRef, 
    setCamera, 
    updateCameraAnimation,
    viewProject
  }
} 