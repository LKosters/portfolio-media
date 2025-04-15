"use client"

import { CarState, GameObject, Rock, CameraState } from "./types"
import { 
  GROUND_LEVEL, 
  CAR_WIDTH, 
  CAR_HEIGHT, 
  SPEEDOMETER_RADIUS,
  MAX_SPEED_MPH,
  SPEED_MULTIPLIER,
  CAMERA_LEFT_BOUNDARY,
  CAMERA_RIGHT_BOUNDARY
} from "./constants"

// Function to draw the background
export function drawBackground(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  bgImage: HTMLImageElement | null,
  cameraX: number,
  cameraY: number
) {
  if (bgImage && bgImage.complete) {
    const bgWidth = canvas.width
    const bgHeight = canvas.height
    
    // Use a proper modulo operation that works with negative numbers
    const mod = (n: number, m: number) => ((n % m) + m) % m
    const parallaxOffset = mod(cameraX * 0.1, bgWidth)

    // Draw background layers with camera offset
    ctx.drawImage(bgImage, -parallaxOffset, -cameraY, bgWidth, bgHeight)
    ctx.drawImage(bgImage, bgWidth - parallaxOffset, -cameraY, bgWidth, bgHeight)
    
    // Add another image on the left side for negative parallaxing
    ctx.drawImage(bgImage, -parallaxOffset - bgWidth, -cameraY, bgWidth, bgHeight)
  } else {
    // Fallback background
    ctx.fillStyle = "#87CEEB"
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7)
  }

  // Draw grass
  ctx.fillStyle = "#4CAF50"
  ctx.fillRect(0, GROUND_LEVEL - 20 - cameraY, canvas.width, 70)

  // Draw ground
  ctx.fillStyle = "#8B4513"
  ctx.fillRect(0, GROUND_LEVEL + 50 - cameraY, canvas.width, canvas.height - GROUND_LEVEL)

  // Draw screen borders
//   ctx.fillStyle = "#000000" // Black
//   ctx.fillRect(0, 0, 10, canvas.height) // Left border
//   ctx.fillRect(canvas.width - 10, 0, 10, canvas.height) // Right border
}

// Function to draw the road
export function drawRoad(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  roadImage: HTMLImageElement | null,
  cameraX: number,
  cameraY: number
) {
  if (roadImage && roadImage.complete) {
    const roadHeight = 50
    const roadY = GROUND_LEVEL - cameraY
    const roadWidth = roadImage.width || 100
    
    // Add more repeats to cover both sides and ensure we have enough road tiles
    const repeats = Math.ceil(canvas.width / roadWidth) + 2
    
    // Proper modulo for negative numbers
    const mod = (n: number, m: number) => ((n % m) + m) % m
    const offset = mod(cameraX, roadWidth)
    
    // Start one tile to the left to ensure coverage when moving left
    for (let i = -1; i < repeats; i++) {
      const xPos = i * roadWidth - offset
      ctx.drawImage(roadImage, xPos, roadY, roadWidth, roadHeight)
    }
  }
}

// Function to draw rocks
export function drawRocks(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  rocks: Rock[],
  cameraX: number,
  cameraY: number
) {
  rocks.forEach(rock => {
    const rockX = rock.x - cameraX + canvas.width / 2
    
    if (rockX > -rock.width && rockX < canvas.width) {
      ctx.fillStyle = "#8B4513"
      ctx.beginPath()
      ctx.moveTo(rockX, rock.y - cameraY)
      ctx.lineTo(rockX + rock.width, rock.y - cameraY)
      ctx.lineTo(rockX + rock.width / 2, rock.y - rock.height - cameraY)
      ctx.closePath()
      ctx.fill()
      
      // Add some texture
      ctx.fillStyle = "#A0522D"
      ctx.beginPath()
      ctx.moveTo(rockX + rock.width / 4, rock.y - rock.height / 2 - cameraY)
      ctx.lineTo(rockX + rock.width * 3/4, rock.y - rock.height / 2 - cameraY)
      ctx.lineTo(rockX + rock.width / 2, rock.y - rock.height * 3/4 - cameraY)
      ctx.closePath()
      ctx.fill()
    }
  })
}

