'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

type Question = {
  id: string
  text: string
  options: string[] | Record<string, any>
}

type OptionObject = {
  label?: string
  value?: string
  [key: string]: any
}

export default function SurveyPage() {
  const [surveyName, setSurveyName] = useState('')
  const [location, setLocation] = useState('')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [customQuestion, setCustomQuestion] = useState('')
  const [customOptions, setCustomOptions] = useState<string[]>(['', ''])
  const [customQuestions, setCustomQuestions] = useState<Question[]>([])
  const [dbQuestions, setDbQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  
  // Constants for restrictions
  const MAX_OPTIONS = 2;
  const MAX_QUESTIONS = 3;

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      console.log('Fetching questions from database...')
      const { data, error } = await supabase.from('survey_questions').select('*')
      console.log('Raw data from database:', data)
      if (error) {
        console.error('Error fetching questions:', error)
        setError(`Failed to load survey questions: ${error.message || 'Database connection error'}`)
      } else {
        const formatted = data.map((q: any, index: number) => {
          // Process options to ensure they're always strings
          let processedOptions = q.options;
          if (Array.isArray(q.options)) {
            processedOptions = q.options.map((opt: any) => 
              typeof opt === 'object' && opt !== null 
                ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
                : String(opt)
            );
          } else if (typeof q.options === 'object' && q.options !== null) {
            processedOptions = Object.values(q.options).map((opt: any) => 
              typeof opt === 'object' && opt !== null 
                ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
                : String(opt)
            );
          }
          
          return {
            id: `db-${index}`,
            text: q.question_text,
            options: processedOptions,
          };
        });
        console.log('Formatted questions:', formatted)
        setDbQuestions(formatted)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev => {
      // If trying to add a new question but already at the limit, don't add
      if (!prev.includes(id) && prev.length >= MAX_QUESTIONS) {
        setError(`You can only select up to ${MAX_QUESTIONS} questions per survey.`);
        return prev;
      }
      
      // Clear error if removing a question or under the limit
      if (error?.includes(`${MAX_QUESTIONS} questions`)) {
        setError(null);
      }
      
      return prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id];
    });
  }

  const handleAddCustomQuestion = () => {
    // Check if both options have values (both are required)
    if (!customQuestion || customOptions.some(opt => !opt.trim())) {
      setError('Please enter a question and fill in both options.');
      return;
    }
    
    if (isEditing && editingQuestion) {
      // Update existing question
      const updatedQuestions = customQuestions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, text: customQuestion, options: customOptions.filter(opt => opt.trim() !== '') } 
          : q
      );
      setCustomQuestions(updatedQuestions);
      setIsEditing(false);
      setEditingQuestion(null);
    } else {
      // Add new question
      const newQuestion: Question = {
        id: `custom-${customQuestions.length + 1}`,
        text: customQuestion,
        options: customOptions.filter(opt => opt.trim() !== ''),
      }
      setCustomQuestions([...customQuestions, newQuestion])
    }
    
    setCustomQuestion('')
    setCustomOptions(['', '']) // Reset to 2 empty options
    setError(null) // Clear any errors
  }
  
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setCustomQuestion(question.text);
    
    // Ensure options are properly converted to strings for editing
    let optionsArray: string[] = [];
    if (Array.isArray(question.options)) {
      optionsArray = question.options.map(opt => 
        typeof opt === 'object' && opt !== null 
          ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
          : String(opt)
      );
    } else if (typeof question.options === 'object' && question.options !== null) {
      optionsArray = Object.values(question.options).map(opt => 
        typeof opt === 'object' && opt !== null 
          ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
          : String(opt)
      );
    }
    
    // Ensure exactly 2 options
    while (optionsArray.length < MAX_OPTIONS) {
      optionsArray.push('');
    }
    if (optionsArray.length > MAX_OPTIONS) {
      optionsArray = optionsArray.slice(0, MAX_OPTIONS);
    }
    
    setCustomOptions(optionsArray);
    setIsEditing(true);
  }
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingQuestion(null);
    setCustomQuestion('');
    setCustomOptions(['', '']); // Reset to 2 empty options
  }
  
  const handleOptionChange = (index: number, value: string) => {
    if (index < MAX_OPTIONS) {
      const newOptions = [...customOptions];
      newOptions[index] = value;
      setCustomOptions(newOptions);
    }
  }
  
  const removeOption = (index: number) => {
    // Instead of removing the option, just clear it
    if (index < MAX_OPTIONS) {
      const newOptions = [...customOptions];
      newOptions[index] = '';
      setCustomOptions(newOptions);
    }
  }
  
  const handleDeleteQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
    setSelectedQuestionIds(prev => prev.filter(qId => qId !== id));
  }

  const allQuestions = [...dbQuestions, ...customQuestions]
  const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.includes(q.id))

  // Function to save a question to the database
  const saveQuestionToDatabase = async (question: Question) => {
    setIsSaving(true)
    setSaveSuccess(null)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Format the question for the database
      const questionData = {
        question_text: question.text,
        options: Array.isArray(question.options) ? question.options : [],
      }
      
      const { data, error } = await supabase
        .from('survey_questions')
        .insert([questionData])
        .select()
      
      if (error) {
        console.error('Error saving question:', error)
        setError(`Failed to save question: ${error.message}`)
      } else {
        console.log('Question saved successfully:', data)
        setSaveSuccess(`Question "${question.text}" saved to database successfully!`)
        
        // Refresh the questions from the database
        fetchQuestions()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred while saving. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Function to save all custom questions
  const saveAllCustomQuestions = async () => {
    if (customQuestions.length === 0) {
      setError('No custom questions to save.')
      return
    }
    
    setIsSaving(true)
    setSaveSuccess(null)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Format all questions for the database
      const questionsData = customQuestions.map(question => ({
        question_text: question.text,
        options: Array.isArray(question.options) ? question.options : [],
      }))
      
      const { data, error } = await supabase
        .from('survey_questions')
        .insert(questionsData)
      
      if (error) {
        console.error('Error saving questions:', error)
        setError(`Failed to save questions: ${error.message}`)
      } else {
        console.log('Questions saved successfully:', data)
        setSaveSuccess(`${customQuestions.length} question(s) saved to database successfully!`)
        
        // Clear custom questions after saving
        setCustomQuestions([])
        
        // Refresh the questions from the database
        fetchQuestions()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred while saving. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold font-display tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Create Survey
          </h1>
          <p className="text-lg text-gray-600 font-normal">
            Design your survey by selecting questions or adding custom ones
          </p>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50/80 to-white/90 hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
          <CardContent className="space-y-6 p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchQuestions}
                    disabled={isLoading}
                    className="border-red-200 text-red-700 hover:bg-red-100"
                  >
                    {isLoading ? 'Retrying...' : 'Retry'}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold text-gray-700">Survey Name</Label>
                <Input
                  value={surveyName}
                  onChange={e => setSurveyName(e.target.value)}
                  placeholder="Enter survey name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-700">Location</Label>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter location"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-700">Select Questions</Label>
                <div className="border rounded-lg p-6 max-h-[400px] overflow-y-auto space-y-4 mt-2 bg-white/50">
                  {selectedQuestionIds.length >= MAX_QUESTIONS && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg mb-3">
                      <p className="text-sm">You've selected the maximum of {MAX_QUESTIONS} questions.</p>
                    </div>
                  )}
                
                  {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading questions...</div>
                  ) : allQuestions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No questions available</div>
                  ) : (
                    allQuestions.map(question => (
                      <div key={question.id} className="flex items-start space-x-3 p-3 hover:bg-indigo-50/50 rounded-lg transition-colors">
                        <Checkbox
                          checked={selectedQuestionIds.includes(question.id)}
                          onCheckedChange={() => toggleQuestion(question.id)}
                          disabled={!selectedQuestionIds.includes(question.id) && selectedQuestionIds.length >= MAX_QUESTIONS}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{question.text}</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                            {Array.isArray(question.options) 
                              ? question.options.map((opt, i) => (
                                  <li key={i}>{typeof opt === 'object' && opt !== null 
                                    ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
                                    : String(opt)}</li>
                                ))
                              : typeof question.options === 'object' && question.options !== null
                                ? Object.values(question.options).map((value, i) => (
                                    <li key={i}>{typeof value === 'object' && value !== null 
                                      ? ((value as OptionObject).label || (value as OptionObject).value || JSON.stringify(value)) 
                                      : String(value)}</li>
                                  ))
                                : <li>No options available</li>
                            }
                          </ul>
                        </div>
                        {question.id.startsWith('custom-') && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditQuestion(question)}
                              className="text-indigo-600 hover:bg-indigo-50"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4 bg-white/50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700">
                  {isEditing ? 'Edit Question' : 'Add Your Own Question'}
                </h4>
                <Input
                  value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  placeholder="Enter your question"
                  className="mt-2"
                />
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium text-gray-700">Options (exactly 2 required)</Label>
                  </div>
                  
                  {customOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => removeOption(index)}
                        variant="outline" 
                        size="sm"
                        type="button"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Clear
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleAddCustomQuestion}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {isEditing ? 'Update Question' : 'Add Question'}
                  </Button>
                  {isEditing && (
                    <Button 
                      onClick={cancelEdit}
                      variant="outline"
                      className="text-gray-600"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {customQuestions.length > 0 && (
                <div className="bg-white/50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-700">Custom Questions</h4>
                    <Button 
                      onClick={saveAllCustomQuestions}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? 'Saving...' : 'Save to Database'}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {customQuestions.map((q) => (
                      <div key={q.id} className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-medium text-gray-900">{q.text}</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {Array.isArray(q.options) && q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          onClick={() => saveQuestionToDatabase(q)}
                          disabled={isSaving}
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p>{saveSuccess}</p>
                </div>
              )}

              <Button
                onClick={() => console.log({ surveyName, location, selectedQuestions })}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 ease-in-out"
              >
                Preview in Console
              </Button>

              <div className="pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Survey Preview</h3>
                <div className="bg-white/50 p-6 rounded-lg space-y-4">
                  <p className="text-gray-700"><span className="font-semibold">Name:</span> {surveyName}</p>
                  <p className="text-gray-700"><span className="font-semibold">Location:</span> {location}</p>
                  <div className="space-y-4">
                    {selectedQuestions.map(q => (
                      <div key={q.id} className="p-4 bg-white rounded-lg shadow-sm">
                        <p className="font-medium text-gray-900">{q.text}</p>
                        <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
                          {Array.isArray(q.options) 
                            ? q.options.map((o, i) => (
                                <li key={i}>{typeof o === 'object' && o !== null 
                                  ? ((o as OptionObject).label || (o as OptionObject).value || JSON.stringify(o)) 
                                  : String(o)}</li>
                              ))
                            : typeof q.options === 'object' && q.options !== null
                              ? Object.values(q.options).map((value, i) => (
                                  <li key={i}>{typeof value === 'object' && value !== null 
                                    ? ((value as OptionObject).label || (value as OptionObject).value || JSON.stringify(value)) 
                                    : String(value)}</li>
                                ))
                              : <li>No options available</li>
                          }
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
