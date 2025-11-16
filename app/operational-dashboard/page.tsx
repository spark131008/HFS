import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { LineChart } from '@/components/ui/ClientChartWrapper'
import { TrendingUp, Users, Target, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { redirect } from "next/navigation"
import { theme, cn } from "@/theme"
import MainNavigationBar from "@/components/MainNavigationBar"
import { OPERATIONAL_QUESTIONS } from "@/utils/operational-questions"
import QuestionAnalysisClient from "./QuestionAnalysisClient"
import CategoryPerformanceClient from "./CategoryPerformanceClient"

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

// Chart colors aligned with theme
const CHART_COLORS = {
  primary: 'rgba(79, 70, 229, 0.85)',    // Deep Indigo - from-indigo-600
  secondary: 'rgba(147, 51, 234, 0.85)',  // Vivid Purple - to-purple-600
  success: 'rgba(16, 185, 129, 0.85)',    // Emerald
  warning: 'rgba(251, 146, 60, 0.85)',    // Orange
  error: 'rgba(239, 68, 68, 0.85)',       // Red
  info: 'rgba(14, 165, 233, 0.85)',       // Sky Blue
  background: {
    primary: 'rgba(79, 70, 229, 0.1)',
    secondary: 'rgba(147, 51, 234, 0.1)',
    success: 'rgba(16, 185, 129, 0.1)',
    warning: 'rgba(251, 146, 60, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(14, 165, 233, 0.1)',
  }
}

// Helper function to get satisfaction color
function getSatisfactionColor(rate: number): string {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

// Helper function to get satisfaction background color
function getSatisfactionBgColor(rate: number): string {
  if (rate >= 80) return 'bg-green-50 border-green-200'
  if (rate >= 60) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

// Helper function to get satisfaction icon
function getSatisfactionIcon(rate: number) {
  if (rate >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />
  if (rate >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />
  return <XCircle className="h-5 w-5 text-red-600" />
}

export default async function OperationalDashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  try {
    // Always treat searchParams as a Promise to satisfy build-time type checking
    const searchParams = await props.searchParams;
    const surveyId = searchParams.id as string;
    
    if (!surveyId) {
      // Redirect to my-surveys page if no survey ID is provided
      redirect('/my-surveys')
    }
    
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      redirect('/login')
    }
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/login')
    }
    
    // Check if survey belongs to current user and is operational
    const { data: surveyData } = await supabase
      .from('survey')
      .select('id, title, location, user_id, survey_type')
      .eq('id', surveyId)
      .single()
    
    if (!surveyData) {
      // Survey not found
      redirect('/my-surveys')
    }
    
    if (surveyData.user_id !== user.id) {
      // Survey doesn't belong to current user
      redirect('/my-surveys')
    }
    
    // TEMPORARY: Use dummy data for now
    const useDummyData = true;
    
    if (!useDummyData && surveyData.survey_type !== 'operational') {
      // Not an operational survey, redirect to regular dashboard
      redirect(`/dashboard?id=${surveyId}`)
    }
    
    let totalResponses = 0;
    let operationalQuestionData: any[] = [];
    let timeChartData: any = { labels: [], datasets: [] };
    let percentChange = '0%';
    let overallSatisfactionRate = 0;
    let averageCategorySatisfaction = 0;
    let questionsBySatisfaction: any[] = [];
    
    if (useDummyData) {
      // Generate dummy data for all 8 operational questions
      const dummyData = [
        { satisfied: 85, notSatisfied: 15, satisfactionRate: 85.0 }, // Exterior & Patio
        { satisfied: 92, notSatisfied: 8, satisfactionRate: 92.0 },   // Interior Presentation
        { satisfied: 78, notSatisfied: 22, satisfactionRate: 78.0 },  // Welcome
        { satisfied: 88, notSatisfied: 12, satisfactionRate: 88.0 },   // Staff Service
        { satisfied: 65, notSatisfied: 35, satisfactionRate: 65.0 },  // Restroom Cleanliness
        { satisfied: 90, notSatisfied: 10, satisfactionRate: 90.0 },   // Food Safety
        { satisfied: 82, notSatisfied: 18, satisfactionRate: 82.0 },  // Ambience
        { satisfied: 87, notSatisfied: 13, satisfactionRate: 87.0 }, // Staff Care
      ];
      
      operationalQuestionData = OPERATIONAL_QUESTIONS.map((opQ, index) => {
        const data = dummyData[index];
        return {
          id: opQ.id,
          category: opQ.category,
          question: opQ.question_text,
          options: opQ.options,
          responses: [data.notSatisfied, data.satisfied],
          total: data.satisfied + data.notSatisfied,
          satisfied: data.satisfied,
          notSatisfied: data.notSatisfied,
          satisfactionRate: data.satisfactionRate
        };
      });
      
      totalResponses = operationalQuestionData.reduce((sum, q) => sum + q.total, 0);
      overallSatisfactionRate = operationalQuestionData.reduce((sum, q) => sum + q.satisfied, 0) / totalResponses * 100;
      averageCategorySatisfaction = operationalQuestionData.reduce((sum, q) => sum + q.satisfactionRate, 0) / operationalQuestionData.length;
      questionsBySatisfaction = [...operationalQuestionData].sort((a, b) => a.satisfactionRate - b.satisfactionRate);
      percentChange = '+12%';
      
      // Generate dummy time chart data (last 14 days)
      const today = new Date();
      const dates: string[] = [];
      const counts: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        counts.push(Math.floor(Math.random() * 15) + 5); // Random between 5-20
      }
      
      timeChartData = {
        labels: dates,
        datasets: [{
          label: 'Daily Responses',
          data: counts,
          borderColor: CHART_COLORS.success,
          backgroundColor: CHART_COLORS.background.success,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
        }]
      };
    } else {
      // Get total responses for this survey
      const { count } = await supabase
        .from('survey_responses')
        .select('id', { count: 'exact' })
        .eq('survey_id', surveyId)
      
      // Ensure count is a number
      totalResponses = count || 0
      
      // Query for questions specific to this survey
      const { data: surveyQuestions } = await supabase
        .from('survey_questions')
        .select(`
          survey_id,
          question_text,
          options
        `)
        .eq('survey_id', surveyId)
      
      // Get responses for this specific survey
      const { data: responseData } = await supabase
        .from('survey_responses')
        .select(`
          id,
          survey_id,
          submitted_at,
          question_answers
        `)
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false })
      
      // Process question response data for charts
      const questionResponseMap = new Map<string, { question: string, options: string[], responses: number[] }>()
      
      // First, initialize all questions from survey_questions
      surveyQuestions?.forEach(question => {
        questionResponseMap.set(question.question_text, {
          question: question.question_text,
          options: question.options || ["Not Satisfied", "Satisfied"],
          responses: [0, 0] // Initialize with zeros for left/right
        })
      })
      
      // Then count the responses
      responseData?.forEach(response => {
        const answers = response.question_answers
        
        Object.entries(answers).forEach(([question, answer]) => {
          if (!questionResponseMap.has(question)) {
            // This shouldn't happen if survey_questions is properly set up, but just in case
            questionResponseMap.set(question, {
              question,
              options: ["Not Satisfied", "Satisfied"],
              responses: [0, 0]
            })
          }
          
          // Increment the appropriate counter based on answer
          const data = questionResponseMap.get(question)!
          if (answer === 'left') {
            data.responses[0]++ // Not Satisfied
          } else if (answer === 'right') {
            data.responses[1]++ // Satisfied
          }
        })
      })
      
      // Map questions to operational question data (for categories)
      operationalQuestionData = OPERATIONAL_QUESTIONS.map(opQ => {
        const responseData = questionResponseMap.get(opQ.question_text) || {
          question: opQ.question_text,
          options: opQ.options,
          responses: [0, 0]
        }
        
        const total = responseData.responses[0] + responseData.responses[1]
        const satisfied = responseData.responses[1]
        const satisfactionRate = total > 0 ? (satisfied / total) * 100 : 0
        
        return {
          id: opQ.id,
          category: opQ.category,
          question: opQ.question_text,
          options: opQ.options,
          responses: responseData.responses,
          total: total,
          satisfied: satisfied,
          notSatisfied: responseData.responses[0],
          satisfactionRate: satisfactionRate
        }
      })
      
      // Calculate overall satisfaction rate
      const totalSatisfied = operationalQuestionData.reduce((sum, q) => sum + q.satisfied, 0)
      const totalResponsesAll = operationalQuestionData.reduce((sum, q) => sum + q.total, 0)
      overallSatisfactionRate = totalResponsesAll > 0 ? (totalSatisfied / totalResponsesAll) * 100 : 0
      
      // Calculate average satisfaction by category (all categories have same weight)
      averageCategorySatisfaction = operationalQuestionData.length > 0
        ? operationalQuestionData.reduce((sum, q) => sum + q.satisfactionRate, 0) / operationalQuestionData.length
        : 0
      
      // Sort questions by satisfaction rate (lowest first) for areas needing attention
      questionsBySatisfaction = [...operationalQuestionData].sort((a, b) => 
        a.satisfactionRate - b.satisfactionRate
      )
      
      // Time-based data for trend analysis
      const responseDates = responseData?.map(r => {
        const date = new Date(r.submitted_at)
        return date.toISOString().split('T')[0] // YYYY-MM-DD format
      }) || []
      
      // Count responses by date
      const dateCountMap = new Map<string, number>()
      responseDates.forEach(date => {
        dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1)
      })
      
      // Sort dates and prepare line chart data
      const sortedDates = Array.from(dateCountMap.entries())
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      
      timeChartData = {
        labels: sortedDates.map(([date]) => date),
        datasets: [{
          label: 'Daily Responses',
          data: sortedDates.map(([, count]) => count),
          borderColor: CHART_COLORS.success,
          backgroundColor: CHART_COLORS.background.success,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
        }]
      }
      
      // Calculate last week's response count
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const lastWeekResponses = responseData?.filter(r => 
        new Date(r.submitted_at) >= oneWeekAgo
      ).length || 0
      
      percentChange = lastWeekResponses > 0 
        ? '+' + Math.round((lastWeekResponses / Math.max(totalResponses - lastWeekResponses, 1)) * 100) + '%'
        : '0%'
    }

    return (
      <div className={cn("min-h-screen flex flex-col", theme.colors.background.gradient)}>
        <MainNavigationBar />
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8")}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={cn(
                theme.typography.fontFamily.display,
                theme.typography.fontWeight.bold,
                theme.typography.fontSize["3xl"],
                "tracking-tight",
                theme.colors.text.gradient
              )}>
                {surveyData.title} - Operational Dashboard
              </h1>
              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-300 text-blue-800"
              >
                Operational Check
              </Badge>
            </div>
            {surveyData.location && (
              <p className={cn(
                theme.typography.fontSize.base,
                theme.colors.text.secondary,
                "mb-2"
              )}>
                Location: {surveyData.location}
              </p>
            )}
            <p className={cn(
              theme.typography.fontSize.base,
              theme.colors.text.secondary
            )}>
              Comprehensive operational feedback analysis across all 8 quality categories
            </p>
          </div>
          
          {/* Statistics Overview Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  theme.typography.fontSize.sm,
                  theme.typography.fontWeight.medium,
                  theme.colors.text.secondary
                )}>
                  Total Responses
                </CardTitle>
                <Users className="h-5 w-5 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    "text-indigo-600"
                  )}>
                    {totalResponses}
                  </div>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary,
                    "mt-1 font-medium"
                  )}>
                    {percentChange} from last week
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border border-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  theme.typography.fontSize.sm,
                  theme.typography.fontWeight.medium,
                  theme.colors.text.secondary
                )}>
                  Overall Satisfaction
                </CardTitle>
                <Target className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    getSatisfactionColor(overallSatisfactionRate)
                  )}>
                    {overallSatisfactionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-16 h-1 rounded-full bg-gray-100 mr-2">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          overallSatisfactionRate >= 80 ? "bg-green-600" :
                          overallSatisfactionRate >= 60 ? "bg-yellow-600" : "bg-red-600"
                        )} 
                        style={{ width: `${Math.min(overallSatisfactionRate, 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      theme.typography.fontSize.xs,
                      theme.colors.text.secondary,
                      "font-medium"
                    )}>
                      Target: 80%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  theme.typography.fontSize.sm,
                  theme.typography.fontWeight.medium,
                  theme.colors.text.secondary
                )}>
                  Category Average
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    getSatisfactionColor(averageCategorySatisfaction)
                  )}>
                    {averageCategorySatisfaction.toFixed(1)}%
                  </div>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary,
                    "mt-1 font-medium"
                  )}>
                    Average across 8 categories
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  theme.typography.fontSize.sm,
                  theme.typography.fontWeight.medium,
                  theme.colors.text.secondary
                )}>
                  Areas Needing Attention
                </CardTitle>
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    "text-blue-600"
                  )}>
                    {questionsBySatisfaction.filter(q => q.satisfactionRate < 80).length}
                  </div>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary,
                    "mt-1 font-medium"
                  )}>
                    Categories below 80%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {totalResponses === 0 ? (
            <div className={cn(
              "text-center py-16 mb-8 bg-white rounded-lg border border-gray-200",
              theme.effects.shadow.sm
            )}>
              <h2 className={cn(
                theme.typography.fontSize.xl,
                theme.typography.fontWeight.semibold,
                theme.typography.fontFamily.display,
                "text-gray-700 mb-2"
              )}>
                No responses yet
              </h2>
              <p className={cn(
                theme.typography.fontSize.base,
                theme.colors.text.secondary,
                "mb-4"
              )}>
                Share your operational survey with customers to start collecting feedback.
              </p>
            </div>
          ) : (
            <>
              {/* Response Trends */}
              <div className="mb-8">
                <Card className={cn("border border-gray-200", theme.effects.shadow.sm)}>
                  <CardHeader>
                    <CardTitle className={cn(
                      theme.typography.fontSize.xl,
                      theme.typography.fontWeight.semibold,
                      theme.typography.fontFamily.display,
                      theme.colors.text.primary
                    )}>
                      Response Trends Over Time
                    </CardTitle>
                    <p className={cn(
                      theme.typography.fontSize.sm,
                      theme.colors.text.secondary,
                      "mt-1 font-medium"
                    )}>
                      Daily response volume
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[300px] w-full flex justify-center items-center">
                      <div className="relative w-full max-w-[800px]">
                        <LineChart 
                          data={timeChartData}
                          options={{
                            scales: {
                              x: {
                                title: {
                                  display: true,
                                  text: 'Date'
                                }
                              },
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Number of Responses'
                                },
                                ticks: {
                                  stepSize: 1
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Performance - Paginated Client Component */}
              <div className="mb-8">
                <CategoryPerformanceClient 
                  questions={operationalQuestionData}
                />
              </div>

              {/* Detailed Question Analysis - Client Component with Navigation */}
              <div className="mb-8">
                <QuestionAnalysisClient 
                  questions={operationalQuestionData}
                />
              </div>

              {/* Areas Needing Attention */}
              {questionsBySatisfaction.filter(q => q.satisfactionRate < 80).length > 0 && (
                <div className="mb-8">
                  <Card className={cn("border border-red-200 bg-red-50", theme.effects.shadow.sm)}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <CardTitle className={cn(
                          theme.typography.fontSize.xl,
                          theme.typography.fontWeight.semibold,
                          theme.typography.fontFamily.display,
                          "text-red-800"
                        )}>
                          Areas Needing Attention
                        </CardTitle>
                      </div>
                      <p className={cn(
                        theme.typography.fontSize.sm,
                        "text-red-700",
                        "mt-1 font-medium"
                      )}>
                        Categories with satisfaction rates below 80% - prioritize these areas for improvement
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {questionsBySatisfaction
                          .filter(q => q.satisfactionRate < 80)
                          .map((question) => (
                            <div 
                              key={question.id}
                              className="bg-white p-4 rounded-lg border border-red-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className={cn(
                                    theme.typography.fontWeight.semibold,
                                    theme.typography.fontFamily.display,
                                    theme.colors.text.primary,
                                    "mb-1"
                                  )}>
                                    {question.category}
                                  </h3>
                                  <p className={cn(
                                    theme.typography.fontSize.sm,
                                    theme.colors.text.secondary,
                                    "mb-2"
                                  )}>
                                    {question.question}
                                  </p>
                                </div>
                                <div className={cn(
                                  theme.typography.fontSize["2xl"],
                                  theme.typography.fontWeight.bold,
                                  "text-red-600"
                                )}>
                                  {question.satisfactionRate.toFixed(1)}%
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>{question.satisfied} Satisfied</span>
                                <span>{question.notSatisfied} Not Satisfied</span>
                                <span>Total: {question.total}</span>
                              </div>
                              <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-600 rounded-full" 
                                  style={{ width: `${Math.min(question.satisfactionRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  } catch (error) {
    // Re-throw redirect errors - they should not be caught
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as { digest?: string }).digest
      if (digest && typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error
      }
    }
    
    console.error("Error in OperationalDashboardPage:", error)
    return (
      <div className={cn("min-h-screen flex flex-col", theme.colors.background.gradient)}>
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8")}>
          <div className="mb-8">
            <h1 className={cn(
              theme.typography.fontFamily.display,
              theme.typography.fontWeight.bold,
              theme.typography.fontSize["3xl"],
              "tracking-tight mb-2",
              theme.colors.text.gradient
            )}>
              Error
            </h1>
            <p className={cn(
              theme.typography.fontSize.base,
              theme.colors.text.secondary
            )}>
              An error occurred while loading the operational dashboard. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

