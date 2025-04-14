export interface Project {
  id: string
  title: string
  image: string
  color: string
}

export interface GameCanvasProps {
  onProjectSelect: (projectId: string) => void
  projects: Project[]
}

export interface GameObject {
  x: number
  y: number
  width: number
  height: number
  id: string
  title: string
  color: string
  hovered: boolean
}

export interface Rock {
  x: number
  y: number
  width: number
  height: number
  id: number
}

export interface CarState {
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
  scorePopups: ScorePopup[]
}

export interface ScorePopup {
  value: number
  x: number
  y: number
  age: number
  opacity: number
}

export interface CameraState {
  y: number
  targetY: number
  isMoving: boolean
  viewingProject: string | null
  contentScrollY: number
  animationProgress: number
  animationDuration: number
  startY: number
} 