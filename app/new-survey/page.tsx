"use client"

import FortuneCookie from "@/components/FortuneCookie"
import ScrollPrompt from "@/components/ScrollPrompt"
import { useState, useEffect } from "react"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showPrompt, setShowPrompt] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      const progress = Math.min(current / maxScroll, 1)
      setScrollProgress(progress)

      if (current > 100) {
        setShowPrompt(false)
      } else {
        setShowPrompt(true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="h-[300vh] bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 overflow-x-hidden">
      {/* Background elements to enhance the visual environment */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial gradient to create a spotlight effect */}
        <div 
          className="absolute inset-0" 
          style={{
            background: `radial-gradient(circle at 50% ${50 - scrollProgress * 10}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
            opacity: 1 - scrollProgress * 0.5
          }}
        ></div>
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
          }}
        ></div>
      </div>

      {/* Center container with perspective effect */}
      <div className="fixed inset-0 flex items-center justify-center perspective-[1200px]">
        <div 
          className="relative transform-gpu" 
          style={{
            transform: `rotateX(${scrollProgress * 5}deg) scale(${1 + scrollProgress * 0.1})`,
            transformStyle: 'preserve-3d'
          }}
        >
          <FortuneCookie scrollProgress={scrollProgress} />
        </div>
      </div>

      {/* Enhanced scroll prompt */}
      {showPrompt && <ScrollPrompt />}
      
      {/* Content that appears when cookie is opened */}
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{
          opacity: scrollProgress > 0.7 ? (scrollProgress - 0.7) * 3 : 0,
          transform: `translateY(${scrollProgress > 0.7 ? 0 : 30}px)`,
          transition: 'opacity 0.5s, transform 0.5s',
          pointerEvents: scrollProgress > 0.7 ? 'auto' : 'none'
        }}
      >
      </div>
    </main>
  )
}
