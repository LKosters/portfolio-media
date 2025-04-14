"use client"

import { useEffect, useState } from "react"

interface KeyState {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  jump: boolean
  shift: boolean
}

export function useKeyboardControls() {
  const [keys, setKeys] = useState<KeyState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    shift: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          setKeys((prev) => ({ ...prev, left: true }))
          break
        case "ArrowRight":
        case "d":
          setKeys((prev) => ({ ...prev, right: true }))
          break
        case "ArrowUp":
        case "w":
          setKeys((prev) => ({ ...prev, up: true }))
          break
        case "ArrowDown":
        case "s":
          setKeys((prev) => ({ ...prev, down: true }))
          break
        case " ":
          setKeys((prev) => ({ ...prev, jump: true }))
          e.preventDefault() // Prevent page scrolling
          break
        case "Shift":
          setKeys((prev) => ({ ...prev, shift: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          setKeys((prev) => ({ ...prev, left: false }))
          break
        case "ArrowRight":
        case "d":
          setKeys((prev) => ({ ...prev, right: false }))
          break
        case "ArrowUp":
        case "w":
          setKeys((prev) => ({ ...prev, up: false }))
          break
        case "ArrowDown":
        case "s":
          setKeys((prev) => ({ ...prev, down: false }))
          break
        case " ":
          setKeys((prev) => ({ ...prev, jump: false }))
          break
        case "Shift":
          setKeys((prev) => ({ ...prev, shift: false }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return { keys }
}
