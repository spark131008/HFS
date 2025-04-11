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
    <main className="h-[300vh] bg-gradient-to-b from-amber-50 to-amber-200 overflow-x-hidden">
      <div className="fixed inset-0 flex items-center justify-center">
        <FortuneCookie scrollProgress={scrollProgress} />
      </div>

      {showPrompt && <ScrollPrompt />}
    </main>
  )
}
