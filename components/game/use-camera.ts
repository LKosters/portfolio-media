"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { CameraState } from "./types"
import { easeOutQuart, easeInOutQuart } from "./constants"

const initialCameraState: CameraState = {
  y: 0,
  targetY: 0,
  isMoving: false,
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
      // No longer needed for portfolio view
    }
    
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
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

  return { 
    camera, 
    cameraRef, 
    setCamera, 
    updateCameraAnimation
  }
} 