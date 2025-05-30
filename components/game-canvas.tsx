"use client"

import { useEffect, useRef, useCallback, useState, KeyboardEvent } from "react"
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
  drawHighScore,
  getCameraX,
} from "./game"
import { HighScoreModal } from "./game/high-score-modal"
import { PortfolioModal } from "./game/portfolio-modal"

export default function GameCanvas({ onProjectSelect, projects, learningOutcomes }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { camera, cameraRef, updateCameraAnimation } = useCamera()
  const { gameObjects, rocks, updateHoverState, boundaries } = useGameObjects(projects, learningOutcomes)
  const { car, setCar } = useCarPhysics(gameObjects, rocks, {
    leftBoundary: boundaries.leftBoundary,
    rightBoundary: boundaries.rightBoundary
  })
  const { images, debugInfo } = useGameImages()
  const { 
    portfolioContent, 
    isLoadingContent, 
    isModalOpen, 
    activeProjectId, 
    activeProjectTitle,
    activeProjectColor,
    activeProjectTags,
    viewProject, 
    closeProject 
  } = usePortfolioContent()
  const [isHighScoreModalOpen, setIsHighScoreModalOpen] = useState(false)

  // Add event listener for canvas clicks to detect info icon clicks
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if the click is on the info icon
      const infoIcon = (window as any).infoIconHitbox
      if (infoIcon && 
          x >= infoIcon.x && 
          x <= infoIcon.x + infoIcon.width &&
          y >= infoIcon.y && 
          y <= infoIcon.y + infoIcon.height) {
        // Handle info icon click
        infoIcon.onClick()
      }
    }

    canvas.addEventListener('click', handleCanvasClick)

    return () => {
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [])

  // Memoize the onProjectSelect handler to avoid unnecessary rerenders
  const handleProjectSelect = useCallback((projectId: string) => {
    onProjectSelect(projectId)
  }, [onProjectSelect])

  // Handle opening the high score modal
  const handleInfoClick = useCallback(() => {
    setIsHighScoreModalOpen(true)
  }, [])

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

  // Custom getCameraX function using dynamic boundaries
  const getDynamicCameraX = useCallback((carX: number): number => {
    return Math.max(
      boundaries.cameraLeftBoundary, 
      Math.min(boundaries.cameraRightBoundary, carX)
    )
  }, [boundaries.cameraLeftBoundary, boundaries.cameraRightBoundary])

  // Helper to get project title from ID
  const getProjectTitle = useCallback((projectId: string | null) => {
    if (!projectId) return "";
    
    // Find the project in either projects or learningOutcomes array
    const project = [...projects, ...learningOutcomes].find(p => p.id === projectId);
    return project ? project.title : "";
  }, [projects, learningOutcomes]);

  // Helper to get project color from ID
  const getProjectColor = useCallback((projectId: string | null) => {
    if (!projectId) return undefined;
    const project = [...projects, ...learningOutcomes].find(p => p.id === projectId);
    return project ? project.color : undefined;
  }, [projects, learningOutcomes]);

  // Helper to get project tags from ID
  const getProjectTags = useCallback((projectId: string | null) => {
    if (!projectId) return [];
    const project = [...projects, ...learningOutcomes].find(p => p.id === projectId);
    return project?.tags || [];
  }, [projects, learningOutcomes]);

  // Check for project selection
  useEffect(() => {
    // Check for crouching on portfolio items
    if (car.isCrouching && car.selectedProjectId !== null) {
      // Get the project title
      const title = getProjectTitle(car.selectedProjectId);
      const color = getProjectColor(car.selectedProjectId);
      const tags = getProjectTags(car.selectedProjectId);
      // Open the portfolio modal
      viewProject(car.selectedProjectId, title, color, tags);
      // Reset car state
      setCar(prev => ({
        ...prev,
        isCrouching: false
      }))
    }
  }, [car.isCrouching, car.selectedProjectId, setCar, viewProject, getProjectTitle, getProjectColor, getProjectTags])

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

      // Calculate camera position using dynamic boundaries
      const cameraX = getDynamicCameraX(car.x)
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
      drawHighScore(ctx, canvas, car.highScore, handleInfoClick)

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
    car,
    gameObjects,
    rocks,
    debugInfo,
    handleInfoClick,
    getDynamicCameraX
  ])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isHighScoreModalOpen) {
          setIsHighScoreModalOpen(false)
        }
        if (isModalOpen) {
          closeProject()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown as any)
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any)
    }
  }, [isHighScoreModalOpen, isModalOpen, closeProject])

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" />
      <HighScoreModal 
        isOpen={isHighScoreModalOpen} 
        onClose={() => setIsHighScoreModalOpen(false)}
        currentScore={car.highScore}
      />
      <PortfolioModal
        isOpen={isModalOpen}
        onClose={closeProject}
        projectId={activeProjectId}
        projectTitle={activeProjectTitle}
        content={portfolioContent}
        isLoading={isLoadingContent}
        backgroundColor={getProjectColor(activeProjectId)}
        tags={activeProjectTags}
      />
    </>
  )
}
