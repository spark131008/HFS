'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, PieChart, DoughnutChart } from '@/components/ui/ClientChartWrapper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { theme, cn } from "@/theme"
// Chart colors aligned with theme
const CHART_COLORS = {
  primary: 'rgba(79, 70, 229, 0.85)',
  secondary: 'rgba(147, 51, 234, 0.85)',
  success: 'rgba(16, 185, 129, 0.85)',
  warning: 'rgba(251, 146, 60, 0.85)',
  error: 'rgba(239, 68, 68, 0.85)',
  info: 'rgba(14, 165, 233, 0.85)',
}

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

interface QuestionAnalysisClientProps {
  questions: QuestionData[]
}

// Helper function to get satisfaction color
function getSatisfactionColor(rate: number): string {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export default function QuestionAnalysisClient({ questions }: QuestionAnalysisClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const questionsPerPage = 3
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const currentQuestions = questions.slice(currentIndex, currentIndex + questionsPerPage)

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - questionsPerPage))
  }

  const goToNext = () => {
    setCurrentIndex(Math.min(questions.length - questionsPerPage, currentIndex + questionsPerPage))
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
              Detailed Question Analysis
            </CardTitle>
            <p className={cn(
              theme.typography.fontSize.sm,
              theme.colors.text.secondary,
              "mt-1 font-medium"
            )}>
              Showing {currentIndex + 1}-{Math.min(currentIndex + questionsPerPage, questions.length)} of {questions.length} questions
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
              {Math.floor(currentIndex / questionsPerPage) + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex + questionsPerPage >= questions.length}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {currentQuestions.map((question, idx) => (
            <Card key={question.id} className={cn("border border-gray-200", theme.effects.shadow.sm)}>
              <CardHeader>
                <CardTitle className={cn(
                  theme.typography.fontSize.base,
                  theme.typography.fontWeight.semibold,
                  theme.typography.fontFamily.display,
                  theme.colors.text.primary
                )}>
                  {question.category}
                </CardTitle>
                <p className={cn(
                  theme.typography.fontSize.xs,
                  theme.colors.text.secondary,
                  "mt-1 line-clamp-2"
                )}>
                  {question.question}
                </p>
                <p className={cn(
                  theme.typography.fontSize.xs,
                  theme.colors.text.secondary,
                  "mt-1 font-medium"
                )}>
                  {question.total} total responses
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[220px] w-full flex justify-center items-center">
                  <div className="relative w-full max-w-[220px]">
                    {idx % 3 === 0 ? (
                      <PieChart data={{
                        labels: question.options,
                        datasets: [{
                          data: question.responses,
                          backgroundColor: [
                            CHART_COLORS.error,
                            CHART_COLORS.success,
                          ],
                          borderWidth: 0,
                          hoverOffset: 4
                        }]
                      }} />
                    ) : idx % 3 === 1 ? (
                      <DoughnutChart data={{
                        labels: question.options,
                        datasets: [{
                          data: question.responses,
                          backgroundColor: [
                            CHART_COLORS.error,
                            CHART_COLORS.success,
                          ],
                          borderWidth: 0,
                          hoverOffset: 10
                        }]
                      }} />
                    ) : (
                      <BarChart 
                        horizontal={true}
                        data={{
                          labels: question.options,
                          datasets: [{
                            label: 'Responses',
                            data: question.responses,
                            backgroundColor: [
                              CHART_COLORS.error,
                              CHART_COLORS.success,
                            ],
                            borderRadius: 6,
                            barThickness: 30,
                          }]
                        }} 
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className={cn(
                    theme.typography.fontSize.lg,
                    theme.typography.fontWeight.bold,
                    getSatisfactionColor(question.satisfactionRate)
                  )}>
                    {question.satisfactionRate.toFixed(1)}% Satisfied
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

