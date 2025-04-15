"use client"

import { useState, useEffect } from "react"

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
  projectTitle: string
  content: string
  isLoading: boolean
}

export function PortfolioModal({ isOpen, onClose, projectId, projectTitle, content, isLoading }: PortfolioModalProps) {
  if (!isOpen || !projectId) return null

  // Parse markdown content for rendering
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-white">Loading...</p>
    }

    const lines = content.split('\n')
    return (
      <div className="markdown-content">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl text-blue-400 font-bold mb-4">{line.substring(2)}</h1>
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl text-blue-400 font-bold mb-3">{line.substring(3)}</h2>
          } else if (line.startsWith('- ')) {
            return <li key={index} className="mb-2 ml-5">{line.substring(2)}</li>
          } else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>
          } else {
            return <p key={index} className="mb-3">{line}</p>
          }
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="bg-gray-900 border-4 border-blue-500 p-6 rounded-lg shadow-xl w-3/4 max-w-4xl h-4/5 z-10 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-blue-400 font-bold">
            {projectTitle}
          </h2>
          {/* <button 
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center focus:outline-none"
          >
            X
          </button> */}
        </div>
        
        <div className="flex-grow overflow-auto p-4 bg-gray-800 rounded">
          {renderContent()}
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-white hover:text-blue-400 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 