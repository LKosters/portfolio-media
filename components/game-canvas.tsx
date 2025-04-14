"use client"

import { useEffect, useRef, useState } from "react"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"

interface Project {
  id: string
  title: string
  image: string
  color: string
}

interface GameCanvasProps {
  onProjectSelect: (projectId: string) => void
  projects: Project[]
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  id: string
  title: string
  color: string
  hovered: boolean
}

interface Rock {
  x: number
  y: number
  width: number
  height: number
  id: number
}

interface CarState {
  x: number
  y: number
  velocityX: number
  velocityY: number
  isJumping: boolean
  isCrouching: boolean
  isCrashed: boolean
  direction: 1 | -1 // 1 for right, -1 for left
  wasInAir: boolean // Track if car was in the air in the previous frame
  isFlipping: boolean // Track if car is doing a front flip
  flipAngle: number // Current angle of the flip (0-360 degrees)
  isSpinning: boolean // Track if car is doing a 3D spin
  spinAngle: number // Current angle of the spin (0-360 degrees)
  spinAxis: 'x' | 'y' | 'z' // Axis of rotation for the 3D spin
  isDashing: boolean // Track if car is dashing
  dashCooldown: number // Cooldown timer for dash
  selectedProjectId: string | null // Track which project is selected
  combo: number // Current combo multiplier
  comboTimeLeft: number // Time left for the combo to expire
  lastTrickTime: number // Timestamp of the last trick performed
  airTime: number // Time spent in the air
  tricksPerformed: string[] // List of tricks performed in the current combo
  score: number
  scorePopups: Array<{
    value: number
    x: number
    y: number
    age: number
    opacity: number
  }>
}

// Add easing functions
const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4)
}

