'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { theme, cn } from "@/theme"

interface QuestionData {
  id: number
  category: string
  question: string
  options: string[]
  responses: number[]
  total: number
  satisfied: number
  notSatisfied: number
  satisfactionRate: number
}

interface CategoryPerformanceClientProps {
  questions: QuestionData[]
}

// Helper function to get satisfaction color
function getSatisfactionColor(rate: number): string {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

// Helper function to get satisfaction icon
function getSatisfactionIcon(rate: number) {
  if (rate >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />
  if (rate >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />
  return <XCircle className="h-5 w-5 text-red-600" />
}

export default function CategoryPerformanceClient({ questions }: CategoryPerformanceClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4
  const totalPages = Math.ceil(questions.length / itemsPerPage)
  const currentQuestions = questions.slice(currentIndex, currentIndex + itemsPerPage)

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - itemsPerPage))
  }

  const goToNext = () => {
    setCurrentIndex(Math.min(questions.length - itemsPerPage, currentIndex + itemsPerPage))
  }

  return (
    <Card className={cn("border border-gray-200", theme.effects.shadow.sm)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn(
              theme.typography.fontSize.xl,
              theme.typography.fontWeight.semibold,
              theme.typography.fontFamily.display,
              theme.colors.text.primary
            )}>
              Category Performance Overview
            </CardTitle>
            <p className={cn(
              theme.typography.fontSize.sm,
              theme.colors.text.secondary,
              "mt-1 font-medium"
            )}>
              Showing {currentIndex + 1}-{Math.min(currentIndex + itemsPerPage, questions.length)} of {questions.length} categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className={cn(
              theme.typography.fontSize.sm,
              theme.colors.text.secondary,
              "min-w-[60px] text-center"
            )}>
              {Math.floor(currentIndex / itemsPerPage) + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex + itemsPerPage >= questions.length}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {currentQuestions.map((question) => (
            <div
              key={question.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all",
                question.satisfactionRate >= 80 
                  ? "bg-green-50 border-green-200 hover:bg-green-100" 
                  : question.satisfactionRate >= 60 
                  ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  : "bg-red-50 border-red-200 hover:bg-red-100"
              )}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white border-2"
                style={{
                  borderColor: question.satisfactionRate >= 80 
                    ? '#16a34a' 
                    : question.satisfactionRate >= 60 
                    ? '#eab308' 
                    : '#dc2626'
                }}
              >
                {getSatisfactionIcon(question.satisfactionRate)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={cn(
                    theme.typography.fontSize.base,
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    theme.colors.text.primary
                  )}>
                    {question.category}
                  </h3>
                  <div className={cn(
                    theme.typography.fontSize.lg,
                    theme.typography.fontWeight.bold,
                    theme.typography.fontFamily.display,
                    getSatisfactionColor(question.satisfactionRate),
                    "ml-4"
                  )}>
                    {question.satisfactionRate.toFixed(1)}%
                  </div>
                </div>
                <p className={cn(
                  theme.typography.fontSize.sm,
                  theme.colors.text.secondary,
                  "mb-2 line-clamp-1"
                )}>
                  {question.question}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        question.satisfactionRate >= 80 ? "bg-green-600" :
                        question.satisfactionRate >= 60 ? "bg-yellow-600" : "bg-red-600"
                      )} 
                      style={{ width: `${Math.min(question.satisfactionRate, 100)}%` }}
                    />
                  </div>
                  <div className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary,
                    "whitespace-nowrap"
                  )}>
                    {question.satisfied}/{question.total} satisfied
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