// Function to draw welcome sign
export function drawWelcomeSign(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  cameraX: number,
  cameraY: number
) {
  const START_POSITION_X = -350
  const welcomeX = START_POSITION_X - cameraX + canvas.width / 2
  
  // More permissive visibility check - ensure sign is always visible
  // regardless of how far left or right the player moves
  const signWidth = 500;
  const signPadding = 1000; // Large padding to ensure visibility
  
  if (welcomeX > -signWidth - signPadding && welcomeX < canvas.width + signPadding) {
    // Draw welcome sign
    ctx.fillStyle = "#000000"
    ctx.fillRect(welcomeX - 204, GROUND_LEVEL - 350 - cameraY, 504, 154)

    ctx.fillStyle = "#FFD700"
    ctx.fillRect(welcomeX - 200, GROUND_LEVEL - 354 - cameraY, 500, 150)

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 4
    ctx.strokeRect(welcomeX - 200, GROUND_LEVEL - 354 - cameraY, 500, 150)

    // Draw welcome text
    ctx.fillStyle = "#000000"
    ctx.font = "bold 24px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("WELCOME TO MY PORTFOLIO", welcomeX + 50, GROUND_LEVEL - 314 - cameraY)

    // Draw instructions
    ctx.font = "16px monospace"
    ctx.fillText("Use arrow keys or WASD to move, W to jump", welcomeX + 50, GROUND_LEVEL - 274 - cameraY)
    ctx.fillText("Crouch on a project button to view its content", welcomeX + 50, GROUND_LEVEL - 244 - cameraY)
  }
}

