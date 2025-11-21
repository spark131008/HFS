import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./client"
import { OPERATIONAL_QUESTIONS } from "@/utils/operational-questions"

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

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
    
    // Query for questions specific to this survey
    const { data: surveyQuestions } = await supabase
      .from('survey_questions')
      .select(`
        survey_id,
        question_text,
        options,
        category
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
    
    // Create a map of question text to category for operational surveys
    const questionCategoryMap = new Map<string, string>()
    if (surveyData.survey_type === 'operational') {
      OPERATIONAL_QUESTIONS.forEach(opQ => {
        questionCategoryMap.set(opQ.question_text, opQ.category)
      })
    }
    
    // Process question response data - transform to positive/negative format
    const questionResponseMap = new Map<string, { 
      question: string, 
      options: string[], 
      positive: number, 
      negative: number,
      category: string
    }>()
    
    // First, initialize all questions from survey_questions
    surveyQuestions?.forEach(question => {
      const options = question.options || ["Not Satisfied", "Satisfied"]
      // Determine category: use from DB if available, otherwise from operational questions map, otherwise "General"
      const category = question.category || 
                      questionCategoryMap.get(question.question_text) || 
                      "General"
      
      questionResponseMap.set(question.question_text, {
        question: question.question_text,
        options: options,
        positive: 0,
        negative: 0,
        category: category
      })
    })
    
    // Then count the responses - transform left/right to negative/positive
    responseData?.forEach(response => {
      const answers = response.question_answers
      
      Object.entries(answers).forEach(([question, answer]) => {
        if (!questionResponseMap.has(question)) {
          // This shouldn't happen if survey_questions is properly set up, but just in case
          questionResponseMap.set(question, {
            question,
            options: ["Not Satisfied", "Satisfied"],
            positive: 0,
            negative: 0,
            category: questionCategoryMap.get(question) || "General"
          })
        }
        
        // Transform: right = positive (satisfied), left = negative (not satisfied)
        const data = questionResponseMap.get(question)!
        if (answer === 'right') {
          data.positive++
        } else if (answer === 'left') {
          data.negative++
        }
      })
    })
    
    // Time-based data for trend analysis - generate daily data for last 7 days
    const now = new Date()
    const dailyData: { label: string; value: number; date?: string; dayOfWeek?: string }[] = []
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      // Count responses for this date
      const count = responseData?.filter(r => {
        const responseDate = new Date(r.submitted_at).toISOString().split('T')[0]
        return responseDate === dateStr
      }).length || 0
      
      dailyData.push({ 
        label: dayLabel, 
        value: count,
        date: dateStr,
        dayOfWeek: dayLabel
      })
    }
    
    // Format date range
    const dateRange = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })

    // Pass raw response data for client-side date filtering
    const rawResponseData = responseData?.map(r => ({
      submitted_at: r.submitted_at,
      question_answers: r.question_answers
    })) || []

    // Pass question metadata for client-side processing
    const questionMetadata = surveyQuestions?.map(q => ({
      question_text: q.question_text,
      options: q.options || ["Not Satisfied", "Satisfied"],
      category: q.category || questionCategoryMap.get(q.question_text) || "General"
    })) || []

    return (
      <DashboardClient
        surveyTitle={surveyData.title}
        dailyData={dailyData}
        dateRange={dateRange}
        rawResponseData={rawResponseData}
        questionMetadata={questionMetadata}
        questionCategoryMap={Object.fromEntries(questionCategoryMap)}
      />
    )
  } catch (error) {
    console.error("Error in DashboardPage:", error)
    redirect('/my-surveys')
  }
}
