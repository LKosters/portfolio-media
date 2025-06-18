"use client"

import { useState, useEffect } from "react"

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
  projectTitle: string
  content: string
  isLoading: boolean
  backgroundColor?: string
  tags?: string[]
}

export function PortfolioModal({ isOpen, onClose, projectId, projectTitle, content, isLoading, backgroundColor, tags }: PortfolioModalProps) {
  if (!isOpen || !projectId) return null

  // Parse markdown content for rendering
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-left text-black">Aan het laden...</p>
    }

    const lines = content.split('\n')
    return (
      <div className="markdown-content overflow-x-hidden">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mb-4" style={{ color: '#000', textAlign: 'left' }}>{line.substring(2)}</h1>
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mb-3" style={{ color: '#000', textAlign: 'left' }}>{line.substring(3)}</h2>
          } else if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-semibold mb-2" style={{ color: '#000', textAlign: 'left' }}>{line.substring(4)}</h3>
          } else if (line.startsWith('> ')) {
            return <blockquote key={index} className="border-l-4 border-black pl-4 italic my-3 text-black" style={{ textAlign: 'left' }}>{line.substring(2)}</blockquote>
          } else if (line.startsWith('- ')) {
            return <li key={index} className="mb-2 ml-5" style={{ textAlign: 'left' }}>{line.substring(2)}</li>
          } else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>
          } else if (line.match(/!\[.*?\]\(.*?\)/)) {
            // Handle image markdown: ![alt text](url)
            const altMatch = line.match(/!\[(.*?)\]/)
            const urlMatch = line.match(/\((.*?)\)/)
            const alt = altMatch ? altMatch[1] : ''
            const url = urlMatch ? urlMatch[1] : ''
            return <img key={index} src={url} alt={alt} className="max-w-full my-4 rounded" style={{ display: 'block', textAlign: 'left' }} />
          } else if (line.includes('http://') || line.includes('https://')) {
            // Render all URLs as links
            const urlRegex = /(https?:\/\/[^\s]+)/g
            let lastIndex = 0
            let match
            const elements = []
            let key = 0
            while ((match = urlRegex.exec(line)) !== null) {
              // Push preceding text
              if (match.index > lastIndex) {
                elements.push(line.substring(lastIndex, match.index))
              }
              elements.push(
                <a key={key++} href={match[1]} target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>
                  {match[1]}
                </a>
              )
              lastIndex = match.index + match[0].length
            }
            if (lastIndex < line.length) {
              elements.push(line.substring(lastIndex))
            }
            // Process bold text (**text** or __text__) within the line (after links)
            const processBold = (text: string) => {
              const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g)
              return parts.map((part: string, i: number) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                } else if (part.startsWith('__') && part.endsWith('__')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                } else {
                  return part
                }
              })
            }
            return (
              <p key={index} className="mb-3" style={{ textAlign: 'left' }}>
                {elements.map((el, i) => typeof el === 'string' ? processBold(el) : el)}
              </p>
            )
          } else {
            // Process links [text](url) that are not images
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
            let lastIndex = 0
            let match
            const elements = []
            let key = 0
            while ((match = linkRegex.exec(line)) !== null) {
              // Push preceding text
              if (match.index > lastIndex) {
                elements.push(line.substring(lastIndex, match.index))
              }
              elements.push(
                <a className="w-full" key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>
                  {match[1]}
                </a>
              )
              lastIndex = match.index + match[0].length
            }
            if (lastIndex < line.length) {
              elements.push(line.substring(lastIndex))
            }
            // Process bold text (**text** or __text__) within the line (after links)
            const processBold = (text: string) => {
              const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g)
              return parts.map((part: string, i: number) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                } else if (part.startsWith('__') && part.endsWith('__')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>
                } else {
                  return part
                }
              })
            }
            return (
              <p key={index} className="mb-3" style={{ textAlign: 'left' }}>
                {elements.map((el, i) => typeof el === 'string' ? processBold(el) : el)}
              </p>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}></div>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          background: backgroundColor || '#FFE066',
          border: '8px solid #111',
          boxShadow: '8px 8px 0 #222',
          borderRadius: 0,
          width: '100vw',
          maxWidth: 700,
          height: '100vh',
          maxHeight: '90vh',
          zIndex: 10,
          margin: 0,
          padding: 0,
        }}
      >
        <div className="w-full flex justify-center items-center" style={{ padding: '2.5rem 2rem 1.5rem 2rem' }}>
          <div className="flex flex-col items-center w-full">
            <h2
              className="text-center w-full"
              style={{
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '2rem',
                color: '#111',
                letterSpacing: 1,
                margin: 0,
                textShadow: '2px 2px 0 #fff, 4px 4px 0 #111',
              }}
            >
              {projectTitle}
            </h2>
            {tags && tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#111',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className="flex-grow overflow-auto w-full flex flex-col"
          style={{ background: 'none', padding: '0 2rem 1.5rem 2rem', width: '100%', maxHeight: 'calc(100vh - 180px)' }}
        >
          <div style={{ width: '100%', textAlign: 'left', color: '#000', fontSize: '1.25rem', fontFamily: 'inherit', fontWeight: 400 }}>
            {renderContent()}
          </div>
        </div>
        <div className="w-full flex justify-center py-3">
          <button
            onClick={onClose}
            style={{
              background: '#111',
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: '4px solid #111',
              borderRadius: 0,
              padding: '0.5rem 2.5rem',
              boxShadow: '2px 2px 0 #222',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#222')}
            onMouseOut={e => (e.currentTarget.style.background = '#111')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 