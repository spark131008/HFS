'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Define database types
type DBQuestion = {
  id: number
  question_text: string
  options: Array<string | OptionObject>
  category: string
}

type Question = {
  id: string
  text: string
  options: Array<string | OptionObject>
  category: string
  is_custom?: boolean
}

type OptionObject = {
  label?: string
  value?: string
  [key: string]: string | undefined
}

export default function SurveyCreationPage() {
  const router = useRouter()
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
  
  // New state variables for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [editSurveyId, setEditSurveyId] = useState<string | null>(null)
  
  // New state variables for auto-save functionality
  const [autoSavedId, setAutoSavedId] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Constants for restrictions
  const MAX_OPTIONS = 2;
  const MAX_QUESTIONS = 3;

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Redirect to login if no user
        console.log('User not authenticated, redirecting to login')
        router.push('/login')
      }
    }
    
    checkUser()
  }, [router])

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      console.log('Fetching questions from database...')
      const { data, error } = await supabase.from('question_bank').select('*')
      console.log('Raw data from database:', data)
      if (error) {
        console.error('Error fetching questions:', error)
        setError(`Failed to load survey questions: ${error.message || 'Database connection error'}`)
      } else {
        const formatted = (data as DBQuestion[]).map((q) => {
          // Process options to ensure they're always strings
          let processedOptions = q.options;
          if (Array.isArray(q.options)) {
            processedOptions = q.options.map((opt) => 
              typeof opt === 'object' && opt !== null 
                ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
                : String(opt)
            );
          } else if (typeof q.options === 'object' && q.options !== null) {
            processedOptions = Object.values(q.options).map((opt) => 
              typeof opt === 'object' && opt !== null 
                ? ((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt)) 
                : String(opt)
            );
          }
          
          return {
            id: `db-${q.id}`, // Store the actual database ID
            text: q.question_text,
            options: processedOptions,
            category: q.category
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
        setError(`You can only select up to ${MAX_QUESTIONS} questions per survey.`)
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
        category: '',
        is_custom: true // Add flag to identify custom questions
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

  // Add saveSurveyToDatabase function before the return statement
  const saveSurveyToDatabase = async () => {
    if (!surveyName.trim()) {
      setError('Please enter a survey name');
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(null);
    setError(null);

    try {
      const supabase = createClient();
      
      // Check if survey has questions selected to determine status
      const isComplete = selectedQuestions.length >= MAX_QUESTIONS;
      const status = isComplete ? 'active-ready' : 'draft';
      
      // Determine if we're creating a new survey or updating an existing one
      if (isEditMode && editSurveyId) {
        // We're updating an existing survey
        console.log(`Updating existing survey with ID: ${editSurveyId}, status: ${status}`);
        
        // Step 1: Update the survey record in the survey table
        const surveyData = {
          title: surveyName,
          location: location,
          updated_at: new Date().toISOString(),
          status: status
        };

        console.log("Updating survey record:", JSON.stringify(surveyData, null, 2));

        const { error: updateError } = await supabase
          .from('survey')
          .update(surveyData)
          .eq('id', editSurveyId);

        if (updateError) {
          console.error('Error updating survey:', updateError);
          setError(`Failed to update survey: ${updateError.message}`);
          setIsSaving(false);
          return;
        }
        
        console.log('Survey record updated successfully');
        
        // Only proceed with question updates if questions are selected
        if (selectedQuestions.length > 0) {
          // First, fetch the current questions to determine what needs to be updated vs. added/deleted
          const { data: currentQuestions, error: fetchError } = await supabase
            .from('survey_questions')
            .select('*')
            .eq('survey_id', editSurveyId);
            
          if (fetchError) {
            console.error('Error fetching existing survey questions:', fetchError);
            setError(`Failed to update survey questions: ${fetchError.message}`);
            setIsSaving(false);
            return;
          }
          
          console.log('Fetched current questions:', currentQuestions);
          
          // Create a map of current questions by ID for easier lookup
          const currentQuestionsMap = new Map();
          if (currentQuestions) {
            currentQuestions.forEach(q => {
              currentQuestionsMap.set(q.id, q);
            });
          }
          
          // Process each selected question
          for (const question of selectedQuestions) {
            // Find if this question already exists in the database
            const existingQuestion = currentQuestions?.find(q => 
              q.question_text === question.text && 
              JSON.stringify(q.options) === JSON.stringify(Array.isArray(question.options) ? question.options : [])
            );
            
            if (existingQuestion) {
              // Question exists and hasn't changed - no need to update
              console.log(`Question "${question.text}" already exists with ID ${existingQuestion.id} - no changes needed`);
              // Remove from the map so we know it's been processed
              currentQuestionsMap.delete(existingQuestion.id);
            } else {
              // Check if there's a question with the same text but different options
              const similarQuestion = currentQuestions?.find(q => q.question_text === question.text);
              
              if (similarQuestion) {
                // Update the existing question with new options
                console.log(`Updating question "${question.text}" with ID ${similarQuestion.id} with new options`);
                const { error: updateQError } = await supabase
                  .from('survey_questions')
                  .update({
                    options: Array.isArray(question.options) ? question.options : [],
                    updated_at: new Date().toISOString() // Adding updated_at timestamp
                  })
                  .eq('id', similarQuestion.id);
                  
                if (updateQError) {
                  console.error(`Error updating question "${question.text}":`, updateQError);
                }
                
                // Remove from the map so we know it's been processed
                currentQuestionsMap.delete(similarQuestion.id);
              } else {
                // This is a new question - insert it
                console.log(`Adding new question "${question.text}" to survey`);
                
                // For questions from question_bank, store a reference to the question_bank_id
                // For custom questions, question_bank_id will be null
                const questionId = question.id.startsWith('db-') 
                  ? dbQuestions.find(q => q.id === question.id)?.id.replace('db-', '') 
                  : null;
                
                const { error: insertQError } = await supabase
                  .from('survey_questions')
                  .insert({
                    survey_id: editSurveyId,
                    question_bank_id: questionId,
                    question_text: question.text,
                    options: Array.isArray(question.options) ? question.options : [],
                    category: question.category,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString() // Adding updated_at timestamp
                  });
                  
                if (insertQError) {
                  console.error(`Error inserting new question "${question.text}":`, insertQError);
                }
              }
            }
          }
          
          // Any questions still in the map need to be deleted as they're no longer selected
          if (currentQuestionsMap.size > 0) {
            console.log(`Deleting ${currentQuestionsMap.size} questions that are no longer selected`);
            
            for (const [id] of currentQuestionsMap.entries()) {
              const { error: deleteQError } = await supabase
                .from('survey_questions')
                .delete()
                .eq('id', id);
                
              if (deleteQError) {
                console.error(`Error deleting question with ID ${id}:`, deleteQError);
              }
            }
          }
          
          console.log('Survey questions updated successfully');
        } else {
          // If no questions are selected, delete all existing questions
          console.log('No questions selected, removing any existing questions');
          
          const { error: deleteAllError } = await supabase
            .from('survey_questions')
            .delete()
            .eq('survey_id', editSurveyId);
            
          if (deleteAllError) {
            console.error('Error removing existing survey questions:', deleteAllError);
          }
        }
        
        setSaveSuccess(`Survey ${isComplete ? 'completed and activated' : 'saved as draft'}!`);
        
        // Redirect back to my-surveys page after successful update
        setTimeout(() => {
          router.push('/my-surveys');
        }, 2000);
      } else {
        // We're creating a new survey (or updating an auto-saved one)
        
        // If we have an auto-saved survey ID, use that instead of creating a new one
        if (autoSavedId) {
          console.log(`Updating auto-saved survey with ID: ${autoSavedId}, status: ${status}`);
          
          // Step 1: Update the survey record in the survey table
          const surveyData = {
            title: surveyName,
            location: location,
            updated_at: new Date().toISOString(),
            status: status
          };

          console.log("Updating auto-saved survey record:", JSON.stringify(surveyData, null, 2));

          const { error: updateError } = await supabase
            .from('survey')
            .update(surveyData)
            .eq('id', autoSavedId);

          if (updateError) {
            console.error('Error updating auto-saved survey:', updateError);
            setError(`Failed to update survey: ${updateError.message}`);
            setIsSaving(false);
            return;
          }
          
          console.log('Auto-saved survey record updated successfully');
          
          // Only proceed with question updates if questions are selected
          if (selectedQuestions.length > 0) {
            // Step 2: Delete any existing questions for this survey from survey_questions
            const { error: deleteError } = await supabase
              .from('survey_questions')
              .delete()
              .eq('survey_id', autoSavedId);
              
            if (deleteError) {
              console.error('Error deleting existing survey questions:', deleteError);
              setError(`Failed to update survey questions: ${deleteError.message}`);
              setIsSaving(false);
              return;
            }
            
            console.log('Existing survey questions deleted successfully');
            
            // Step 3: Insert new questions into survey_questions
            const surveyQuestionsData = selectedQuestions.map((question) => {
              // For questions from question_bank, store a reference to the question_bank_id
              // For custom questions, question_bank_id will be null
              const questionId = question.id.startsWith('db-') 
                ? dbQuestions.find(q => q.id === question.id)?.id.replace('db-', '') 
                : null;
              
              return {
                survey_id: autoSavedId,
                question_bank_id: questionId,
                question_text: question.text,
                options: Array.isArray(question.options) ? question.options : [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString() // Adding updated_at timestamp
              };
            });
            
            const { error: insertError } = await supabase
              .from('survey_questions')
              .insert(surveyQuestionsData);
            
            if (insertError) {
              console.error('Error inserting updated survey questions:', insertError);
              setError(`Survey updated, but failed to save questions: ${insertError.message}`);
            } else {
              console.log('Survey questions saved successfully');
            }
          } else {
            console.log('No questions selected, updated auto-saved survey without questions');
          }
          
          setSaveSuccess(`Survey ${isComplete ? 'completed and activated' : 'saved as draft'}!`);
          
          // Reset form after successful save
          setSurveyName('');
          setLocation('');
          setSelectedQuestionIds([]);
          setCustomQuestions([]);
          setAutoSavedId(null); // Reset the auto-saved ID
          
          // Redirect back to my-surveys page after successful update
          setTimeout(() => {
            router.push('/my-surveys');
          }, 2000);
        } else {
          // Create a completely new survey
          // Step 1: Create a new survey record in the survey table
          const surveyData = {
            title: surveyName,
            location: location,
            created_at: new Date().toISOString(),
            status: status
          };

          console.log("Creating new survey record:", JSON.stringify(surveyData, null, 2));
          
          // Insert the survey and get the new survey ID
          const { data: surveyResult, error: surveyError } = await supabase
            .from('survey')
            .insert([surveyData])
            .select();

          if (surveyError) {
            console.error('Error creating survey record:', surveyError);
            setError(`Failed to create survey: ${surveyError.message}`);
            setIsSaving(false);
            return;
          }
          
          console.log('Survey record created successfully:', surveyResult);
          
          if (!surveyResult || surveyResult.length === 0) {
            throw new Error('Survey record was created but no ID was returned');
          }
          
          // Extract the new survey ID
          const surveyId = surveyResult[0].id;
          console.log('New survey ID:', surveyId);
          
          // Only proceed with question insertion if questions are selected
          if (selectedQuestions.length > 0) {
            // Step 2: Insert questions directly to survey_questions
            // For each question, determine if it's from question_bank or custom
            const surveyQuestionsData = selectedQuestions.map((question) => {
              // For questions from question_bank, store a reference to the question_bank_id
              // For custom questions, question_bank_id will be null
              const questionId = question.id.startsWith('db-') 
                ? dbQuestions.find(q => q.id === question.id)?.id.replace('db-', '') 
                : null;
              
              return {
                survey_id: surveyId,
                question_bank_id: questionId,
                question_text: question.text,
                options: Array.isArray(question.options) ? question.options : [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString() // Adding updated_at timestamp
              };
            });
            
            const { error: sqError } = await supabase
              .from('survey_questions')
              .insert(surveyQuestionsData);
            
            if (sqError) {
              console.error('Error saving questions to survey_questions:', sqError);
              setError(`Survey created, but failed to save questions: ${sqError.message}`);
            } else {
              console.log('Survey questions saved successfully');
            }
          } else {
            console.log('No questions selected, created survey without questions (draft)');
          }
          
          setSaveSuccess(`Survey ${isComplete ? 'completed and activated' : 'saved as draft'}!`);
          
          // Reset form after successful save
          setSurveyName('');
          setLocation('');
          setSelectedQuestionIds([]);
          setCustomQuestions([]);
          
          // Redirect back to my-surveys page after successful creation
          setTimeout(() => {
            router.push('/my-surveys');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Unexpected error during survey operation:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save function that creates/updates survey with just name and location
  const autoSaveSurvey = async (currentLocationValue = '') => {
    // Clear any previous timeout to prevent multiple rapid saves
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Use the passed value if available, otherwise use the state
    const currentLocation = currentLocationValue !== null ? currentLocationValue.trim() : location.trim();
    const currentSurveyName = surveyName.trim();
    
    // Don't auto-save if either survey name or location is empty
    if (!surveyName.trim() || !currentLocation) {
      return;
    }
    
    // Set a timeout to wait for user to finish typing
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        console.log('[Auto-Save] Starting auto-save process');
        console.log('[Auto-Save] Saving location:', JSON.stringify(currentLocation)); // Log the exact string for debugging
        const supabase = createClient();
        
        // Get the current user - needed for the user_id field
        console.log('[Auto-Save] Fetching current user');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('[Auto-Save] Error getting user:', userError);
          return;
        }
        
        if (!user) {
          console.error('[Auto-Save] No authenticated user found. User object:', user);
          return;
        }
        
        console.log('[Auto-Save] User retrieved successfully. User ID:', user.id);
        
        // Create payload once to ensure consistency
        const surveyPayload = {
          title: currentSurveyName,
          location: currentLocation, // Using the full location string
          updated_at: new Date().toISOString(),
          status: 'draft', // Always set to draft during auto-save
          user_id: user.id // Add the user_id field
        };
        
        // Debug log the payload to ensure location is correct before sending
        console.log('[Auto-Save] Survey payload:', JSON.stringify(surveyPayload, null, 2));
        
        // If we're in edit mode or have an auto-saved ID, update existing survey
        if (isEditMode && editSurveyId) {
          // Update existing survey
          console.log(`[Auto-Save] Updating existing survey. Edit mode: ${isEditMode}, Survey ID: ${editSurveyId}`);
          
          const { data, error } = await supabase
            .from('survey')
            .update(surveyPayload)
            .eq('id', editSurveyId)
            .select(); // Add select() to return the updated data
            
          if (error) {
            console.error('[Auto-Save] Error updating existing survey:', error);
            console.error('[Auto-Save] Error details - Message:', error.message);
            console.error('[Auto-Save] Error details - Code:', error.code);
            console.error('[Auto-Save] Error details - Hint:', error.hint);
            console.error('[Auto-Save] Error details - Details:', error.details);
          } else {
            console.log('[Auto-Save] Successfully updated existing survey:', editSurveyId);
            console.log('[Auto-Save] Updated data:', data);
            setLastAutoSaved(new Date());
          }
        } else if (autoSavedId) {
          // Update our previously auto-saved survey
          console.log(`[Auto-Save] Updating previously auto-saved survey. ID: ${autoSavedId}`);
          
          const { data, error } = await supabase
            .from('survey')
            .update(surveyPayload)
            .eq('id', autoSavedId)
            .select(); // Add select() to return the updated data
            
          if (error) {
            console.error('[Auto-Save] Error updating previously auto-saved survey:', error);
            console.error('[Auto-Save] Error details - Message:', error.message);
            console.error('[Auto-Save] Error details - Code:', error.code);
            console.error('[Auto-Save] Error details - Hint:', error.hint);
            console.error('[Auto-Save] Error details - Details:', error.details);
          } else {
            console.log('[Auto-Save] Successfully updated auto-saved survey:', autoSavedId);
            console.log('[Auto-Save] Updated data:', data);
            setLastAutoSaved(new Date());
          }
        } else {
          // Create a new survey as draft
          console.log('[Auto-Save] Creating new survey as draft');
          
          // For new surveys, include the created_at field
          const newSurveyPayload = {
            ...surveyPayload,
            created_at: new Date().toISOString()
          };
          
          console.log('[Auto-Save] New survey payload:', JSON.stringify(newSurveyPayload, null, 2));
          
          const { data, error } = await supabase
            .from('survey')
            .insert([newSurveyPayload])
            .select();
            
          if (error) {
            console.error('[Auto-Save] Error creating auto-saved survey:', error);
            console.error('[Auto-Save] Error details - Message:', error.message);
            console.error('[Auto-Save] Error details - Code:', error.code);
            console.error('[Auto-Save] Error details - Hint:', error.hint);
            console.error('[Auto-Save] Error details - Details:', error.details);
            
            // Check for specific error conditions
            if (error.code === '23502') {
              console.error('[Auto-Save] This appears to be a not-null violation. Check if all required fields are present.');
            } else if (error.code === '23503') {
              console.error('[Auto-Save] This appears to be a foreign key violation. Check if referenced keys exist.');
            } else if (error.code === '42P01') {
              console.error('[Auto-Save] Relation does not exist. Check table name.');
            }
            
            // Log the Supabase client state
            console.log('[Auto-Save] Supabase auth state:', await supabase.auth.getSession());
          } else if (data && data.length > 0) {
            console.log('[Auto-Save] Auto-created new survey as draft. Response data:', data);
            console.log('[Auto-Save] New survey ID:', data[0].id);
            console.log('[Auto-Save] Saved location value:', data[0].location);
            setAutoSavedId(data[0].id);
            setLastAutoSaved(new Date());
          } else {
            console.error('[Auto-Save] No error but also no data returned when creating survey');
          }
        }
      } catch (err) {
        console.error('[Auto-Save] Unexpected error during auto-save:', err);
        if (err instanceof Error) {
          console.error('[Auto-Save] Error message:', err.message);
          console.error('[Auto-Save] Error stack:', err.stack);
        }
      } finally {
        setIsAutoSaving(false);
      }
    }, 1000);
  };

  // Check for edit mode in URL parameters
  useEffect(() => {
    const checkForEditMode = async () => {
      // Extract survey ID from URL if in edit mode
      // In client-side navigation, we need to get the URL search params
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const editParam = urlParams.get('edit');
        
        if (editParam) {
          setIsEditMode(true);
          setEditSurveyId(editParam);
          console.log('Edit mode detected, survey ID:', editParam);
          
          // Fetch the existing survey data
          await fetchExistingSurvey(editParam);
        }
      }
    };
    
    checkForEditMode();
  }, []);
  
  // Function to fetch existing survey data when in edit mode
  const fetchExistingSurvey = async (surveyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // 1. First get the survey details (title, location, etc.)
      const { data: surveyData, error: surveyError } = await supabase
        .from('survey')
        .select('*')
        .eq('id', surveyId)
        .single();
      
      if (surveyError) {
        console.error('Error fetching survey:', surveyError);
        setError(`Failed to load survey: ${surveyError.message}`);
        return;
      }
      
      if (!surveyData) {
        setError('Survey not found');
        return;
      }
      
      console.log('Fetched survey data:', surveyData);
      
      // Set survey title and location
      setSurveyName(surveyData.title || '');
      setLocation(surveyData.location || '');
      
      // 2. Next get the survey questions from survey_questions table
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('position', { ascending: true });
        
        console.log('Survey questions query result:', { data: questionsData, error: questionsError });
        
        // Wait for dbQuestions to be loaded before proceeding
        await fetchQuestions(); 
        
        // Even if there's an error with the survey_questions table or no data,
        // we'll just treat it as if there are no questions for this survey
        // This prevents errors when the survey exists but has no questions yet
        if (questionsError) {
          console.log('Note: Error fetching survey questions, treating as empty:', questionsError);
          // Continue with empty questions instead of returning an error
          setSelectedQuestionIds([]);
          setCustomQuestions([]);
        } else if (!questionsData || questionsData.length === 0) {
          console.log('No questions found for this survey - showing default question bank with no selections');
          // Just show the normal question bank with no pre-selections
          setSelectedQuestionIds([]);
          setCustomQuestions([]);
        } else {
          // If we have questions, process them normally
          const customQs: Question[] = [];
          const selectedIds: string[] = [];
          
          questionsData.forEach((q, index) => {
            // For each question in the survey, try to find it in dbQuestions
            const matchingDbQuestion = dbQuestions.find(dbQ => dbQ.text === q.question_text);
            
            if (matchingDbQuestion) {
              // If it exists in dbQuestions, just add its ID to selectedQuestionIds
              selectedIds.push(matchingDbQuestion.id);
            } else {
              // If it doesn't exist in dbQuestions, create a custom question
              const customQ: Question = {
                id: `custom-edit-${index}`,
                text: q.question_text,
                options: q.options || [],
                category: q.category || '',
              };
              customQs.push(customQ);
              selectedIds.push(customQ.id);
            }
          });
          
          // Set the custom questions and selected question IDs
          setCustomQuestions(customQs);
          setSelectedQuestionIds(selectedIds);
        }
      } catch (innerErr) {
        console.error('Unexpected error in survey_questions query:', innerErr);
        // Even with an unexpected error, continue with empty questions
        console.log('Continuing with empty questions list due to error');
        setSelectedQuestionIds([]);
        setCustomQuestions([]);
      }
      
    } catch (err) {
      console.error('Unexpected error loading survey:', err);
      setError('An unexpected error occurred while loading the survey');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold font-display tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {isEditMode ? 'Edit Survey' : 'Create Survey'}
          </h1>
          <p className="text-lg text-gray-600 font-normal">
            {isEditMode 
              ? 'Update your survey by modifying questions or selections' 
              : 'Design your survey by selecting questions or adding custom ones'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
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
                
                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <p>{saveSuccess}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold text-gray-700">Survey Name</Label>
                    <Input
                      value={surveyName}
                      onChange={e => {
                        setSurveyName(e.target.value);
                        autoSaveSurvey(); // Trigger auto-save when name changes
                      }}
                      placeholder="Enter survey name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-gray-700">Location</Label>
                    <div className="relative">
                    <Input
                      value={location}
                      onChange={e => {
                        const newLocation = e.target.value;
                        setLocation(newLocation);
                        
                        // Modify autoSaveSurvey to accept the current location value
                        autoSaveSurvey(newLocation);
                      }}
                      placeholder="Enter location"
                      className="mt-2"
                    />
                      {isAutoSaving && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-pulse text-blue-600 text-xs">Saving...</div>
                        </div>
                      )}
                      {lastAutoSaved && !isAutoSaving && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="text-green-600 text-xs">Saved</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-gray-700">Select Questions</Label>
                    <div className="border rounded-lg p-6 max-h-[400px] overflow-y-auto space-y-4 mt-2 bg-white/50">
                      {selectedQuestionIds.length >= MAX_QUESTIONS && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg mb-3">
                          <p className="text-sm">You&apos;ve selected the maximum of {MAX_QUESTIONS} questions.</p>
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
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{question.text}</p>
                                {question.id.startsWith('custom-') && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                                {Array.isArray(question.options) 
                                  ? question.options.map((opt, i) => (
                                      <li key={i}>{
                                        typeof opt === 'object' && opt !== null 
                                          ? String((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt))
                                          : String(opt)
                                      }</li>
                                    ))
                                  : typeof question.options === 'object' && question.options !== null
                                    ? Object.values(question.options).map((value, i) => (
                                        <li key={i}>{
                                          typeof value === 'object' && value !== null 
                                            ? String((value as OptionObject).label || (value as OptionObject).value || JSON.stringify(value))
                                            : String(value)
                                        }</li>
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

                  <div className="space-y-4 bg-purple-50/50 border border-purple-100 p-6 rounded-lg">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-700">
                        {isEditing ? 'Edit Custom Question' : 'Add Your Own Custom Question'}
                      </h4>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Custom
                      </Badge>
                    </div>
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
                      </div>
                      
                      <div className="space-y-3">
                        {customQuestions.map((q) => (
                          <div key={q.id} className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm">
                            <div>
                              <p className="font-medium text-gray-900">{q.text}</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                {Array.isArray(q.options) 
                                  ? q.options.map((opt, i) => (
                                      <li key={i}>{
                                        typeof opt === 'object' && opt !== null 
                                          ? String((opt as OptionObject).label || (opt as OptionObject).value || JSON.stringify(opt))
                                          : String(opt)
                                      }</li>
                                    ))
                                  : typeof q.options === 'object' && q.options !== null
                                    ? Object.values(q.options).map((value, i) => (
                                        <li key={i}>{
                                          typeof value === 'object' && value !== null 
                                            ? String((value as OptionObject).label || (value as OptionObject).value || JSON.stringify(value))
                                            : String(value)
                                        }</li>
                                      ))
                                    : <li>No options available</li>
                                }
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={saveSurveyToDatabase}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Survey'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="sticky top-8">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50/80 to-white/90 hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Survey Preview</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-gray-700"><span className="font-semibold">Name:</span> {surveyName || 'Not set'}</p>
                    <p className="text-gray-700"><span className="font-semibold">Location:</span> {location || 'Not set'}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedQuestions.length > 0 ? (
                      selectedQuestions.map((q, index) => (
                        <div key={q.id} className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                              Q{index + 1}
                            </span>
                            <p className="font-medium text-gray-900">{q.text}</p>
                          </div>
                          <ul className="list-disc ml-6 text-sm text-gray-600">
                            {Array.isArray(q.options) 
                              ? q.options.map((o, i) => (
                                  <li key={i}>{
                                    typeof o === 'object' && o !== null 
                                      ? String((o as OptionObject).label || (o as OptionObject).value || JSON.stringify(o))
                                      : String(o)
                                  }</li>
                                ))
                              : typeof q.options === 'object' && q.options !== null
                                ? Object.values(q.options).map((value, i) => (
                                    <li key={i}>{
                                      typeof value === 'object' && value !== null 
                                        ? String((value as OptionObject).label || (value as OptionObject).value || JSON.stringify(value))
                                        : String(value)
                                    }</li>
                                  ))
                                : <li>No options available</li>
                            }
                          </ul>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No questions selected yet
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
