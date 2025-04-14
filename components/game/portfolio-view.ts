"use client"

import { CameraState } from "./types"

export function drawPortfolioView(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  portfolioContent: string,
  isLoadingContent: boolean
) {
  if (camera.viewingProject === null) return
  
  // Draw sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#001F3F')
  gradient.addColorStop(0.5, '#0074D9')
  gradient.addColorStop(1, '#7FDBFF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw stars
  ctx.fillStyle = '#FFFFFF'
  for (let i = 0; i < 100; i++) {
    const x = (Math.sin(i * 567) + 1) * canvas.width / 2
    const y = (Math.cos(i * 321) + 1) * canvas.height / 2
    const size = (Math.sin(i * 123) + 1) * 1.5 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  const time = Date.now() / 3000
  for (let i = 0; i < 5; i++) {
    const x = ((time + i * 1.5) % 2) * (canvas.width + 200) - 100
    const y = 100 + i * 60
    
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
    let y = 100 - camera.contentScrollY
    
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
    if (camera.contentScrollY > 0) {
      ctx.fillStyle = "rgba(127, 219, 255, 0.5)"
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 10, 70)
      ctx.lineTo(canvas.width / 2 + 10, 70)
      ctx.lineTo(canvas.width / 2, 60)
      ctx.closePath()
      ctx.fill()
    }
    
    if (y + camera.contentScrollY > canvas.height - 60) {
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