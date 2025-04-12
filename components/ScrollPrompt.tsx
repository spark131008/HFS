import { ArrowDownCircle } from "lucide-react"

export default function ScrollPrompt() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-amber-800 animate-bounce flex flex-col items-center z-10">
      <p className="mb-2 text-sm font-medium drop-shadow-sm">
        Scroll down to crack open your fortune cookie
      </p>
      <div className="relative">
        <ArrowDownCircle className="w-8 h-8 drop-shadow-sm" />
        {/* Pulsing effect behind the arrow */}
        <div className="absolute inset-0 rounded-full bg-amber-100 -z-10 animate-ping opacity-30"></div>
      </div>
    </div>
  )
}
