// Game physics constants
export const GRAVITY = 0.5
export const JUMP_FORCE = -15
export const ACCELERATION = 0.5
export const MAX_VELOCITY = 20
export const FRICTION = 0.98

// Game boundaries and dimensions
export const GROUND_LEVEL = 500
export const CAR_WIDTH = 120
export const CAR_HEIGHT = 60
export const BUTTON_HEIGHT = 80
export const BUTTON_WIDTH = 240
export const BUTTON_Y = GROUND_LEVEL - 180
export const START_POSITION_X = -200
export const LEFT_BOUNDARY = -620
export const RIGHT_BOUNDARY = 3120
export const CAMERA_LEFT_BOUNDARY = 0
export const CAMERA_RIGHT_BOUNDARY = 2500
export const ROCK_WIDTH = 30
export const ROCK_HEIGHT = 20

// Animation constants
export const FLIP_SPEED = 15
export const SPEEDOMETER_RADIUS = 80
export const MAX_SPEED_MPH = 300
export const SPEED_MULTIPLIER = 15
export const DASH_FORCE = 30
export const DASH_DURATION = 10
export const DASH_COOLDOWN = 120
export const COMBO_TIMEOUT = 3000
export const COMBO_MULTIPLIER_INCREASE = 0.5
export const MAX_COMBO_MULTIPLIER = 10
export const SCORE_POPUP_LIFETIME = 60

// Scoring
export const TRICK_SCORES: Record<string, number> = {
  'Front Flip': 1000,
  'Side Flip': 1500,
  'Barrel Roll': 2000,
  'Speed Dash': 800,
  'Turbo Boost': 800
}

// Easing functions
export const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4)
}

export const easeInOutQuart = (x: number): number => {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
} 