"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Project, GameObject, Rock, CarState } from "./types"
import { 
  BUTTON_HEIGHT, 
  BUTTON_WIDTH, 
  BUTTON_Y, 
  GROUND_LEVEL, 
  ROCK_WIDTH, 
  ROCK_HEIGHT, 
  CAR_WIDTH, 
  CAR_HEIGHT,
  LEFT_BOUNDARY as DEFAULT_LEFT_BOUNDARY,
  RIGHT_BOUNDARY as DEFAULT_RIGHT_BOUNDARY,
  CAMERA_LEFT_BOUNDARY as DEFAULT_CAMERA_LEFT_BOUNDARY,
  CAMERA_RIGHT_BOUNDARY as DEFAULT_CAMERA_RIGHT_BOUNDARY
} from "./constants"

export function useGameObjects(projects: Project[], learningOutcomes: Project[] = []) {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [rocks, setRocks] = useState<Rock[]>([])
  const [boundaries, setBoundaries] = useState({
    leftBoundary: DEFAULT_LEFT_BOUNDARY,
    rightBoundary: DEFAULT_RIGHT_BOUNDARY,
    cameraLeftBoundary: DEFAULT_CAMERA_LEFT_BOUNDARY,
    cameraRightBoundary: DEFAULT_CAMERA_RIGHT_BOUNDARY
  })
  const carRef = useRef<CarState | null>(null)

  // Initialize game objects (portfolio items) with fixed positions
  useEffect(() => {
    const WELCOME_SIGN_X = -350;
    const BUTTON_SPACING = 600;
    const PADDING = 500; // Extra space beyond last button
    
    // Portfolio buttons on the right side of welcome sign
    const portfolioButtonPositions = projects.map((_, index) => 
      WELCOME_SIGN_X + 600 + index * BUTTON_SPACING
    );

    // Learning outcome buttons on the left side of welcome sign
    const learningButtonPositions = learningOutcomes.map((_, index) => 
      WELCOME_SIGN_X - 600 - index * BUTTON_SPACING
    );

    // Calculate dynamic boundaries based on actual number of items
    const rightmostItem = portfolioButtonPositions.length > 0 
      ? portfolioButtonPositions[portfolioButtonPositions.length - 1] + BUTTON_WIDTH + PADDING
      : WELCOME_SIGN_X + 600 + BUTTON_WIDTH + PADDING;
    
    const leftmostItem = learningButtonPositions.length > 0
      ? learningButtonPositions[learningButtonPositions.length - 1] - PADDING
      : WELCOME_SIGN_X - 600 - PADDING;
    
    // Update the boundaries
    const newBoundaries = {
      leftBoundary: leftmostItem,
      rightBoundary: rightmostItem,
      cameraLeftBoundary: leftmostItem + 300, // Add some offset for camera
      cameraRightBoundary: rightmostItem - 300 // Add some offset for camera
    };
    
    setBoundaries(newBoundaries);

    // Create portfolio buttons
    const portfolioObjects = projects.map((project, index) => ({
      id: project.id,
      title: project.title,
      x: portfolioButtonPositions[index] || (WELCOME_SIGN_X + 600 + index * BUTTON_SPACING),
      y: BUTTON_Y,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      color: project.color,
      hovered: false,
    }))
    
    // Create learning outcome buttons
    const learningObjects = learningOutcomes.map((outcome, index) => ({
      id: outcome.id,
      title: outcome.title,
      x: learningButtonPositions[index] || (WELCOME_SIGN_X - 600 - index * BUTTON_SPACING),
      y: BUTTON_Y,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      color: outcome.color,
      hovered: false,
    }))

    // Combine both types of objects
    setGameObjects([...portfolioObjects, ...learningObjects])

    // Initialize rocks WELCOME_SIGN_X + 1900
    const rockPositions = [
      
    ]

    const rockObjects = rockPositions.map((x, index) => ({
      id: index + 100,
      x,
      y: GROUND_LEVEL - ROCK_HEIGHT,
      width: ROCK_WIDTH,
      height: ROCK_HEIGHT,
    }))

    setRocks(rockObjects)
  }, [projects, learningOutcomes])

  // Update hover state based on car position
  const updateHoverState = useCallback((car: CarState, setCar?: (value: React.SetStateAction<CarState>) => void) => {
    if (!carRef.current || 
        car.x !== carRef.current.x || 
        car.y !== carRef.current.y) {
      carRef.current = car
      
      const WELCOME_SIGN_X = -350;
      const WELCOME_SIGN_Y = GROUND_LEVEL - 350;
      const WELCOME_SIGN_WIDTH = 500;
      const WELCOME_SIGN_HEIGHT = 150;
      
      const carHitbox = {
        x: car.x,
        y: car.y,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
      }
      
      // Check if car is standing on top of the welcome sign
      const isOnWelcomeSign = 
        carHitbox.x + carHitbox.width > WELCOME_SIGN_X - 200 &&
        carHitbox.x < WELCOME_SIGN_X - 200 + WELCOME_SIGN_WIDTH &&
        carHitbox.y + carHitbox.height >= WELCOME_SIGN_Y - 5 &&
        carHitbox.y + carHitbox.height <= WELCOME_SIGN_Y + 5 &&
        car.velocityY >= 0;
        
      if (isOnWelcomeSign && car.velocityY >= 0 && setCar) {
        setCar(prev => ({
          ...prev,
          y: WELCOME_SIGN_Y - CAR_HEIGHT,
          velocityY: 0,
          isJumping: false,
          wasInAir: false
        }));
      }
      
      setGameObjects(prev => 
        prev.map(obj => {
          const objHitbox = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          }

          // Check if car is colliding with the button (hover effect)
          const isColliding =
            carHitbox.x + carHitbox.width > objHitbox.x &&
            carHitbox.x < objHitbox.x + objHitbox.width &&
            carHitbox.y < objHitbox.y + objHitbox.height &&
            carHitbox.y + carHitbox.height > objHitbox.y

          // Check if car is standing on top of the button
          const isStandingOn =
            carHitbox.x + carHitbox.width > objHitbox.x &&
            carHitbox.x < objHitbox.x + objHitbox.width &&
            carHitbox.y + carHitbox.height >= objHitbox.y - 5 &&
            carHitbox.y + carHitbox.height <= objHitbox.y + 5 &&
            car.velocityY >= 0

          // Either colliding or standing on should trigger the hover effect
          const shouldHover = isColliding || isStandingOn

          // Only update if hovered state changed
          if (shouldHover !== obj.hovered) {
            return {
              ...obj,
              hovered: shouldHover,
            }
          }
          return obj
        })
      )
    }
  }, [])

  return { gameObjects, rocks, setGameObjects, updateHoverState, boundaries }
} 