const easeInOutQuart = (x: number): number => {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

interface CameraState {
  y: number
  targetY: number
  isMoving: boolean
  viewingProject: string | null
  contentScrollY: number
  animationProgress: number
  animationDuration: number
  startY: number
}

const GRAVITY = 0.5
const JUMP_FORCE = -15
const ACCELERATION = 0.5 // How quickly the car speeds up
const MAX_VELOCITY = 20 // Maximum speed the car can reach
const FRICTION = 0.98 // How quickly the car slows down
const GROUND_LEVEL = 500
const CAR_WIDTH = 120
const CAR_HEIGHT = 60
const BUTTON_HEIGHT = 80
const BUTTON_WIDTH = 240
const BUTTON_Y = GROUND_LEVEL - 180 // Buttons hover above the ground
const START_POSITION_X = -200 // Starting X position for the car (adjusted for new welcome sign position)
const LEFT_BOUNDARY = -500 // Extended left boundary to allow driving into mountain area
const RIGHT_BOUNDARY = 2500 // Extended right boundary to allow driving into mountain area
const CAMERA_LEFT_BOUNDARY = 50 // Camera stops here, but car can go further left
const CAMERA_RIGHT_BOUNDARY = 1800 // Camera stops here, but car can go further right
const ROCK_WIDTH = 30
const ROCK_HEIGHT = 20
const FLIP_SPEED = 15 // Degrees per frame
const SPEEDOMETER_RADIUS = 80
const MAX_SPEED_MPH = 300 // Maximum speed on the speedometer (changed from 120 to 300)
const SPEED_MULTIPLIER = 15 // Adjusted to match new physics
const DASH_FORCE = 30 // Force applied when dashing
const DASH_DURATION = 10 // Duration of dash in frames
const DASH_COOLDOWN = 120 // Cooldown for dash in frames (2 seconds at 60fps)
const COMBO_TIMEOUT = 3000 // Time in ms before combo expires
const COMBO_MULTIPLIER_INCREASE = 0.5 // How much to increase the combo multiplier by
const MAX_COMBO_MULTIPLIER = 10 // Maximum combo multiplier
const SCORE_POPUP_LIFETIME = 60 // Frames the score popup will last
const TRICK_SCORES: Record<string, number> = {
  'Front Flip': 1000,
  'Side Flip': 1500,
  'Barrel Roll': 2000,
  'Speed Dash': 800
}

export default function GameCanvas({ onProjectSelect, projects }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<CameraState>({
    y: 0,
    targetY: 0,
    isMoving: false,
    viewingProject: null,
    contentScrollY: 0,
    animationProgress: 0,
    animationDuration: 60,
    startY: 0
  })
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [rocks, setRocks] = useState<Rock[]>([])
  const [camera, setCamera] = useState<CameraState>({
    y: 0,
    targetY: 0,
    isMoving: false,
    viewingProject: null,
    contentScrollY: 0,
    animationProgress: 0,
    animationDuration: 60,
    startY: 0
  })
  const [car, setCar] = useState<CarState>({
    x: START_POSITION_X,
    y: 100,
    velocityX: 0,
    velocityY: 5,
    isJumping: false,
    isCrouching: false,
    isCrashed: false,
    direction: 1,
    wasInAir: true,
    isFlipping: false,
    flipAngle: 0,
    isSpinning: false,
    spinAngle: 0,
    spinAxis: 'x',
    isDashing: false,
    dashCooldown: 0,
    selectedProjectId: null,
    combo: 1,
    comboTimeLeft: 0,
    lastTrickTime: 0,
    airTime: 0,
    tricksPerformed: [],
    score: 0,
    scorePopups: []
  })
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [portfolioContent, setPortfolioContent] = useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)

  // Load images
  const carImageRef = useRef<HTMLImageElement | null>(null)
  const crouchImageRef = useRef<HTMLImageElement | null>(null)
  const crashImageRef = useRef<HTMLImageElement | null>(null)
  const roadImageRef = useRef<HTMLImageElement | null>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)

  // Set up keyboard controls
  const { keys } = useKeyboardControls()

  // Initialize game objects (portfolio items) with fixed positions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Calculate fixed positions for buttons with proper spacing
    // Instead of using dynamic spacing, we'll position them at specific intervals
    const buttonPositions = [
      300, // First button position
      800, // Second button position
      1300, // Third button position
      1800, // Fourth button position
    ]

    const objects = projects.map((project, index) => ({
      id: project.id,
      title: project.title,
      x: buttonPositions[index] || index * 500 + 300, // Fallback if position not defined
      y: BUTTON_Y,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      color: project.color,
      hovered: false,
    }))

    setGameObjects(objects)

    // Initialize rocks
    const rockPositions = [
      1900 // Keep only the last rock position
    ]

    const rockObjects = rockPositions.map((x, index) => ({
      id: index + 100, // Use IDs starting from 100 to avoid conflicts with project IDs
      x,
      y: GROUND_LEVEL - ROCK_HEIGHT,
      width: ROCK_WIDTH,
      height: ROCK_HEIGHT,
    }))

    setRocks(rockObjects)
  }, [projects])

  // Load images - using direct blob URLs
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
        console.log("Crash image loaded:", crashImageRef.current?.complete, crashImageRef.current?.width, crashImageRef.current?.height)
        roadImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/road-LWGFReX6L3YEgnbn7JZuLsH9p7RNIw.png",
          "road.png",
        )
        bgImageRef.current = await loadImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg1.jpg-98F7BXTMNi32nQNYUpjqqVligqpz4P.jpeg",
          "bg1.jpeg",
        )

        // setDebugInfo(
        //   `Road image loaded: ${roadImageRef.current?.complete}, width: ${roadImageRef.current?.width}, height: ${roadImageRef.current?.height}`,
        // )
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

  // Load portfolio content
  useEffect(() => {
    const loadPortfolioContent = async (projectId: string) => {
      setIsLoadingContent(true)
      try {
        const response = await fetch(`/api/portfolio/${projectId}`)
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

    if (camera.viewingProject !== null) {
      loadPortfolioContent(camera.viewingProject)
    }
  }, [camera.viewingProject])

  // Update cameraRef when camera state changes
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  // Update the game loop
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
      if (cameraRef.current.isMoving) {
        const newProgress = cameraRef.current.animationProgress + 1
        const progress = newProgress / cameraRef.current.animationDuration
        
        if (progress >= 1) {
          // Animation complete
          setCamera(prev => ({
            ...prev,
            y: prev.targetY,
            isMoving: false,
            animationProgress: 0
          }))
        } else {
          // Apply easing based on direction
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
      }

      // Draw background
      if (bgImageRef.current && bgImageRef.current.complete) {
        const bgWidth = canvas.width
        const bgHeight = canvas.height
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
        const parallaxOffset = (cameraX * 0.1) % bgWidth

        // Draw background layers with camera offset
        ctx.drawImage(bgImageRef.current, -parallaxOffset, -cameraRef.current.y, bgWidth, bgHeight)
        ctx.drawImage(bgImageRef.current, bgWidth - parallaxOffset, -cameraRef.current.y, bgWidth, bgHeight)
      } else {
        // Fallback background
        ctx.fillStyle = "#87CEEB" // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7)
      }

      // Draw grass
      ctx.fillStyle = "#4CAF50" // Green
      ctx.fillRect(0, GROUND_LEVEL - 20 - cameraRef.current.y, canvas.width, 70)

      // Draw road with repeating pattern
      if (roadImageRef.current && roadImageRef.current.complete) {
        const roadHeight = 50
        const roadY = GROUND_LEVEL - cameraRef.current.y
        const roadWidth = roadImageRef.current.width || 100
        const repeats = Math.ceil(canvas.width / roadWidth) + 1
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))

        for (let i = 0; i < repeats; i++) {
          const xPos = i * roadWidth - (cameraX % roadWidth)
          ctx.drawImage(roadImageRef.current, xPos, roadY, roadWidth, roadHeight)
        }
      }

      // Draw rocks
      rocks.forEach(rock => {
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
        const rockX = rock.x - cameraX + canvas.width / 2
        
        if (rockX > -rock.width && rockX < canvas.width) {
          ctx.fillStyle = "#8B4513" // Brown
          ctx.beginPath()
          ctx.moveTo(rockX, rock.y - cameraRef.current.y)
          ctx.lineTo(rockX + rock.width, rock.y - cameraRef.current.y)
          ctx.lineTo(rockX + rock.width / 2, rock.y - rock.height - cameraRef.current.y)
          ctx.closePath()
          ctx.fill()
          
          // Add some texture
          ctx.fillStyle = "#A0522D" // Slightly lighter brown
          ctx.beginPath()
          ctx.moveTo(rockX + rock.width / 4, rock.y - rock.height / 2 - cameraRef.current.y)
          ctx.lineTo(rockX + rock.width * 3/4, rock.y - rock.height / 2 - cameraRef.current.y)
          ctx.lineTo(rockX + rock.width / 2, rock.y - rock.height * 3/4 - cameraRef.current.y)
          ctx.closePath()
          ctx.fill()
        }
      })

      // Draw ground
      ctx.fillStyle = "#8B4513" // Brown
      ctx.fillRect(0, GROUND_LEVEL + 50 - cameraRef.current.y, canvas.width, canvas.height - GROUND_LEVEL)

      // Draw screen borders
      ctx.fillStyle = "#000000" // Black
      ctx.fillRect(0, 0, 10, canvas.height) // Left border
      ctx.fillRect(canvas.width - 10, 0, 10, canvas.height) // Right border

      // Draw welcome text at starting position
      const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
      const welcomeX = START_POSITION_X - cameraX + canvas.width / 2
      if (welcomeX > -500 && welcomeX < canvas.width) {
        // Draw welcome sign
        ctx.fillStyle = "#000000" // Black shadow
        ctx.fillRect(welcomeX - 204, GROUND_LEVEL - 350 - cameraRef.current.y, 504, 154)

        ctx.fillStyle = "#FFD700" // Gold background
        ctx.fillRect(welcomeX - 200, GROUND_LEVEL - 354 - cameraRef.current.y, 500, 150)

        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 4
        ctx.strokeRect(welcomeX - 200, GROUND_LEVEL - 354 - cameraRef.current.y, 500, 150)

        // Draw welcome text
        ctx.fillStyle = "#000000"
        ctx.font = "bold 24px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("WELCOME TO MY PORTFOLIO", welcomeX + 50, GROUND_LEVEL - 314 - cameraRef.current.y)

        // Draw instructions
        ctx.font = "16px monospace"
        ctx.fillText("Use arrow keys or WASD to move, W to jump", welcomeX + 50, GROUND_LEVEL - 274 - cameraRef.current.y)
        ctx.fillText("Crouch on a project button to view its content", welcomeX + 50, GROUND_LEVEL - 244 - cameraRef.current.y)
      }

      // Button component
      gameObjects.forEach((obj) => {
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
        const buttonX = obj.x - cameraX + canvas.width / 2

        if (buttonX > -obj.width && buttonX < canvas.width) {
          // Draw button shadow (black outline with offset)
          ctx.fillStyle = "#000000"
          ctx.fillRect(buttonX - 4, obj.y + 4 - cameraRef.current.y, obj.width + 8, obj.height)

          // Draw button
          ctx.fillStyle = obj.color
          ctx.fillRect(buttonX, obj.y - cameraRef.current.y, obj.width, obj.height)

          // Draw button border
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 4
          ctx.strokeRect(buttonX, obj.y - cameraRef.current.y, obj.width, obj.height)

          // Draw title with pixel font style
          ctx.fillStyle = "white"
          ctx.font = "bold 20px monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // Draw text with pixel effect
          const title = obj.title
          const textX = buttonX + obj.width / 2
          const textY = obj.y + obj.height / 2 - cameraRef.current.y

          ctx.fillText(title, textX, textY)

          // Draw hover effect if the button is being hovered
          if (obj.hovered) {
            ctx.strokeStyle = "#FFFFFF"
            ctx.lineWidth = 2
            ctx.strokeRect(buttonX + 4, obj.y + 4 - cameraRef.current.y, obj.width - 8, obj.height - 8)
          }
        }
      })

      // Draw car
      let carImage = carImageRef.current
      if (car.isCrashed && crashImageRef.current && crashImageRef.current.complete) {
        carImage = crashImageRef.current
      } else if (car.isCrouching && crouchImageRef.current && crouchImageRef.current.complete) {
        carImage = crouchImageRef.current
      }

      if (carImage && carImage.complete) {
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
        const carScreenX = canvas.width / 2 + (car.x - cameraX)

        // Draw score popups
        car.scorePopups.forEach(popup => {
          ctx.save()
          ctx.fillStyle = `rgba(255, 255, 0, ${popup.opacity})`
          ctx.strokeStyle = `rgba(0, 0, 0, ${popup.opacity})`
          ctx.lineWidth = 2
          ctx.font = "bold 24px monospace"
          ctx.textAlign = "center"
          const text = `+${popup.value.toLocaleString()}`
          ctx.strokeText(text, popup.x, popup.y - popup.age * 0.5)
          ctx.fillText(text, popup.x, popup.y - popup.age * 0.5)
          ctx.restore()
        })

        // Draw total score
        ctx.save()
        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 3
        ctx.font = "bold 28px monospace"
        ctx.textAlign = "center"
        const scoreText = car.score.toLocaleString()
        const scoreX = carScreenX + CAR_WIDTH / 2
        const scoreY = car.y - 40 - cameraRef.current.y
        if (car.score > 0) {
          ctx.strokeText(scoreText, scoreX, scoreY)
          ctx.fillText(scoreText, scoreX, scoreY)
        }
        ctx.restore()

        if (car.isFlipping) {
          ctx.save()
          ctx.translate(carScreenX + CAR_WIDTH / 2, car.y + CAR_HEIGHT / 2 - cameraRef.current.y)
          ctx.rotate((car.flipAngle * Math.PI) / 180)
          if (car.direction === -1) {
            ctx.drawImage(carImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
          } else {
            ctx.scale(-1, 1)
            ctx.drawImage(carImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
          }
          ctx.restore()
        } else if (car.isSpinning) {
          ctx.save()
          ctx.translate(carScreenX + CAR_WIDTH / 2, car.y + CAR_HEIGHT / 2 - cameraRef.current.y)
          
          // Apply 3D spin effect based on the spin axis
          if (car.spinAxis === 'x') {
            // Rotate around X axis (front-to-back)
            ctx.rotate((car.spinAngle * Math.PI) / 180)
          } else if (car.spinAxis === 'y') {
            // Rotate around Y axis (side-to-side)
            ctx.scale(1, Math.cos((car.spinAngle * Math.PI) / 180))
          } else if (car.spinAxis === 'z') {
            // Rotate around Z axis (top-to-bottom)
            ctx.rotate((car.spinAngle * Math.PI) / 180)
            ctx.scale(Math.cos((car.spinAngle * Math.PI) / 180), 1)
          }
          
          // Draw the car centered at the rotation point
          if (car.direction === -1) {
            ctx.drawImage(carImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
          } else {
            ctx.scale(-1, 1)
            ctx.drawImage(carImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
          }
          
          ctx.restore()
        } else {
          if (car.direction === -1) {
            ctx.drawImage(carImage, carScreenX, car.y - cameraRef.current.y, CAR_WIDTH, CAR_HEIGHT)
          } else {
            ctx.save()
            ctx.translate(carScreenX + CAR_WIDTH, car.y - cameraRef.current.y)
            ctx.scale(-1, 1)
            ctx.drawImage(carImage, 0, 0, CAR_WIDTH, CAR_HEIGHT)
            ctx.restore()
          }
        }
      } else {
        // Fallback car drawing
        const cameraX = Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, car.x))
        const carScreenX = canvas.width / 2 + (car.x - cameraX)
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(carScreenX, car.y - cameraRef.current.y, CAR_WIDTH, CAR_HEIGHT)
      }

      // Draw debug info
      if (debugInfo) {
        ctx.fillStyle = "white"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(debugInfo, 10, 20)
      }

      // Draw speedometer
      const speedometerX = canvas.width - 150
      const speedometerY = canvas.height - 150
      const currentSpeedMph = Math.abs(car.velocityX * SPEED_MULTIPLIER)

      // Draw speedometer background
      ctx.beginPath()
      ctx.arc(speedometerX, speedometerY, SPEEDOMETER_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = "#000033"
      ctx.fill()
      ctx.strokeStyle = "#CCCCCC"
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw speed markings
      ctx.font = "14px monospace"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      
      // Draw speed numbers
      for (let i = 0; i <= MAX_SPEED_MPH; i += 50) {
        const angle = (i / MAX_SPEED_MPH) * Math.PI + Math.PI
        const markerX = speedometerX + Math.cos(angle) * (SPEEDOMETER_RADIUS - 25)
        const markerY = speedometerY + Math.sin(angle) * (SPEEDOMETER_RADIUS - 25)
        ctx.fillText(i.toString(), markerX, markerY)
      }

      // Draw needle
      const needleAngle = (currentSpeedMph / MAX_SPEED_MPH) * Math.PI + Math.PI
      ctx.beginPath()
      ctx.moveTo(speedometerX, speedometerY)
      ctx.lineTo(
        speedometerX + Math.cos(needleAngle) * (SPEEDOMETER_RADIUS - 15),
        speedometerY + Math.sin(needleAngle) * (SPEEDOMETER_RADIUS - 15)
      )
      ctx.strokeStyle = "#FF0000"
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw center cap
      ctx.beginPath()
      ctx.arc(speedometerX, speedometerY, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#CCCCCC"
      ctx.fill()

      // Draw MPH text
      ctx.font = "12px monospace"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText("MPH", speedometerX, speedometerY + 20)

      // Draw digital speed
      ctx.font = "16px monospace"
      ctx.fillStyle = "#FFFFFF"
      ctx.fillText(Math.round(currentSpeedMph).toString(), speedometerX, speedometerY - 20)

      // Draw portfolio content in the sky if viewing a project
      if (cameraRef.current.viewingProject !== null) {
        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#001F3F')  // Dark blue at top
        gradient.addColorStop(0.5, '#0074D9') // Medium blue in middle
        gradient.addColorStop(1, '#7FDBFF')   // Light blue at bottom
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw stars
        ctx.fillStyle = '#FFFFFF'
        for (let i = 0; i < 100; i++) {
          const x = (Math.sin(i * 567) + 1) * canvas.width / 2
          const y = (Math.cos(i * 321) + 1) * canvas.height / 2
          const size = (Math.sin(i * 123) + 1) * 1.5 + 0.5 // Range: 0.5 to 3.5
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        const time = Date.now() / 3000
        for (let i = 0; i < 5; i++) {
          const x = ((time + i * 1.5) % 2) * (canvas.width + 200) - 100 // Move from left to right
          const y = 100 + i * 60 // Space clouds vertically
          
          // Draw cloud shape using multiple overlapping circles
          ctx.beginPath()
          ctx.arc(x, y, 25, 0, Math.PI * 2)
          ctx.arc(x + 20, y - 10, 20, 0, Math.PI * 2)
          ctx.arc(x + 20, y + 10, 20, 0, Math.PI * 2)
          ctx.arc(x + 40, y, 25, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw content panel with semi-transparent background
        ctx.fillStyle = "rgba(0, 31, 63, 0.85)"
        ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)
        
        // Draw a glowing border
        ctx.strokeStyle = "#7FDBFF"
        ctx.lineWidth = 4
        ctx.shadowColor = "#7FDBFF"
        ctx.shadowBlur = 15
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
        ctx.shadowBlur = 0

        // Draw a close button
        ctx.fillStyle = "#FF4136"
        ctx.fillRect(canvas.width - 100, 60, 30, 30)
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.strokeRect(canvas.width - 100, 60, 30, 30)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 20px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("X", canvas.width - 85, 75)

        // Create a clipping region for the content
        ctx.save()
        ctx.beginPath()
        ctx.rect(60, 100, canvas.width - 120, canvas.height - 160)
        ctx.clip()

        // Draw the content
        if (isLoadingContent) {
          // Draw loading indicator
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 24px monospace"
          ctx.textAlign = "center"
          ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2)
        } else {
          // Draw the markdown content
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "16px monospace"
          ctx.textAlign = "left"
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 2
          
          // Simple markdown rendering with scroll offset
          const lines = portfolioContent.split('\n')
          let y = 100 - cameraRef.current.contentScrollY
          
          for (const line of lines) {
            // Only render lines that are within the visible area
            if (y > 60 && y < canvas.height - 60) {
              if (line.startsWith('# ')) {
                // Heading
                ctx.font = "bold 32px monospace"
                ctx.fillStyle = "#7FDBFF"
                ctx.fillText(line.substring(2), 80, y)
                y += 50
              } else if (line.startsWith('## ')) {
                // Subheading
                ctx.font = "bold 24px monospace"
                ctx.fillStyle = "#7FDBFF"
                ctx.fillText(line.substring(3), 80, y)
                y += 40
              } else if (line.startsWith('- ')) {
                // Bullet point
                ctx.font = "16px monospace"
                ctx.fillStyle = "#FFFFFF"
                ctx.fillText("• " + line.substring(2), 80, y)
                y += 25
              } else if (line.trim() === '') {
                // Empty line
                y += 20
              } else {
                // Regular text
                ctx.font = "16px monospace"
                ctx.fillStyle = "#FFFFFF"
                
                // Word wrap
                const words = line.split(' ')
                let currentLine = ''
                
                for (const word of words) {
                  const testLine = currentLine + word + ' '
                  const metrics = ctx.measureText(testLine)
                  
                  if (metrics.width > canvas.width - 160) {
                    if (y > 60 && y < canvas.height - 60) {
                      ctx.fillText(currentLine, 80, y)
                    }
                    currentLine = word + ' '
                    y += 25
                  } else {
                    currentLine = testLine
                  }
                }
                
                if (currentLine && y > 60 && y < canvas.height - 60) {
                  ctx.fillText(currentLine, 80, y)
                }
                y += 25
              }
            } else {
              // Skip rendering but still update y position
              if (line.startsWith('# ')) {
                y += 50
              } else if (line.startsWith('## ')) {
                y += 40
              } else if (line.trim() === '') {
                y += 20
              } else {
                y += 25
              }
            }
          }

          // Draw scroll indicators if there's more content
          if (cameraRef.current.contentScrollY > 0) {
            ctx.fillStyle = "rgba(127, 219, 255, 0.5)"
            ctx.beginPath()
            ctx.moveTo(canvas.width / 2 - 10, 70)
            ctx.lineTo(canvas.width / 2 + 10, 70)
            ctx.lineTo(canvas.width / 2, 60)
            ctx.closePath()
            ctx.fill()
          }
          
          if (y + cameraRef.current.contentScrollY > canvas.height - 60) {
            ctx.fillStyle = "rgba(127, 219, 255, 0.5)"
            ctx.beginPath()
            ctx.moveTo(canvas.width / 2 - 10, canvas.height - 70)
            ctx.lineTo(canvas.width / 2 + 10, canvas.height - 70)
            ctx.lineTo(canvas.width / 2, canvas.height - 60)
            ctx.closePath()
            ctx.fill()
          }
        }
        ctx.restore()
      }

      // Draw combo meter
      if (car.combo > 1) {
        // Draw combo background
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
        ctx.fillRect(20, 20, 150, 80)
        
        // Draw combo text and multiplier
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 20px monospace"
        ctx.textAlign = "left"
        ctx.fillText("COMBO", 30, 45)
        ctx.fillText(`x${car.combo.toFixed(1)}`, 100, 45)
        
        // Draw combo timer bar
        const timeLeftPercent = car.comboTimeLeft / COMBO_TIMEOUT
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(30, 55, 130 * timeLeftPercent, 5)
        
        // Draw tricks performed (last 3 only)
        ctx.font = "12px monospace"
        const lastThreeTricks = car.tricksPerformed.slice(-3)
        lastThreeTricks.forEach((trick, index) => {
          // Latest trick is highlighted in blue
          if (index === lastThreeTricks.length - 1) {
            ctx.fillStyle = "#00FFFF"
          } else {
            ctx.fillStyle = "#FFFFFF"
          }
          ctx.fillText(trick, 30, 70 + index * 12)
        })
      }

      // Check for crouching on portfolio items
      if (car.isCrouching && car.selectedProjectId !== null && !cameraRef.current.viewingProject) {
        // Move camera to sky position with animation
        setCamera(prev => ({
          ...prev,
          targetY: -1000,
          isMoving: true,
          viewingProject: car.selectedProjectId,
          animationProgress: 0,
          startY: prev.y
        }))
        
        // Reset car state
        setCar(prev => ({
          ...prev,
          isCrouching: false
        }))
      }

      // Update combo timer and check for expiration
      if (car.comboTimeLeft <= 0 && car.combo > 1) {
        // Add final score popup before resetting
        if (car.score > 0) {
          car.scorePopups.push({
            value: car.score,
            x: car.x + CAR_WIDTH / 2,
            y: car.y - 40,
            age: 0,
            opacity: 1
          })
        }
        // Reset combo and score when timer runs out
        car.combo = 1
        car.tricksPerformed = []
        car.score = 0
      }
      
      // Reset combo when landing or crashing
      if ((car.y >= GROUND_LEVEL - CAR_HEIGHT && car.wasInAir) || car.isCrashed) {
        if (car.combo > 1) {
          // Add final score popup before resetting
          if (car.score > 0) {
            car.scorePopups.push({
              value: car.score,
              x: car.x + CAR_WIDTH / 2,
              y: car.y - 40,
              age: 0,
              opacity: 1
            })
          }
          // Show final combo score in console
          console.log(`Final combo: ${car.combo.toFixed(1)}x with ${car.tricksPerformed.length} tricks!`)
          car.combo = 1
          car.comboTimeLeft = 0
          car.tricksPerformed = []
          car.score = 0
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [car, gameObjects, rocks, debugInfo])

  // Handle physics and controls
  useEffect(() => {
    const updatePhysics = () => {
      setCar((prevCar) => {
        let newVelocityX = prevCar.velocityX
        let newVelocityY = prevCar.velocityY
        let newX = prevCar.x
        let newY = prevCar.y
        let newDirection = prevCar.direction
        let isJumping = prevCar.isJumping
        const isCrouching = keys.down
        let isCrashed = prevCar.isCrashed
        let wasInAir = prevCar.wasInAir
        let isFlipping = prevCar.isFlipping
        let flipAngle = prevCar.flipAngle
        let isSpinning = prevCar.isSpinning
        let spinAngle = prevCar.spinAngle
        let spinAxis = prevCar.spinAxis
        let isDashing = prevCar.isDashing
        let dashCooldown = prevCar.dashCooldown > 0 ? prevCar.dashCooldown - 1 : 0
        let selectedProjectId = prevCar.selectedProjectId
        let combo = prevCar.combo
        let comboTimeLeft = prevCar.comboTimeLeft > 0 ? prevCar.comboTimeLeft - 16.67 : 0 // Decrease by ~16.67ms (60fps)
        let lastTrickTime = prevCar.lastTrickTime
        let airTime = prevCar.airTime
        let tricksPerformed = [...prevCar.tricksPerformed]
        let score = prevCar.score
        let scorePopups = prevCar.scorePopups
          .map(popup => ({
            ...popup,
            age: popup.age + 1,
            opacity: Math.max(0, 1 - popup.age / SCORE_POPUP_LIFETIME)
          }))
          .filter(popup => popup.opacity > 0)
        
        // Update air time when in the air
        if (newY < GROUND_LEVEL - CAR_HEIGHT) {
          airTime += 16.67 // Add ~16.67ms (60fps)
        } else {
          // Reset air time when landing
          airTime = 0
        }

        // Function to reset combo and score
        const resetComboAndScore = () => {
          if (combo > 1) {
            // Add final score popup before resetting
            if (score > 0) {
              scorePopups.push({
                value: score,
                x: newX + CAR_WIDTH / 2,
                y: newY - 40,
                age: 0,
                opacity: 1
              })
            }
            // Show final combo score
            console.log(`Final combo: ${combo.toFixed(1)}x with ${tricksPerformed.length} tricks!`)
            combo = 1
            comboTimeLeft = 0
            tricksPerformed = []
            score = 0
          }
        }

        // Check for combo expiration
        if (comboTimeLeft <= 0) {
          resetComboAndScore()
        }
        
        // Reset combo when landing or crashing
        if ((newY >= GROUND_LEVEL - CAR_HEIGHT && prevCar.wasInAir) || isCrashed) {
          resetComboAndScore()
        }

        // Handle tricks and combos
        if (keys.jump && !isSpinning && !isFlipping && !isCrashed) {
          // Randomly choose a spin axis for variety
          const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
          spinAxis = axes[Math.floor(Math.random() * axes.length)]
          isSpinning = true
          spinAngle = 0
          
          // Add a small upward velocity to make the spin more dramatic
          newVelocityY = JUMP_FORCE * 0.3
          isJumping = true
          wasInAir = true
          
          // Update combo
          const now = Date.now()
          
          // Define trick names
          const trickNames = {
            'x': 'Front Flip',
            'y': 'Side Flip',
            'z': 'Barrel Roll'
          }
          
          if (now - lastTrickTime < COMBO_TIMEOUT) {
            // Increase combo if tricks are performed within the timeout
            combo = Math.min(combo + COMBO_MULTIPLIER_INCREASE, MAX_COMBO_MULTIPLIER)
            comboTimeLeft = COMBO_TIMEOUT
            lastTrickTime = now
            
            // Add trick to the list
            tricksPerformed.push(trickNames[spinAxis])
            
            // Keep only the last 5 tricks
            if (tricksPerformed.length > 5) {
              tricksPerformed = tricksPerformed.slice(-5)
            }
          } else {
            // Start a new combo
            combo = 1 + COMBO_MULTIPLIER_INCREASE
            comboTimeLeft = COMBO_TIMEOUT
            lastTrickTime = now
            tricksPerformed = [trickNames[spinAxis]]
          }

          // Add score for the trick
          const trickScore = TRICK_SCORES[trickNames[spinAxis]] * combo
          score += trickScore
          
          // Add score popup
          scorePopups.push({
            value: trickScore,
            x: newX + CAR_WIDTH / 2,
            y: newY - 20,
            age: 0,
            opacity: 1
          })
        }

        // Handle dashing
        if (keys.shift && !isDashing && dashCooldown === 0 && !isCrashed && !isFlipping && !isSpinning) {
          isDashing = true
          dashCooldown = DASH_COOLDOWN
          // Apply dash force in the direction the car is facing
          newVelocityX = DASH_FORCE * newDirection

          // Add score for dash
          const dashScore = TRICK_SCORES['Speed Dash'] * combo
          score += dashScore
          
          // Add score popup
          scorePopups.push({
            value: dashScore,
            x: newX + CAR_WIDTH / 2,
            y: newY - 20,
            age: 0,
            opacity: 1
          })
        }

        // Update dash state
        if (isDashing) {
          // Dash lasts for DASH_DURATION frames
          if (dashCooldown === DASH_COOLDOWN - DASH_DURATION) {
            isDashing = false
          }
        }

        // Handle flipping animation
        if (isFlipping) {
          flipAngle += FLIP_SPEED
          
          // When flip completes (360 degrees)
          if (flipAngle >= 360) {
            isFlipping = false
            flipAngle = 0
          }
        } 
        // Handle 3D spin animation
        else if (isSpinning) {
          spinAngle += FLIP_SPEED
          
          // When spin completes (360 degrees)
          if (spinAngle >= 360) {
            isSpinning = false
            spinAngle = 0
          }
        } 
        else {
          // Don't process controls if car is crashed, flipping, or spinning
          if (!isCrashed && !isDashing) {
            // Handle left/right movement with continuous acceleration
            if (keys.left) {
              newVelocityX = Math.max(newVelocityX - ACCELERATION, -MAX_VELOCITY)
              newDirection = -1
            } else if (keys.right) {
              newVelocityX = Math.min(newVelocityX + ACCELERATION, MAX_VELOCITY)
              newDirection = 1
            } else {
              // Apply friction when no keys are pressed
              newVelocityX *= FRICTION
              if (Math.abs(newVelocityX) < 0.1) newVelocityX = 0
            }

            // Handle jumping - now with W key
            if (keys.up && !isJumping) {
              newVelocityY = JUMP_FORCE
              isJumping = true
              wasInAir = true
            }
            
            // Handle 3D spin - with spacebar
            if (keys.jump && !isSpinning) {
              // Randomly choose a spin axis for variety
              const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
              spinAxis = axes[Math.floor(Math.random() * axes.length)]
              isSpinning = true
              spinAngle = 0
              
              // Add a small upward velocity to make the spin more dramatic
              newVelocityY = JUMP_FORCE * 0.5
              isJumping = true
              wasInAir = true
            }
          }
        }

        // Apply gravity
        newVelocityY += GRAVITY

        // Update position
        newX += newVelocityX
        newY += newVelocityY

        // Check screen boundaries
        if (newX < LEFT_BOUNDARY) {
          newX = LEFT_BOUNDARY
          newVelocityX = 0
        } else if (newX > RIGHT_BOUNDARY - CAR_WIDTH) {
          newX = RIGHT_BOUNDARY - CAR_WIDTH
          newVelocityX = 0
        }

        // Add top boundary to prevent car from going above the screen
        const TOP_BOUNDARY = 0
        if (newY < TOP_BOUNDARY) {
          newY = TOP_BOUNDARY
          newVelocityY = 0
        }

        // Check collision with rocks
        const carHitbox = {
          x: newX,
          y: newY,
          width: CAR_WIDTH,
          height: CAR_HEIGHT,
        }

        // Check for rock collisions
        rocks.forEach(rock => {
          const rockHitbox = {
            x: rock.x,
            y: rock.y,
            width: rock.width,
            height: rock.height,
          }

          // Check if car is colliding with the rock
          const isColliding =
            carHitbox.x + carHitbox.width > rockHitbox.x &&
            carHitbox.x < rockHitbox.x + rockHitbox.width &&
            carHitbox.y < rockHitbox.y + rockHitbox.height &&
            carHitbox.y + carHitbox.height > rockHitbox.y

          // If colliding and not already flipping, start a flip or crash
          if (isColliding && !isFlipping && !isCrashed) {
            if (Math.abs(newVelocityX) > 2) {
              // Fast collision - do a flip
              isFlipping = true
              flipAngle = 0
              // Stop horizontal movement during flip
              newVelocityX = 0
              // Add upward velocity to make the car jump during the flip
              newVelocityY = JUMP_FORCE * 1.5
              isJumping = true
              wasInAir = true
            } else {
              // Slow collision - crash the car
              isCrashed = true
              // Stop the car's movement when crashed
              newVelocityX = 0
              newVelocityY = 0
              
              console.log("Car crashed into rock!")
              
              // Reset crash state after 5 seconds
              setTimeout(() => {
                setCar((prev) => ({ ...prev, isCrashed: false }))
              }, 5000)
            }
          }
        })

        // Check collision with portfolio items
        let hoveredButtonId: string | null = null
        let isOnButton = false
        let buttonPlatformY = 0

        // First check if car is on top of any button
        for (const obj of gameObjects) {
          const objHitbox = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          }

          // Check if car is on top of the button (platform)
          const isOnTop =
            carHitbox.x + carHitbox.width > objHitbox.x &&
            carHitbox.x < objHitbox.x + objHitbox.width &&
            carHitbox.y + carHitbox.height >= objHitbox.y - 5 &&
            carHitbox.y + carHitbox.height <= objHitbox.y + 5 &&
            newVelocityY >= 0

          if (isOnTop) {
            isOnButton = true
            buttonPlatformY = objHitbox.y
            // Adjust car position to be on top of the button
            newY = objHitbox.y - carHitbox.height
            newVelocityY = 0
            isJumping = false
            wasInAir = false
            selectedProjectId = obj.id // Set selected project when on top of button
            break
          }
        }

        // Then check for collision with buttons (for hover effect)
        setGameObjects((prev) =>
          prev.map((obj) => {
            const objHitbox = {
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
            }

            // Check if car is colliding with the button
            const isColliding =
              carHitbox.x + carHitbox.width > objHitbox.x &&
              carHitbox.x < objHitbox.x + objHitbox.width &&
              carHitbox.y < objHitbox.y + objHitbox.height &&
              carHitbox.y + carHitbox.height > objHitbox.y

            // If colliding, store the button ID for selection
            if (isColliding) {
              hoveredButtonId = obj.id
            }

            return {
              ...obj,
              hovered: isColliding,
            }
          }),
        )

        // If a button is being hovered, select it
        if (hoveredButtonId !== null) {
          selectedProjectId = hoveredButtonId
        }

        // Check ground collision only if not on a button
        if (!isOnButton && newY > GROUND_LEVEL - CAR_HEIGHT) {
          newY = GROUND_LEVEL - CAR_HEIGHT

          // Remove the crash on landing logic
          newVelocityY = 0
          isJumping = false
          wasInAir = false
        } else if (newVelocityY > 0) {
          // Car is falling
          wasInAir = true
        }

        return {
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          isJumping,
          isCrouching,
          isCrashed,
          direction: newDirection,
          wasInAir,
          isFlipping,
          flipAngle,
          isSpinning,
          spinAngle,
          spinAxis,
          isDashing,
          dashCooldown,
          selectedProjectId,
          combo,
          comboTimeLeft,
          lastTrickTime,
          airTime,
          tricksPerformed,
          score,
          scorePopups
        }
      })
    }

    const intervalId = setInterval(updatePhysics, 1000 / 60) // 60 FPS

    return () => clearInterval(intervalId)
  }, [keys, onProjectSelect, rocks])

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
  }, [cameraRef.current.viewingProject])

  // Handle mouse click for closing portfolio content
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cameraRef.current.viewingProject !== null) {
        const canvas = canvasRef.current
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
  }, [cameraRef.current.viewingProject])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
