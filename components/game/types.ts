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
  direction: 1 | -1
  wasInAir: boolean
  isFlipping: boolean
  flipAngle: number
  isSpinning: boolean
  spinAngle: number
  spinAxis: 'x' | 'y' | 'z'
  isDashing: boolean
  dashCooldown: number
  canDoubleJump: boolean
  keys?: { [key: string]: boolean }
  selectedProjectId: string | null
  combo: number
  comboTimeLeft: number
  lastTrickTime: number
  airTime: number
  tricksPerformed: string[]
  score: number
  highScore: number
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