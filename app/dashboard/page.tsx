import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { BarChart, PieChart, DoughnutChart, LineChart } from '@/components/ui/ClientChartWrapper'
import { TrendingUp, Users, Target } from 'lucide-react'
import { redirect } from "next/navigation"
import { theme, cn } from "@/theme"
import MainNavigationBar from "@/components/MainNavigationBar"

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

// Updated component to accept a surveyId parameter
export default async function DashboardPage(props: {
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
      redirect('/sign-in')
    }
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/sign-in')
    }
    
    // Check if survey belongs to current user
    const { data: surveyData } = await supabase
      .from('survey')
      .select('id, title, user_id, survey_type')
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
    
    // Get total responses for this survey
    const { count } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact' })
      .eq('survey_id', surveyId)
    
    // Ensure count is a number
    const totalResponses = count || 0
    
    // Estimated number of potential requests (for conversion rate)
    const totalRequests = Math.max(totalResponses + Math.round(totalResponses * 0.25), 10)
    const conversionRate = totalResponses > 0 ? ((totalResponses / totalRequests) * 100).toFixed(1) : "0.0"
    
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
        options: question.options || ["Unknown", "Unknown"],
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
            options: ["Unknown", "Unknown"],
            responses: [0, 0]
          })
        }
        
        // Increment the appropriate counter based on answer
        const data = questionResponseMap.get(question)!
        if (answer === 'left') {
          data.responses[0]++
        } else if (answer === 'right') {
          data.responses[1]++
        }
      })
    })
    
    // Order questions by total response count for importance
    const sortedQuestions = Array.from(questionResponseMap.entries())
      .map(([key, value]) => ({
        question: key,
        options: value.options,
        responses: value.responses,
        total: value.responses.reduce((sum, val) => sum + val, 0)
      }))
      .sort((a, b) => b.total - a.total)

    // Get top questions for main charts
    // For operational surveys, show all 8. For custom surveys, show top 3
    const questionLimit = surveyData.survey_type === 'operational' ? 8 : 3
    const topQuestions = sortedQuestions.slice(0, Math.min(questionLimit, sortedQuestions.length))
    
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
    
    const timeChartData = {
      labels: sortedDates.map(([date]) => date),
      datasets: [{
        label: 'Daily Responses',
        data: sortedDates.map(([, count]) => count), // Use empty destructuring to avoid unused variable
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
    
    const percentChange = lastWeekResponses > 0 
      ? '+' + Math.round((lastWeekResponses / Math.max(totalResponses - lastWeekResponses, 1)) * 100) + '%'
      : '0%'

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
                {surveyData.title} - Dashboard
              </h1>
              <Badge
                variant="outline"
                className={`${
                  surveyData.survey_type === 'operational'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-purple-50 border-purple-300 text-purple-800'
                }`}
              >
                {surveyData.survey_type === 'operational' ? 'Operational Check' : 'Custom'}
              </Badge>
            </div>
            <p className={cn(
              theme.typography.fontSize.base,
              theme.colors.text.secondary
            )}>
              Real-time feedback analysis and insights for your survey
            </p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  theme.typography.fontSize.sm,
                  theme.typography.fontWeight.medium,
                  theme.colors.text.secondary
                )}>
                  Potential Requests
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
                    {totalRequests}
                  </div>
                  <p className={cn(
                    theme.typography.fontSize.xs,
                    theme.colors.text.secondary,
                    "mt-1 font-medium"
                  )}>
                    Estimated total visitors
                  </p>
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
                  Total Responses
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    "text-purple-600"
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
                  Conversion Rate
                </CardTitle>
                <Target className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className={cn(
                    theme.typography.fontSize["3xl"],
                    theme.typography.fontWeight.semibold,
                    theme.typography.fontFamily.display,
                    "text-green-600"
                  )}>
                    {conversionRate}%
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-16 h-1 rounded-full bg-gray-100 mr-2">
                      <div 
                        className="h-full bg-green-600 rounded-full" 
                        style={{ width: `${Math.min(Number(conversionRate), 100)}%` }}
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
                Share your survey with customers to start collecting feedback.
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

              {/* Top Questions Analysis */}
              {topQuestions.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {topQuestions.map((question, index) => (
                    <Card key={index} className={cn("border border-gray-200", theme.effects.shadow.sm)}>
                      <CardHeader>
                        <CardTitle className={cn(
                          theme.typography.fontSize.xl,
                          theme.typography.fontWeight.semibold,
                          theme.typography.fontFamily.display,
                          theme.colors.text.primary
                        )}>
                          {question.question}
                        </CardTitle>
                        <p className={cn(
                          theme.typography.fontSize.sm,
                          theme.colors.text.secondary,
                          "mt-1 font-medium"
                        )}>
                          {question.total} total responses
                        </p>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-[280px] w-full flex justify-center items-center">
                          <div className="relative w-full max-w-[300px]">
                            {index % 3 === 0 ? (
                              <PieChart data={{
                                labels: question.options,
                                datasets: [{
                                  data: question.responses,
                                  backgroundColor: [
                                    CHART_COLORS.primary,
                                    CHART_COLORS.secondary,
                                  ],
                                  borderWidth: 0,
                                  hoverOffset: 4
                                }]
                              }} />
                            ) : index % 3 === 1 ? (
                              <DoughnutChart data={{
                                labels: question.options,
                                datasets: [{
                                  data: question.responses,
                                  backgroundColor: [
                                    CHART_COLORS.info,
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
                                      CHART_COLORS.warning,
                                      CHART_COLORS.error,
                                    ],
                                    borderRadius: 6,
                                    barThickness: 30,
                                  }]
                                }} 
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Additional Questions */}
              {sortedQuestions.length > 3 && (
                <div className="mb-8">
                  <Card className={cn("border border-gray-200", theme.effects.shadow.sm)}>
                    <CardHeader>
                      <CardTitle className={cn(
                        theme.typography.fontSize.xl,
                        theme.typography.fontWeight.semibold,
                        theme.typography.fontFamily.display,
                        theme.colors.text.primary
                      )}>
                        All Questions Summary
                      </CardTitle>
                      <p className={cn(
                        theme.typography.fontSize.sm,
                        theme.colors.text.secondary,
                        "mt-1 font-medium"
                      )}>
                        Response distribution for all survey questions
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {sortedQuestions.slice(3).map((question, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className={cn(
                              theme.typography.fontWeight.medium,
                              theme.typography.fontFamily.display,
                              theme.colors.text.primary,
                              "mb-2"
                            )}>
                              {question.question}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <span className={cn(
                                  theme.typography.fontSize.sm
                                )}>
                                  {question.options[0]}: {question.responses[0]}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className={cn(
                                  theme.typography.fontSize.sm
                                )}>
                                  {question.options[1]}: {question.responses[1]}
                                </span>
                              </div>
                              <div className={cn(
                                theme.typography.fontSize.xs,
                                theme.colors.text.secondary
                              )}>
                                Total: {question.total}
                              </div>
                            </div>
                            <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ 
                                  width: `${question.total > 0 ? (question.responses[0] / question.total) * 100 : 0}%` 
                                }}
                              ></div>
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
    console.error("Error in DashboardPage:", error)
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
              An error occurred while loading the dashboard. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
