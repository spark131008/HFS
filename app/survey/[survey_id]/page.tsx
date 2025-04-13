'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge' // Import Badge component

// Types matching those in survey-creation page
type OptionObject = {
  label?: string
  value?: string
  [key: string]: string | undefined
}

type Question = {
  id: number
  question_text: string
  options: Array<string | OptionObject>
  question_bank_id: number | null // Added to track if it's a custom question
  is_custom?: boolean // Added to easily identify custom questions
}

type Survey = {
  id: string
  title: string
  location: string
  questions: Question[]
}

type SurveyResponse = {
  questionId: number
  answer: string
  comments?: string
}

export default function SurveyPage() {
  const router = useRouter()
  const params = useParams()
  const surveyId = params?.survey_id as string
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [comments, setComments] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (!surveyId) return
    
    const fetchSurvey = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        
        // First, fetch the survey details
        const { data: surveyData, error: surveyError } = await supabase
          .from('survey')
          .select('*')
          .eq('id', surveyId)
          .single()
        
        if (surveyError || !surveyData) {
          console.error('Error fetching survey:', surveyError)
          setError(surveyError?.message || 'Survey not found')
          setIsLoading(false)
          return
        }
        
        console.log('Survey data:', surveyData)
        
        // Now fetch all questions associated with this survey from survey_questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
        
        if (questionsError) {
          console.error('Error fetching questions:', questionsError)
          setError(questionsError.message)
          setIsLoading(false)
          return
        }
        
        // No questions found
        if (!questionsData || questionsData.length === 0) {
          setError('This survey has no questions.')
          setIsLoading(false)
          return
        }
        
        console.log('Questions data:', questionsData)
        
        // Format the survey with its questions
        const formattedSurvey: Survey = {
          id: surveyData.id,
          title: surveyData.title,
          location: surveyData.location,
          questions: questionsData.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: Array.isArray(q.options) ? q.options : [],
            question_bank_id: q.question_bank_id, // Changed from q.question_id to q.question_bank_id
            is_custom: q.question_bank_id === null // Flag custom questions (changed from question_id)
          }))
        }
        
        console.log('Formatted survey:', formattedSurvey)
        
        setSurvey(formattedSurvey)
        
        // Initialize responses array
        setResponses(
          formattedSurvey.questions.map(q => ({
            questionId: q.id,
            answer: ''
          }))
        )
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSurvey()
  }, [surveyId])
  
  const handleResponseChange = (questionId: number, value: string) => {
    setResponses(prev => 
      prev.map(response => 
        response.questionId === questionId 
          ? { ...response, answer: value } 
          : response
      )
    )
  }
  
  const handleCommentChange = (questionId: number, value: string) => {
    setComments(prev => ({ ...prev, [questionId]: value }))
    
    // Also update the response
    setResponses(prev => 
      prev.map(response => 
        response.questionId === questionId 
          ? { ...response, comments: value } 
          : response
      )
    )
  }
  
  const handleSubmit = async () => {
    // Validate that all questions have answers
    const unansweredQuestions = responses.filter(r => !r.answer)
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before submitting.`)
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Format responses for database
      const formattedResponses = responses.map(response => ({
        survey_id: surveyId,
        question_id: response.questionId,
        answer: response.answer,
        comments: response.comments || null
      }))
      
      // Insert responses
      const { data, error: responseError } = await supabase
        .from('survey_responses')
        .insert(formattedResponses)
      
      if (responseError) {
        console.error('Error submitting responses:', responseError)
        setError(`Failed to submit responses: ${responseError.message}`)
      } else {
        console.log('Responses submitted successfully:', data)
        setSubmitSuccess(true)
        // Redirect to thank you page after a short delay
        setTimeout(() => {
          router.push('/thank-you')
        }, 2000)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred while submitting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700">{error}</p>
              <Button 
                onClick={() => router.push('/')}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700">Your responses have been recorded successfully.</p>
              <p className="text-gray-700 mt-2">Redirecting to Thank You page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
            {survey?.title}
          </h1>
          {survey?.location && (
            <p className="text-lg text-gray-600">{survey.location}</p>
          )}
        </div>
        
        <div className="space-y-8">
          {survey?.questions.map((question, index) => (
            <Card key={question.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {question.question_text}
                      </h3>
                      {question.is_custom && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-12">
                  <RadioGroup
                    value={responses.find(r => r.questionId === question.id)?.answer || ''}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                    className="space-y-3"
                  >
                    {Array.isArray(question.options) && question.options.length > 0 ? (
                      question.options.map((option, optIndex) => {
                        // Improved option text handling
                        let optionText = '';
                        try {
                          if (typeof option === 'object' && option !== null) {
                            optionText = String((option as OptionObject).label || 
                                               (option as OptionObject).value || 
                                               JSON.stringify(option));
                          } else {
                            optionText = String(option);
                          }
                        } catch (err) {
                          console.error('Error parsing option:', err);
                          optionText = 'Invalid option';
                        }
                        
                        return (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionText} id={`q${question.id}-opt${optIndex}`} />
                            <Label htmlFor={`q${question.id}-opt${optIndex}`} className="text-gray-700">
                              {optionText}
                            </Label>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-red-500">No options available for this question</p>
                    )}
                  </RadioGroup>
                  
                  <div className="mt-4">
                    <Label htmlFor={`comment-${question.id}`} className="text-gray-700 mb-2 block">
                      Additional Comments (Optional)
                    </Label>
                    <Textarea
                      id={`comment-${question.id}`}
                      value={comments[question.id] || ''}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      placeholder="Add any comments or thoughts..."
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !survey}
              className="w-full sm:w-auto px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}