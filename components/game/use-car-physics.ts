"use client"

import { useState, useEffect } from "react"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"
import { 
  CarState, 
  GameObject, 
  Rock, 
  ScorePopup
} from "./types"
import { 
  ACCELERATION, 
  MAX_VELOCITY, 
  FRICTION, 
  JUMP_FORCE, 
  GRAVITY, 
  GROUND_LEVEL, 
  CAR_HEIGHT, 
  CAR_WIDTH, 
  LEFT_BOUNDARY, 
  RIGHT_BOUNDARY,
  DASH_FORCE,
  DASH_COOLDOWN,
  DASH_DURATION,
  COMBO_TIMEOUT,
  COMBO_MULTIPLIER_INCREASE,
  MAX_COMBO_MULTIPLIER,
  FLIP_SPEED,
  TRICK_SCORES,
  SCORE_POPUP_LIFETIME
} from "./constants"

const initialCarState: CarState = {
  x: -200,
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
  canDoubleJump: false,
  keys: {},
  selectedProjectId: null,
  combo: 1,
  comboTimeLeft: 0,
  lastTrickTime: 0,
  airTime: 0,
  tricksPerformed: [],
  score: 0,
  highScore: 0,
  scorePopups: []
}

export function useCarPhysics(gameObjects: GameObject[], rocks: Rock[]) {
  const [car, setCar] = useState<CarState>(() => {
    // Load high score from local storage when component mounts
    const savedHighScore = typeof window !== 'undefined' ? 
      parseInt(localStorage.getItem('carGameHighScore') || '0', 10) : 0;
    
    return {
      ...initialCarState,
      highScore: savedHighScore
    };
  });
  const { keys } = useKeyboardControls()

  useEffect(() => {
    const updatePhysics = () => {
      setCar((prevCar) => {
        let newVelocityX = prevCar.velocityX
        let newVelocityY = prevCar.velocityY
        let newX = prevCar.x
        let newY = prevCar.y
        let newDirection = prevCar.direction
        let isJumping = prevCar.isJumping
        let isCrouching = keys.down
        let isCrashed = prevCar.isCrashed
        let wasInAir = prevCar.wasInAir
        let isFlipping = prevCar.isFlipping
        let flipAngle = prevCar.flipAngle
        let isSpinning = prevCar.isSpinning
        let spinAngle = prevCar.spinAngle
        let spinAxis = prevCar.spinAxis
        let isDashing = prevCar.isDashing
        let dashCooldown = prevCar.dashCooldown > 0 ? prevCar.dashCooldown - 1 : 0
        let canDoubleJump = prevCar.canDoubleJump
        let selectedProjectId = prevCar.selectedProjectId
        let combo = prevCar.combo
        let comboTimeLeft = prevCar.comboTimeLeft > 0 ? prevCar.comboTimeLeft - 16.67 : 0 // Decrease by ~16.67ms (60fps)
        let lastTrickTime = prevCar.lastTrickTime
        let airTime = prevCar.airTime
        let tricksPerformed = [...prevCar.tricksPerformed]
        let score = prevCar.score
        let highScore = prevCar.highScore
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

        // Check for new high score
        if (score > highScore) {
          highScore = score;
          // Save high score to local storage
          if (typeof window !== 'undefined') {
            localStorage.setItem('carGameHighScore', highScore.toString());
          }
        }

        // Reset combo and score function with high score handling
        const resetComboAndScore = () => {
          if (combo > 1 || score > 0) {  // Modified to always reset if score > 0
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

            // Check for new high score before resetting
            if (score > highScore) {
              highScore = score;
              // Save high score to local storage
              if (typeof window !== 'undefined') {
                localStorage.setItem('carGameHighScore', highScore.toString());
              }
            }
            
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
          canDoubleJump = true // Enable double jump when first jump occurs
          
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

          // Update combo
          const now = Date.now();
          if (now - lastTrickTime < COMBO_TIMEOUT) {
            combo = Math.min(combo + COMBO_MULTIPLIER_INCREASE, MAX_COMBO_MULTIPLIER);
            comboTimeLeft = COMBO_TIMEOUT;
            lastTrickTime = now;
            tricksPerformed.push('Turbo Boost');
            if (tricksPerformed.length > 5) {
              tricksPerformed = tricksPerformed.slice(-5);
            }
          } else {
            combo = 1 + COMBO_MULTIPLIER_INCREASE;
            comboTimeLeft = COMBO_TIMEOUT;
            lastTrickTime = now;
            tricksPerformed = ['Turbo Boost'];
          }

          // Add score for dash
          const dashScore = TRICK_SCORES['Turbo Boost'] * combo
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
            if (keys.up && !prevCar.keys?.up && !isJumping && !wasInAir) {
              newVelocityY = JUMP_FORCE
              isJumping = true
              wasInAir = true
              canDoubleJump = true // Enable double jump when first jump occurs
            }
            // Handle double jump when already in the air
            else if (keys.up && !prevCar.keys?.up && wasInAir && canDoubleJump) {
              newVelocityY = JUMP_FORCE // Full strength double jump
              canDoubleJump = false // Use up the double jump
              
              // Add combo for double jump
              const now = Date.now()
              if (now - lastTrickTime < COMBO_TIMEOUT) {
                combo = Math.min(combo + COMBO_MULTIPLIER_INCREASE, MAX_COMBO_MULTIPLIER)
                comboTimeLeft = COMBO_TIMEOUT
                lastTrickTime = now
                tricksPerformed.push('Double Jump')
                if (tricksPerformed.length > 5) {
                  tricksPerformed = tricksPerformed.slice(-5)
                }
              } else {
                combo = 1 + COMBO_MULTIPLIER_INCREASE
                comboTimeLeft = COMBO_TIMEOUT
                lastTrickTime = now
                tricksPerformed = ['Double Jump']
              }
              
              // Add score for double jump
              const jumpScore = TRICK_SCORES['Double Jump'] * combo
              score += jumpScore
              
              // Add score popup
              scorePopups.push({
                value: jumpScore,
                x: newX + CAR_WIDTH / 2,
                y: newY - 20,
                age: 0,
                opacity: 1
              })
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

        // Helper function to check for collision
        const checkCollision = (objHitbox: { x: number, y: number, width: number, height: number }) => {
          return carHitbox.x + carHitbox.width > objHitbox.x &&
            carHitbox.x < objHitbox.x + objHitbox.width &&
            carHitbox.y < objHitbox.y + objHitbox.height &&
            carHitbox.y + carHitbox.height > objHitbox.y;
        };

        // Check for rock collisions
        rocks.forEach(rock => {
          const rockHitbox = {
            x: rock.x,
            y: rock.y,
            width: rock.width,
            height: rock.height,
          }

          // Check if car is colliding with the rock
          const isColliding = checkCollision(rockHitbox);
          
          // Debug collision
          if (isColliding) {
            console.log('Collision detected with rock at', rock.x, rock.y);
          }

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
            // Reset score when landing on a platform
            if (prevCar.wasInAir) {
              resetComboAndScore()
            }
            // Adjust car position to be on top of the button
            newY = objHitbox.y - carHitbox.height
            newVelocityY = 0
            isJumping = false
            wasInAir = false
            canDoubleJump = false // Reset double jump when landing on a button
            selectedProjectId = obj.id // Set selected project when on top of button
            break
          }
        }

        // Hover handling is done in a separate effect and state update

        // Check for welcome sign collision
        const WELCOME_SIGN_X = -350 - 200;
        const WELCOME_SIGN_Y = GROUND_LEVEL - 350;
        const WELCOME_SIGN_WIDTH = 500;
        const WELCOME_SIGN_HEIGHT = 150;
        
        // Check if car is on top of the welcome sign
        const isOnWelcomeSign = 
          carHitbox.x + carHitbox.width > WELCOME_SIGN_X &&
          carHitbox.x < WELCOME_SIGN_X + WELCOME_SIGN_WIDTH &&
          carHitbox.y + carHitbox.height >= WELCOME_SIGN_Y - 5 &&
          carHitbox.y + carHitbox.height <= WELCOME_SIGN_Y + 5 &&
          newVelocityY >= 0;
          
        if (isOnWelcomeSign && !isOnButton) {
          newY = WELCOME_SIGN_Y - CAR_HEIGHT;
          newVelocityY = 0;
          isJumping = false;
          // Reset score when landing on welcome sign
          if (wasInAir) {
            resetComboAndScore();
          }
          wasInAir = false;
          canDoubleJump = false; // Reset double jump when landing on welcome sign
          isOnButton = true; // Prevent ground collision check
        }

        // Check ground collision only if not on a button
        if (!isOnButton && newY > GROUND_LEVEL - CAR_HEIGHT) {
          newY = GROUND_LEVEL - CAR_HEIGHT
          newVelocityY = 0
          isJumping = false
          // Reset score when landing on the ground
          if (wasInAir) {
            resetComboAndScore()
          }
          wasInAir = false
          canDoubleJump = false // Reset double jump when landing
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
          canDoubleJump,
          keys: { ...keys }, // Store current key states for next frame
          selectedProjectId,
          combo,
          comboTimeLeft,
          lastTrickTime,
          airTime,
          tricksPerformed,
          score,
          highScore,
          scorePopups
        }
      })
    }

    const intervalId = setInterval(updatePhysics, 1000 / 60) // 60 FPS

    return () => clearInterval(intervalId)
  }, [keys])

  return { car, setCar }
} 