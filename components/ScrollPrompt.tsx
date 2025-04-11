import { ArrowDownCircle } from "lucide-react"

export default function ScrollPrompt() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-amber-800 animate-bounce flex flex-col items-center z-10">
      <p className="mb-2 text-sm font-medium">Scroll to crack open the fortune cookie</p>
      <ArrowDownCircle className="w-8 h-8" />
    </div>
  )
}
