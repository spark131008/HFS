"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { OPERATIONAL_QUESTIONS } from '@/utils/operational-questions';

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff'
      }}>
        Loading...
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}

function SurveyContent() {
  // Get URL parameters
  const searchParams = useSearchParams();
  const restaurantCode = searchParams.get('code');

  // State for survey data
  const [surveyTitle, setSurveyTitle] = useState<string>('');
  const [surveyLocation, setSurveyLocation] = useState<string>('');
  const [surveyType, setSurveyType] = useState<'custom' | 'operational'>('custom');
  const [customOperationalImages, setCustomOperationalImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<string[]>([]);
  // Store question metadata (id and text) for saving individual answers
  // Note: survey_question_id is UUID type in the database
  const [questionMetadata, setQuestionMetadata] = useState<Array<{ id: string | null; question_text: string }>>([]);

  // State to track which question we're on
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  
  // Contact details state
  const [showContactQuestion, setShowContactQuestion] = useState(false);
  const [responseId, setResponseId] = useState<number | null>(null);
  const [contactType, setContactType] = useState<'phone' | 'email' | null>(null);
  const [contactValue, setContactValue] = useState<string>('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  
  // Lottery animation state
  const [showLottery, setShowLottery] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<'win' | 'lose' | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  // For swipe gestures
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchStartTime = useRef(0);

  // For emoji click animation
  const [clickedEmoji, setClickedEmoji] = useState<'left' | 'right' | null>(null);

  // For responsive design
  const [windowWidth, setWindowWidth] = useState(0);

  // Set up window width measurement
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Initialize on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset clicked emoji state when question changes
  useEffect(() => {
    setClickedEmoji(null);
  }, [questionIndex]);
  
  // Fortune cookie wisdom to show at the end
  const fortuneWisdom = "Your path is illuminated by the experiences you create. Stay curious, embrace change, and fortune will find you.";

  // Fetch survey data on component mount
  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!restaurantCode) {
        setError('Invalid QR code. Please scan again.');
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // First verify the restaurant code
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('restaurant_code', restaurantCode)
          .single();

        if (restaurantError || !restaurant) {
          setError('Restaurant not found. Please check the QR code.');
          setIsLoading(false);
          return;
        }

        // Then fetch the active survey for this restaurant
        const { data: surveys, error: surveyError } = await supabase
          .from('survey')
          .select(`
            id,
            title,
            location,
            survey_type,
            operational_images,
            survey_questions (
              id,
              question_text,
              options,
              position
            )
          `)
          .eq('restaurant_id', restaurant.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (surveyError || !surveys) {
          setError('No active survey found for this restaurant.');
          setIsLoading(false);
          return;
        }

        // Set survey type
        setSurveyType(surveys.survey_type || 'custom');

        // Set custom operational images if available
        if (surveys.survey_type === 'operational' && surveys.operational_images) {
          setCustomOperationalImages(surveys.operational_images as string[]);
        }

        // Load questions based on survey type
        let sortedQuestions: string[];
        let questionMeta: Array<{ id: string | null; question_text: string }>;
        
        // Both operational and custom surveys have questions in survey_questions table
        const sortedSurveyQuestions = surveys.survey_questions
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        sortedQuestions = sortedSurveyQuestions.map(q => q.question_text);
        // Use the actual question UUIDs from the database for both types
        questionMeta = sortedSurveyQuestions.map(q => ({ id: q.id, question_text: q.question_text }));

        console.log('Fetched survey data:', {
          title: surveys.title,
          location: surveys.location,
          surveyType: surveys.survey_type,
          customImages: surveys.operational_images,
          questions: sortedQuestions,
          questionMetadata: questionMeta
        });

        // Update state with survey data
        setSurveyTitle(surveys.title);
        setSurveyLocation(surveys.location);
        setQuestions(sortedQuestions);
        setQuestionMetadata(questionMeta);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('Failed to load survey. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [restaurantCode]);

  // Get the current image based on the question index
  const getCurrentImage = () => {
    // Initial screen - show logo for operational, fortune cookie for custom
    if (!showQuestions) {
      return surveyType === 'operational'
        ? "/operational/Mylapore_logo.PNG"
        : "/survey/1.png";
    }

    // End screen - show fortune cookie for both types
    if (finished) return "/survey/4.png";

    // For operational surveys, use contextual images
    if (surveyType === 'operational' && questionIndex < OPERATIONAL_QUESTIONS.length) {
      // First try custom images if uploaded
      if (customOperationalImages && customOperationalImages[questionIndex]) {
        return customOperationalImages[questionIndex];
      }
      // Fall back to default operational images
      return OPERATIONAL_QUESTIONS[questionIndex].defaultImage;
    }

    // For custom surveys, show image based on question number
    switch (questionIndex) {
      case 0: return "/survey/1.png";
      case 1: return "/survey/2.png";
      case 2: return "/survey/3.png";
      default: return "/survey/1.png";
    }
  };

  // Handle the "Start" button click
  const handleStart = () => {
    setShowQuestions(true);
  };

  // Handle emoji click with animation
  const handleEmojiClick = (direction: 'left' | 'right') => {
    // Don't process if already processing
    if (isProcessingAnswer) return;

    // Trigger visual feedback and keep it during transition
    setClickedEmoji(direction);

    // Process answer immediately (visual effect stays until next question loads)
    handleAnswer(direction);
  };

  // Handle answer submission
  const handleAnswer = useCallback(async (direction: string) => {
    if (isProcessingAnswer) {
      console.log('Already processing an answer, ignoring this one');
      return;
    }
    
    setIsProcessingAnswer(true);
    
    try {
      // Save the answer to the database
      const supabase = createClient();

      // First get the restaurant ID and active survey ID from the code
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('restaurant_code', restaurantCode)
        .single();

      if (!restaurant) {
        console.error('Restaurant not found');
        return;
      }

      // Get the active survey ID
      const { data: activeSurvey } = await supabase
        .from('survey')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!activeSurvey) {
        console.error('Active survey not found');
        return;
      }

      // Update local state with the new answer
      const updatedAnswers = [...answers, direction];
      setAnswers(updatedAnswers);

      // Save all answers at once when survey is complete
      if (questionIndex === questions.length - 1) {
        console.log('Saving final answers:', {
          questions,
          answers: updatedAnswers,
          questionAnswers: updatedAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
            acc[questions[idx]] = ans;
            return acc;
          }, {})
        });

        const { data: insertedData, error: responseError } = await supabase
          .from('survey_responses')
          .insert([{
            restaurant_id: restaurant.id,
            survey_id: activeSurvey.id,
            question_answers: updatedAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
              acc[questions[idx]] = ans;
              return acc;
            }, {}),
            submitted_at: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (responseError) {
          console.error('Error saving responses:', responseError);
        } else if (insertedData) {
          // Store the response ID so we can update it later with contact details
          setResponseId(insertedData.id);
          
          // Also save each answer individually to survey_response_answers table
          try {
            // Validate that we have question metadata
            if (!questionMetadata || questionMetadata.length === 0) {
              console.error('Question metadata is empty, cannot save individual answers. Metadata:', questionMetadata);
              // Continue with the rest of the function even if we can't save individual answers
            } else {

            if (questionMetadata.length !== updatedAnswers.length) {
              console.warn('Question metadata length mismatch:', {
                metadataLength: questionMetadata.length,
                answersLength: updatedAnswers.length,
                questionMetadata,
                updatedAnswers
              });
            }

            // Build answer records for insertion
            // Table structure: response_id (bigint), survey_question_id (uuid, NOT NULL), answer_value (text)
            // created_at is auto-generated, so we don't include it
            const answerRecords = updatedAnswers.map((answer, idx) => {
              const questionMeta = questionMetadata[idx];
              
              // Validate that we have a question ID (required field)
              if (!questionMeta?.id) {
                console.error(`Missing question ID for answer ${idx}:`, {
                  questionMeta,
                  questionText: questions[idx]
                });
                throw new Error(`Missing question ID for answer at index ${idx}`);
              }
              
              const record: {
                response_id: number;
                survey_question_id: string;
                answer_value: string;
              } = {
                response_id: insertedData.id,
                survey_question_id: questionMeta.id,
                answer_value: answer
              };
              console.log(`Answer record ${idx}:`, record);
              return record;
            });

            console.log('Attempting to insert answer records:', {
              count: answerRecords.length,
              records: answerRecords,
              responseId: insertedData.id
            });

            const { data: insertedAnswers, error: answersError } = await supabase
              .from('survey_response_answers')
              .insert(answerRecords)
              .select();

            if (answersError) {
              console.error('Error saving individual answers to survey_response_answers:', {
                error: answersError,
                message: answersError.message,
                details: answersError.details,
                hint: answersError.hint,
                code: answersError.code,
                recordsAttempted: answerRecords
              });
              // Note: We don't fail the whole operation if this fails, as the main response is already saved
            } else {
              console.log('Successfully saved individual answers to survey_response_answers:', {
                count: insertedAnswers?.length || 0,
                insertedAnswers
              });
            }
            } // End of else block for questionMetadata check
          } catch (err) {
            console.error('Unexpected error while saving individual answers:', {
              error: err,
              message: err instanceof Error ? err.message : 'Unknown error',
              stack: err instanceof Error ? err.stack : undefined
            });
            // Don't throw - main response is already saved
          }
        }
      }
      
      // Move to next question or finish
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // Show finished screen with fortune cookie
        setShowQuestions(false);
        setFinished(true);
      }
    } catch (err) {
      console.error('Error processing answer:', err);
    } finally {
      // Reset processing state after a delay
      setTimeout(() => {
        setIsProcessingAnswer(false);
      }, 300);
    }
  }, [questionIndex, questions, answers, restaurantCode, isProcessingAnswer, questionMetadata]);
  
  // Handle contact details submission
  const handleContactSubmit = useCallback(async () => {
    if (!responseId || !contactType || !contactValue.trim()) {
      console.log('Contact submit blocked:', { responseId, contactType, contactValue: contactValue.trim() });
      return;
    }

    console.log('Showing lottery screen for:', contactType);
    // Show lottery animation for both phone and email
    setShowLottery(true);
    setIsRolling(true);
    
    // Determine win/loss (1 in 10 chance)
    const hasWon = Math.random() < 0.1; // 10% chance
    
    // Roll animation for 2.5 seconds
    setTimeout(() => {
      setIsRolling(false);
      setLotteryResult(hasWon ? 'win' : 'lose');
      
      // Save contact details after showing result
      setTimeout(async () => {
        try {
          const supabase = createClient();
          const contactDetails: { phone_number?: string; email?: string } = {};
          
          if (contactType === 'phone') {
            contactDetails.phone_number = contactValue.trim();
          } else if (contactType === 'email') {
            contactDetails.email = contactValue.trim();
          }
          
          const { error: updateError } = await supabase
            .from('survey_responses')
            .update({ 
              contact_details: contactDetails,
              lottery: hasWon
            })
            .eq('id', responseId);

          if (updateError) {
            console.error('Error updating contact details:', updateError);
          }
        } catch (err) {
          console.error('Error saving contact details:', err);
        }
        
        // Keep showing finished screen after lottery (just hide lottery)
        setTimeout(() => {
          setShowLottery(false);
        }, 2000);
      }, 2000);
    }, 2500);
  }, [responseId, contactType, contactValue]);

  // Handle skip contact details
  const handleSkipContact = () => {
    setShowContactQuestion(false);
    setFinished(true);
  };
  
  // Swipe detection handlers with velocity and smooth animations
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    touchEndX.current = touchStartX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    touchEndX.current = e.touches[0].clientX;
    const swipeDistance = touchEndX.current - touchStartX.current;
    const swipeDistanceY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Prevent vertical scrolling if horizontal swipe is detected
    if (Math.abs(swipeDistance) > swipeDistanceY && Math.abs(swipeDistance) > 10) {
      e.preventDefault();
    }

    // Update swipe offset for real-time card movement
    setSwipeOffset(swipeDistance);

    // Set swipe direction for visual feedback
    if (Math.abs(swipeDistance) > 30) {
      setSwipeDirection(swipeDistance > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const swipeDistance = touchEndX.current - touchStartX.current;
    const swipeTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(swipeDistance) / swipeTime; // pixels per millisecond

    // Velocity-based threshold: fast swipes require less distance
    const screenWidth = window.innerWidth;
    const percentThreshold = screenWidth * 0.3;
    const swipeThreshold = velocity > 0.5
      ? Math.min(50, percentThreshold)
      : Math.max(100, percentThreshold);

    setIsSwiping(false);

    if (Math.abs(swipeDistance) > swipeThreshold) {
      const direction = swipeDistance > 0 ? 'right' : 'left';
      // Animate card off screen before processing answer
      setSwipeOffset(swipeDistance > 0 ? screenWidth : -screenWidth);
      setTimeout(() => {
        handleAnswer(direction);
        setSwipeOffset(0);
        setSwipeDirection(null);
      }, 250);
    } else {
      // Spring back animation
      setSwipeOffset(0);
      setSwipeDirection(null);
    }
  };
  
  // Effect to handle image changes when survey is completed
  useEffect(() => {
    if (finished) {
      console.log('Finished state changed, displaying final image: /survey/4.png');
    }
  }, [finished]);
  
  // Calculate card transform based on swipe offset
  const getCardTransform = () => {
    if (swipeOffset === 0) return {};

    const rotation = swipeOffset / 20; // Rotation based on swipe distance
    const opacity = Math.max(0.5, 1 - Math.abs(swipeOffset) / 400);

    return {
      transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
      opacity: opacity,
      transition: isSwiping ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  // Get swipe direction indicator styles with improved visuals
  const getSwipeIndicatorStyles = () => {
    const intensity = Math.min(Math.abs(swipeOffset) / 150, 1);

    if (!swipeDirection || intensity < 0.2) return { opacity: 0 };

    // Use red for not satisfied (left), green for satisfied (right)
    const leftColor = surveyType === 'operational'
      ? 'rgba(239, 68, 68, INTENSITY)' // Red for not satisfied
      : 'rgba(255, 75, 75, INTENSITY)'; // Original red for custom
    const rightColor = surveyType === 'operational'
      ? 'rgba(34, 197, 94, INTENSITY)' // Green for satisfied
      : 'rgba(75, 255, 75, INTENSITY)'; // Original green for custom

    return {
      background: swipeDirection === 'left'
        ? `linear-gradient(to left, transparent 0%, ${leftColor.replace('INTENSITY', String(intensity * 0.5))} 100%)`
        : `linear-gradient(to right, transparent 0%, ${rightColor.replace('INTENSITY', String(intensity * 0.5))} 100%)`,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: 'none',
      transition: isSwiping ? 'none' : 'opacity 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: swipeDirection === 'left' ? 'flex-start' : 'flex-end',
      padding: '20px'
    };
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff'
      }}>
        Loading survey...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        background: '#000000',
        height: '100vh', // Fixed height to viewport height
        maxHeight: '100vh', // Ensure it doesn't exceed viewport
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: windowWidth < 768 ? 'flex-start' : 'center',
        color: '#ffffff',
        textAlign: 'center',
        padding: windowWidth < 768 ? '10px 20px 60px' : '20px',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        boxSizing: 'border-box',
        paddingTop: windowWidth < 768 ? '40px' : '20px',
        overflow: 'hidden', // Prevent scrolling
        position: 'fixed', // Fix position to viewport
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Main container */}
      <div
        style={{
          position: 'relative',
          maxWidth: '650px',
          width: '100%',
          borderRadius: '0',
          overflow: 'hidden',
          background: '#000000',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          padding: finished ? '40px' : windowWidth < 768 ? '30px 20px' : '60px 40px',
          touchAction: showQuestions && !finished ? 'pan-y' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          ...(showQuestions && !finished ? getCardTransform() : {})
        }}
        onTouchStart={showQuestions && !finished ? handleTouchStart : undefined}
        onTouchMove={showQuestions && !finished ? handleTouchMove : undefined}
        onTouchEnd={showQuestions && !finished ? handleTouchEnd : undefined}
      >
        {/* Swipe direction indicator overlay with visual feedback and emoji */}
        {swipeDirection && (
          <div style={getSwipeIndicatorStyles() as React.CSSProperties}>
            <div style={{
              fontSize: '64px',
              fontWeight: 'bold',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
              transform: 'scale(1.1)',
              animation: 'pulse 0.5s ease infinite',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div>{swipeDirection === 'left' ? '😞' : '😊'}</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                {surveyType === 'operational'
                  ? (swipeDirection === 'left' ? 'Not Satisfied' : 'Satisfied')
                  : (swipeDirection === 'left' ? 'Left' : 'Right')
                }
              </div>
            </div>
          </div>
        )}
        
        {/* Initial screen */}
        {!showQuestions && !finished && !showContactQuestion && !showLottery && (
          <div style={{ 
            animation: 'fadeIn 0.8s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px'
          }}>
            {/* Fortune cookie image */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: windowWidth < 768 ? '250px' : '350px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src={getCurrentImage()}
                alt="Fortune Cookie"
                width={windowWidth < 768 ? 250 : 350}
                height={windowWidth < 768 ? 250 : 350}
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div style={{
              maxWidth: '450px',
              margin: '0 auto'
            }}>
              <h2 style={{ 
                fontSize: windowWidth < 768 ? '28px' : '32px',
                fontWeight: 700,
                marginBottom: windowWidth < 768 ? '16px' : '24px',
                color: '#fff',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}>
                {surveyTitle}
              </h2>
              
              {surveyLocation && (
                <p style={{
                  fontSize: windowWidth < 768 ? '16px' : '18px',
                  color: '#cccccc',
                  marginBottom: '16px'
                }}>
                  {surveyLocation}
                </p>
              )}
              
              <p style={{
                fontSize: windowWidth < 768 ? '14px' : '16px',
                lineHeight: 1.6,
                color: '#cccccc',
                marginBottom: windowWidth < 768 ? '20px' : '30px'
              }}>
                Take a moment to share your thoughts with us.
              </p>
              
              <button 
                onClick={handleStart}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#000000',
                  fontWeight: 600,
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e6e6e6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                START
              </button>
            </div>
          </div>
        )}

        {/* Contact details question screen */}
        {showContactQuestion && !finished && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            animation: 'fadeIn 0.4s ease'
          }}>
            {/* Fortune cookie image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: windowWidth < 768 ? '250px' : '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src="/survey/4.png"
                alt="Fortune Cookie"
                width={windowWidth < 768 ? 250 : 350}
                height={windowWidth < 768 ? 250 : 350}
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div>
              <h2 style={{ 
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4
              }}>
                Want a chance to win a free drink?
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#cccccc',
                marginBottom: '30px',
                lineHeight: 1.6
              }}>
                Enter your phone number or email to enter the draw
              </p>

              {/* Contact type selection */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setContactType('phone');
                    setContactValue('');
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: contactType === 'phone' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid #ffffff',
                    borderRadius: '25px',
                    color: contactType === 'phone' ? '#000000' : '#ffffff',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                >
                  Phone
                </button>
                <button
                  onClick={() => {
                    setContactType('email');
                    setContactValue('');
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: contactType === 'email' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid #ffffff',
                    borderRadius: '25px',
                    color: contactType === 'email' ? '#000000' : '#ffffff',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                >
                  Email
                </button>
              </div>

              {/* Contact input */}
              {contactType && (
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type={contactType === 'phone' ? 'tel' : 'email'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactType === 'phone' ? 'Enter your phone number' : 'Enter your email'}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffffff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                </div>
              )}

              {/* Submit and Skip buttons */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexDirection: windowWidth < 768 ? 'column' : 'row'
              }}>
                <button
                  onClick={handleContactSubmit}
                  disabled={!contactType || !contactValue.trim() || isSavingContact}
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    cursor: (!contactType || !contactValue.trim() || isSavingContact) ? 'not-allowed' : 'pointer',
                    backgroundColor: (!contactType || !contactValue.trim() || isSavingContact) ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#000000',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    textTransform: 'uppercase',
                    opacity: (!contactType || !contactValue.trim() || isSavingContact) ? 0.5 : 1
                  }}
                >
                  {isSavingContact ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={handleSkipContact}
                  disabled={isSavingContact}
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    cursor: isSavingContact ? 'not-allowed' : 'pointer',
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '50px',
                    color: '#ffffff',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    textTransform: 'uppercase',
                    opacity: isSavingContact ? 0.5 : 1
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lottery animation screen */}
        {showLottery && finished && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: windowWidth < 768 ? '20px' : '25px',
            animation: 'fadeIn 0.4s ease',
            alignItems: 'center',
            maxHeight: '100vh',
            overflowY: 'auto',
            padding: windowWidth < 768 ? '20px' : '30px',
            width: '100%'
          }}>
            {/* Fortune cookie image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: windowWidth < 768 ? '250px' : '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src="/survey/4.png"
                alt="Fortune Cookie"
                width={windowWidth < 768 ? 250 : 350}
                height={windowWidth < 768 ? 250 : 350}
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <h2 style={{ 
                fontSize: windowWidth < 768 ? '20px' : '24px',
                fontWeight: 600,
                marginBottom: windowWidth < 768 ? '20px' : '25px',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4,
                textAlign: 'center'
              }}>
                {isRolling ? 'Checking your entry...' : lotteryResult === 'win' ? '🎉 Congratulations! 🎉' : 'Better luck next time!'}
              </h2>

              {/* Rolling board animation */}
              <div style={{
                position: 'relative',
                width: '100%',
                minHeight: windowWidth < 768 ? '240px' : '260px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: '12px',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                overflow: 'visible',
                marginBottom: windowWidth < 768 ? '20px' : '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                padding: windowWidth < 768 ? '24px 16px' : '32px 24px',
                boxSizing: 'border-box'
              }}>
                {isRolling ? (
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: '200px',
                    position: 'relative'
                  }}>
                    {['🎰', '🎲', '🎯', '🎁', '🍀', '⭐'].map((symbol, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '48px',
                          animation: 'rollDown 0.2s linear infinite',
                          animationDelay: `${index * 0.05}s`,
                          opacity: 0.8
                        }}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                ) : lotteryResult === 'win' ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: windowWidth < 768 ? '14px' : '18px',
                    width: '100%',
                    minHeight: '100%',
                    padding: windowWidth < 768 ? '8px 0' : '12px 0'
                  }}>
                    <div style={{ fontSize: windowWidth < 768 ? '56px' : '64px' }}>🎁</div>
                    <div style={{
                      fontSize: windowWidth < 768 ? '20px' : '24px',
                      fontWeight: 700,
                      color: '#4ade80',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      padding: '0 8px'
                    }}>
                      You Won a Free Drink!
                    </div>
                    <div style={{
                      fontSize: windowWidth < 768 ? '13px' : '15px',
                      color: '#cccccc',
                      textAlign: 'center',
                      padding: '0 12px',
                      lineHeight: 1.5
                    }}>
                      Show this message at the counter to claim your free drink
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: windowWidth < 768 ? '12px' : '16px',
                    width: '100%',
                    minHeight: '100%'
                  }}>
                    <div style={{ fontSize: windowWidth < 768 ? '60px' : '70px' }}>😊</div>
                    <div style={{
                      fontSize: windowWidth < 768 ? '20px' : '24px',
                      fontWeight: 600,
                      color: '#ffffff',
                      textAlign: 'center',
                      lineHeight: 1.3
                    }}>
                      Thanks for participating!
                    </div>
                    <div style={{
                      fontSize: windowWidth < 768 ? '14px' : '16px',
                      color: '#cccccc',
                      textAlign: 'center',
                      padding: '0 10px',
                      lineHeight: 1.5
                    }}>
                      Keep an eye out for future promotions
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fortune wisdom - show after lottery result */}
              {!isRolling && lotteryResult && (
                <div style={{
                  marginTop: windowWidth < 768 ? '20px' : '25px',
                  width: '100%'
                }}>
                  <h3 style={{
                    fontSize: windowWidth < 768 ? '18px' : '20px',
                    fontWeight: 600,
                    marginBottom: windowWidth < 768 ? '12px' : '16px',
                    color: '#fff',
                    fontFamily: 'Georgia, serif',
                    textAlign: 'center'
                  }}>
                    Your Fortune
                  </h3>
                  
                  {/* Fortune slip */}
                  <div style={{
                    position: 'relative',
                    margin: '0 auto',
                    padding: windowWidth < 768 ? '16px' : '20px',
                    background: '#fff',
                    border: 'none',
                    maxWidth: '350px',
                    boxShadow: '0 5px 15px rgba(235, 37, 42, 0.2)'
                  }}>
                    <p style={{ 
                      fontStyle: 'italic', 
                      fontSize: windowWidth < 768 ? '14px' : '16px',
                      color: '#333',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      fontFamily: 'Georgia, serif',
                      position: 'relative',
                      textAlign: 'center',
                      margin: 0
                    }}>
                      &quot;{fortuneWisdom}&quot;
                    </p>
                    
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '15%',
                      right: '15%',
                      height: '3px',
                      background: '#EB252A'
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions screen */}
        {showQuestions && !finished && !showContactQuestion && !showLottery && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {/* Fortune cookie image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: windowWidth < 768 ? '250px' : '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src={getCurrentImage()}
                alt="Fortune Cookie"
                width={windowWidth < 768 ? 250 : 350}
                height={windowWidth < 768 ? 250 : 350}
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: surveyType === 'operational'
                    ? 'brightness(1.1) drop-shadow(0 0 12px rgba(255, 255, 255, 0.15))'
                    : 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div style={{ 
              animation: 'fadeIn 0.4s ease',
            }}>
              <h2 style={{ 
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '24px',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4
              }}>
                {questions[questionIndex]}
              </h2>
              
              {/* Clickable emoji indicators - work on both mobile and desktop */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 30px',
                gap: '20px'
              }}>
                {/* Left emoji - clickable */}
                <div
                  onClick={() => handleEmojiClick('left')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: clickedEmoji === 'left' ? 1 : 0.7,
                    transform: clickedEmoji === 'left' ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onMouseEnter={e => {
                    if (clickedEmoji !== 'left') {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (clickedEmoji !== 'left') {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontSize: '48px' }}>😞</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {surveyType === 'operational' ? 'Not Satisfied' : 'Left'}
                  </div>
                </div>

                {/* Right emoji - clickable */}
                <div
                  onClick={() => handleEmojiClick('right')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: clickedEmoji === 'right' ? 1 : 0.7,
                    transform: clickedEmoji === 'right' ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onMouseEnter={e => {
                    if (clickedEmoji !== 'right') {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (clickedEmoji !== 'right') {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div style={{ fontSize: '48px' }}>😊</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {surveyType === 'operational' ? 'Satisfied' : 'Right'}
                  </div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div style={{ 
                marginTop: '30px', 
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                {questions.map((_, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      width: '30px',
                      height: '4px',
                      background: idx === questionIndex ? '#ffffff' : '#333333',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result screen */}
        {finished && !showLottery && (
          <div style={{ 
            animation: 'fadeIn 0.8s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: windowWidth < 768 ? '20px' : '25px',
            maxHeight: '100vh',
            overflowY: 'auto',
            padding: windowWidth < 768 ? '20px' : '30px'
          }}>
            {/* Fortune cookie image - smaller */}
            <div style={{ 
              position: 'relative', 
              width: '100%',
              height: windowWidth < 768 ? '150px' : '180px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src="/survey/4.png"
                alt="Fortune Cookie"
                width={windowWidth < 768 ? 150 : 180}
                height={windowWidth < 768 ? 150 : 180}
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.6s ease',
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <h2 style={{ 
                fontSize: windowWidth < 768 ? '20px' : '24px',
                fontWeight: 700,
                marginBottom: windowWidth < 768 ? '12px' : '16px',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                textAlign: 'center'
              }}>
                Your Fortune Awaits
              </h2>
              
              {/* Fortune slip - smaller */}
              <div style={{
                position: 'relative',
                margin: windowWidth < 768 ? '0 auto 16px' : '0 auto 20px',
                padding: windowWidth < 768 ? '16px' : '20px',
                background: '#fff',
                border: 'none',
                maxWidth: '350px',
                boxShadow: '0 5px 15px rgba(235, 37, 42, 0.2)'
              }}>
                <p style={{ 
                  fontStyle: 'italic', 
                  fontSize: windowWidth < 768 ? '14px' : '16px',
                  color: '#333',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  fontFamily: 'Georgia, serif',
                  position: 'relative',
                  textAlign: 'center',
                  margin: 0
                }}>
                  &quot;{fortuneWisdom}&quot;
                </p>
                
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '15%',
                  right: '15%',
                  height: '3px',
                  background: '#EB252A'
                }} />
              </div>
              
              {/* Contact input for lottery - only show if lottery hasn't been shown yet */}
              {!showLottery && (
              <div style={{
                marginTop: windowWidth < 768 ? '16px' : '20px',
                padding: windowWidth < 768 ? '20px' : '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: windowWidth < 768 ? '18px' : '20px',
                  fontWeight: 600,
                  marginBottom: windowWidth < 768 ? '8px' : '12px',
                  color: '#fff',
                  fontFamily: 'Georgia, serif',
                  textAlign: 'center'
                }}>
                  Enter to Win a Free Drink!
                </h3>
                
                <p style={{
                  fontSize: windowWidth < 768 ? '12px' : '14px',
                  color: '#cccccc',
                  marginBottom: windowWidth < 768 ? '16px' : '20px',
                  textAlign: 'center',
                  lineHeight: 1.5
                }}>
                  Enter your phone number or email to participate in our free drink lottery
                </p>

                {/* Contact type selection */}
                <div style={{
                  display: 'flex',
                  gap: windowWidth < 768 ? '10px' : '15px',
                  marginBottom: windowWidth < 768 ? '16px' : '20px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => {
                      setContactType('phone');
                      setContactValue('');
                    }}
                    style={{
                      padding: windowWidth < 768 ? '10px 20px' : '12px 24px',
                      fontSize: windowWidth < 768 ? '12px' : '14px',
                      cursor: 'pointer',
                      backgroundColor: contactType === 'phone' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid #ffffff',
                      borderRadius: '25px',
                      color: contactType === 'phone' ? '#000000' : '#ffffff',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  >
                    Phone
                  </button>
                  <button
                    onClick={() => {
                      setContactType('email');
                      setContactValue('');
                    }}
                    style={{
                      padding: windowWidth < 768 ? '10px 20px' : '12px 24px',
                      fontSize: windowWidth < 768 ? '12px' : '14px',
                      cursor: 'pointer',
                      backgroundColor: contactType === 'email' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid #ffffff',
                      borderRadius: '25px',
                      color: contactType === 'email' ? '#000000' : '#ffffff',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  >
                    Email
                  </button>
                </div>

                {/* Contact input */}
                {contactType && (
                  <div style={{ marginBottom: windowWidth < 768 ? '16px' : '20px' }}>
                    <input
                      type={contactType === 'phone' ? 'tel' : 'email'}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={contactType === 'phone' ? 'Enter your phone number' : 'Enter your email'}
                      style={{
                        width: '100%',
                        padding: windowWidth < 768 ? '12px' : '16px',
                        fontSize: windowWidth < 768 ? '14px' : '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#ffffff';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleContactSubmit}
                  disabled={!contactType || !contactValue.trim() || isSavingContact}
                  style={{
                    width: '100%',
                    padding: windowWidth < 768 ? '14px 24px' : '16px 32px',
                    fontSize: windowWidth < 768 ? '14px' : '16px',
                    cursor: (!contactType || !contactValue.trim() || isSavingContact) ? 'not-allowed' : 'pointer',
                    backgroundColor: (!contactType || !contactValue.trim() || isSavingContact) ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#000000',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    textTransform: 'uppercase',
                    opacity: (!contactType || !contactValue.trim() || isSavingContact) ? 0.5 : 1
                  }}
                >
                  {isSavingContact ? 'Submitting...' : 'Enter Lottery'}
                </button>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile swipe instruction */}
      {showQuestions && !finished && !showContactQuestion && !showLottery && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 20px',
          borderRadius: '4px',
          background: 'rgba(40, 40, 40, 0.8)',
          fontSize: '14px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10
        }}>
          <span>Swipe left or right to continue</span>
        </div>
      )}
      
      {/* Styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes rollDown {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px) rotate(360deg); opacity: 0; }
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          background: #000000;
        }
      `}</style>
    </div>
  );
}
