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
  CAR_HEIGHT 
} from "./constants"

export function useGameObjects(projects: Project[]) {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [rocks, setRocks] = useState<Rock[]>([])
  const carRef = useRef<CarState | null>(null)

  // Initialize game objects (portfolio items) with fixed positions
  useEffect(() => {
    const buttonPositions = [
      0,
      600,
      1200,
      1800,
      2400
    ]

    const objects = projects.map((project, index) => ({
      id: project.id,
      title: project.title,
      x: buttonPositions[index] || index * 600,
      y: BUTTON_Y,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      color: project.color,
      hovered: false,
    }))

    setGameObjects(objects)

    // Initialize rocks
    const rockPositions = [
      1900
    ]

    const rockObjects = rockPositions.map((x, index) => ({
      id: index + 100,
      x,
      y: GROUND_LEVEL - ROCK_HEIGHT,
      width: ROCK_WIDTH,
      height: ROCK_HEIGHT,
    }))

    setRocks(rockObjects)
  }, [projects])

  // Update hover state based on car position
  const updateHoverState = useCallback((car: CarState, setCar?: (value: React.SetStateAction<CarState>) => void) => {
    if (!carRef.current || 
        car.x !== carRef.current.x || 
        car.y !== carRef.current.y) {
      carRef.current = car
      
      const WELCOME_SIGN_X = -350 - 200;
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
        carHitbox.x + carHitbox.width > WELCOME_SIGN_X &&
        carHitbox.x < WELCOME_SIGN_X + WELCOME_SIGN_WIDTH &&
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

  return { gameObjects, rocks, setGameObjects, updateHoverState }
} 