// Function to draw car
export function drawCar(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  car: CarState,
  carImage: HTMLImageElement | null,
  crouchImage: HTMLImageElement | null,
  crashImage: HTMLImageElement | null,
  cameraX: number,
  cameraY: number
) {
  // Select appropriate car image
  let currentCarImage = carImage
  if (car.isCrashed && crashImage && crashImage.complete) {
    currentCarImage = crashImage
  } else if (car.isCrouching && crouchImage && crouchImage.complete) {
    currentCarImage = crouchImage
  }

  if (currentCarImage && currentCarImage.complete) {
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
    const scoreY = car.y - 40 - cameraY
    if (car.score > 0) {
      ctx.strokeText(scoreText, scoreX, scoreY)
      ctx.fillText(scoreText, scoreX, scoreY)
    }
    ctx.restore()

    if (car.isFlipping) {
      ctx.save()
      ctx.translate(carScreenX + CAR_WIDTH / 2, car.y + CAR_HEIGHT / 2 - cameraY)
      ctx.rotate((car.flipAngle * Math.PI) / 180)
      if (car.direction === -1) {
        ctx.drawImage(currentCarImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
      } else {
        ctx.scale(-1, 1)
        ctx.drawImage(currentCarImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
      }
      ctx.restore()
    } else if (car.isSpinning) {
      ctx.save()
      ctx.translate(carScreenX + CAR_WIDTH / 2, car.y + CAR_HEIGHT / 2 - cameraY)
      
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
        ctx.drawImage(currentCarImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
      } else {
        ctx.scale(-1, 1)
        ctx.drawImage(currentCarImage, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
      }
      
      ctx.restore()
    } else {
      if (car.direction === -1) {
        ctx.drawImage(currentCarImage, carScreenX, car.y - cameraY, CAR_WIDTH, CAR_HEIGHT)
      } else {
        ctx.save()
        ctx.translate(carScreenX + CAR_WIDTH, car.y - cameraY)
        ctx.scale(-1, 1)
        ctx.drawImage(currentCarImage, 0, 0, CAR_WIDTH, CAR_HEIGHT)
        ctx.restore()
      }
    }
  } else {
    // Fallback car drawing
    const carScreenX = canvas.width / 2 + (car.x - cameraX)
    ctx.fillStyle = "#FF0000"
    ctx.fillRect(carScreenX, car.y - cameraY, CAR_WIDTH, CAR_HEIGHT)
  }
}

// Function to draw speedometer
export function drawSpeedometer(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  car: CarState
) {
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
}

// Function to calculate camera X position
export function getCameraX(carX: number): number {
  return Math.max(CAMERA_LEFT_BOUNDARY, Math.min(CAMERA_RIGHT_BOUNDARY, carX))
}

// Function to draw project buttons
export function drawButtons(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  gameObjects: GameObject[],
  cameraX: number,
  cameraY: number
) {
  gameObjects.forEach((obj) => {
    const buttonX = obj.x - cameraX + canvas.width / 2

    // Wider visibility range to ensure we draw buttons that might be partially offscreen
    if (buttonX > -obj.width * 1.5 && buttonX < canvas.width + obj.width * 0.5) {
      // Draw button shadow (black outline with offset)
      ctx.fillStyle = "#000000"
      ctx.fillRect(buttonX - 4, obj.y + 4 - cameraY, obj.width + 8, obj.height)

      // Draw button
      ctx.fillStyle = obj.color
      ctx.fillRect(buttonX, obj.y - cameraY, obj.width, obj.height)

      // Draw button border
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 4
      ctx.strokeRect(buttonX, obj.y - cameraY, obj.width, obj.height)

      // Draw title with pixel font style
      ctx.fillStyle = "white"
      ctx.font = "bold 20px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Draw text
      const title = obj.title
      const textX = buttonX + obj.width / 2
      const textY = obj.y + obj.height / 2 - cameraY

      // Only draw text if it will be visible on screen
      if (textX > 0 && textX < canvas.width) {
        ctx.fillText(title, textX, textY)
      }

      // Draw hover effect if the button is being hovered
      if (obj.hovered) {
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.strokeRect(buttonX + 4, obj.y + 4 - cameraY, obj.width - 8, obj.height - 8)
      }
    }
  })
}

// Function to draw combo meter
export function drawComboMeter(
  ctx: CanvasRenderingContext2D,
  car: CarState
) {
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
    const timeLeftPercent = car.comboTimeLeft / 3000 // COMBO_TIMEOUT
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
}

// Function to draw high score
export function drawHighScore(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  highScore: number,
  onInfoClick: () => void
) {
  // Calculate positions
  const boxWidth = 280;
  const boxHeight = 40;
  const boxX = canvas.width / 2 - boxWidth / 2;
  const boxY = 10;
  
  // Draw high score background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
  
  // Add a border
  ctx.strokeStyle = "#FFD700" // Gold color
  ctx.lineWidth = 2
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
  
  // Draw high score text
  ctx.fillStyle = "#FFD700" // Gold color
  ctx.font = "bold 20px monospace"
  ctx.textAlign = "center"
  ctx.fillText(`HIGH SCORE: ${highScore.toLocaleString()}`, canvas.width / 2 - 20, boxY + 25)
  
  // Draw info icon (circle with i)
  const iconX = boxX + boxWidth - 25;
  const iconY = boxY + boxHeight / 2;
  const iconRadius = 12;
  
  // Save the info icon position and dimensions for click detection
  // Store this in a closure variable for access in the game loop
  if (typeof window !== 'undefined') {
    (window as any).infoIconHitbox = {
      x: iconX - iconRadius,
      y: iconY - iconRadius,
      width: iconRadius * 2,
      height: iconRadius * 2,
      onClick: onInfoClick
    };
  }
  
  // Draw circle
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  
  // Draw 'i' character
  ctx.fillStyle = "#000000";
  ctx.font = "bold 14px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("i", iconX, iconY);
} 