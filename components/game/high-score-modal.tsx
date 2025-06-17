"use client"

import { useState, useEffect } from "react"
import { addHighScore, getTopHighScores, HighScoreEntry } from "@/lib/firebase"

interface HighScoreModalProps {
  isOpen: boolean
  onClose: () => void
  currentScore: number
}

export function HighScoreModal({ isOpen, onClose, currentScore }: HighScoreModalProps) {
  const [playerName, setPlayerName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [topScores, setTopScores] = useState<HighScoreEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Load top scores when modal opens
      fetchTopScores()
    }
  }, [isOpen])

  const fetchTopScores = async () => {
    try {
      const scores = await getTopHighScores(5)
      setTopScores(scores)
    } catch (error) {
      console.error("Error loading top scores:", error)
      setError("Failed to load leaderboard. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError("Please enter your name")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await addHighScore(playerName, currentScore)
      setIsSubmitted(true)
      await fetchTopScores() // Refresh the leaderboard
    } catch (error) {
      console.error("Error submitting score:", error)
      setError("Failed to submit score. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="bg-gray-900 border-4 border-yellow-500 p-6 rounded-lg shadow-xl w-96 z-10">
        <h2 className="text-2xl text-yellow-500 font-bold mb-4 text-center">
          {isSubmitted ? "Score Submitted!" : "New High Score!"}
        </h2>
        
        <div className="text-center mb-4">
          <span className="text-3xl text-white font-bold">{currentScore.toLocaleString()}</span>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-white mb-2">
                Voer je naam in:
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-yellow-500"
                maxLength={20}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? "Versturen..." : "Verstuur Score"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-green-400 text-center mb-4">
            Je score is toegevoegd aan de leaderboard!
          </p>
        )}

        <div className="mt-6">
          <h3 className="text-white font-bold mb-2">Top Scores:</h3>
          {topScores.length > 0 ? (
            <div className="bg-gray-800 rounded p-2">
              <table className="w-full text-white">
                <thead>
                  <tr>
                    <th className="py-1 text-left">#</th>
                    <th className="py-1 text-left">Naam</th>
                    <th className="py-1 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topScores.map((score, index) => (
                    <tr key={index} className={`${playerName === score.name && currentScore === score.score ? 'bg-yellow-900' : ''}`}>
                      <td className="py-1">{index + 1}</td>
                      <td className="py-1">{score.name}</td>
                      <td className="py-1 text-right">{score.score.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center">Nog geen scores. Wees de eerste!</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-500 font-medium"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
} 