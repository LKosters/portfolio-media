"use client"

import { useEffect, useRef, useCallback } from "react"
import { 
  GameCanvasProps,
  useCamera,
  useCarPhysics,
  useGameImages,
  useGameObjects,
  usePortfolioContent,
  drawBackground,
  drawRoad,
  drawRocks,
  drawWelcomeSign,
  drawButtons,
  drawCar,
  drawSpeedometer,
  drawComboMeter,
  getCameraX,
  drawPortfolioView
} from "./game"

export default function GameCanvas({ onProjectSelect, projects }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { camera, cameraRef, updateCameraAnimation, viewProject } = useCamera()
  const { gameObjects, rocks, updateHoverState } = useGameObjects(projects)
  const { car, setCar } = useCarPhysics(gameObjects, rocks)
  const { images, debugInfo } = useGameImages()
  const { portfolioContent, isLoadingContent } = usePortfolioContent(camera)

  // Memoize the onProjectSelect handler to avoid unnecessary rerenders
  const handleProjectSelect = useCallback((projectId: string) => {
    onProjectSelect(projectId)
  }, [onProjectSelect])

  // Handle window resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Check for project selection
  useEffect(() => {
    // Check for crouching on portfolio items
    if (car.isCrouching && car.selectedProjectId !== null && !cameraRef.current.viewingProject) {
      // Move camera to sky position with animation
      viewProject(car.selectedProjectId)
      
      // Reset car state
      setCar(prev => ({
        ...prev,
        isCrouching: false
      }))
    }
  }, [car.isCrouching, car.selectedProjectId, setCar, viewProject])

  // Notify parent component about project selection
  useEffect(() => {
    if (car.selectedProjectId) {
      handleProjectSelect(car.selectedProjectId)
    }
  }, [car.selectedProjectId, handleProjectSelect])

  // Update hover states based on car position - but don't add car as a dependency
  // to avoid infinite loops. The updateHoverState function will check internally
  // if it needs to update based on car position
  useEffect(() => {
    if (car) {
      updateHoverState(car, setCar)
    }
  }, [updateHoverState, car.x, car.y, setCar])

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update camera position with easing
      updateCameraAnimation()

      // Calculate camera position
      const cameraX = getCameraX(car.x)
      const cameraY = cameraRef.current.y

      // Draw game elements
      drawBackground(ctx, canvas, images.background, cameraX, cameraY)
      drawRoad(ctx, canvas, images.road, cameraX, cameraY)
      drawRocks(ctx, canvas, rocks, cameraX, cameraY)
      drawWelcomeSign(ctx, canvas, cameraX, cameraY)
      drawButtons(ctx, canvas, gameObjects, cameraX, cameraY)
      drawCar(ctx, canvas, car, images.car, images.crouch, images.crash, cameraX, cameraY)
      drawSpeedometer(ctx, canvas, car)
      drawComboMeter(ctx, car)

      // Draw portfolio content if viewing a project
      drawPortfolioView(ctx, canvas, camera, portfolioContent, isLoadingContent)

      // Draw debug info
      if (debugInfo) {
        ctx.fillStyle = "white"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(debugInfo, 10, 20)
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [
    updateCameraAnimation, 
    cameraRef, 
    camera, 
    images, 
    portfolioContent, 
    isLoadingContent,
    car,
    gameObjects,
    rocks,
    debugInfo
  ])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
