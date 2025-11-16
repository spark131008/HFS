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

  // State to track which question we're on
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  
  // For swipe gestures
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchStartTime = useRef(0);
  
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
        const sortedQuestions = surveys.survey_type === 'operational'
          ? OPERATIONAL_QUESTIONS.map(q => q.question_text)
          : surveys.survey_questions
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map(q => q.question_text);

        console.log('Fetched survey data:', {
          title: surveys.title,
          location: surveys.location,
          surveyType: surveys.survey_type,
          customImages: surveys.operational_images,
          questions: sortedQuestions
        });

        // Update state with survey data
        setSurveyTitle(surveys.title);
        setSurveyLocation(surveys.location);
        setQuestions(sortedQuestions);
        
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
    if (!showQuestions) return "/survey/1.png"; // Initial screen
    if (finished) return "/survey/4.png";       // End screen - changed to 4.png

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

        const { error: responseError } = await supabase
          .from('survey_responses')
          .insert([{
            restaurant_id: restaurant.id,
            survey_id: activeSurvey.id,
            question_answers: updatedAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
              acc[questions[idx]] = ans;
              return acc;
            }, {}),
            submitted_at: new Date().toISOString()
          }]);

        if (responseError) {
          console.error('Error saving responses:', responseError);
        }
      }
      
      // Move to next question or finish
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(prevIndex => prevIndex + 1);
      } else {
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
  }, [questionIndex, questions, answers, restaurantCode, isProcessingAnswer]);
  
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
        {!showQuestions && !finished && (
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

        {/* Questions screen */}
        {showQuestions && !finished && (
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
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
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
              
              {/* Swipe indicators on sides - always visible as hints */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 20px',
                opacity: 0.4
              }}>
                {/* Left indicator */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '32px' }}>😞</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 500
                  }}>
                    {surveyType === 'operational' ? 'Not Satisfied' : 'Left'}
                  </div>
                  {windowWidth < 768 && (
                    <div style={{ fontSize: '18px', opacity: 0.6 }}>←</div>
                  )}
                </div>

                {/* Right indicator */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '32px' }}>😊</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 500
                  }}>
                    {surveyType === 'operational' ? 'Satisfied' : 'Right'}
                  </div>
                  {windowWidth < 768 && (
                    <div style={{ fontSize: '18px', opacity: 0.6 }}>→</div>
                  )}
                </div>
              </div>

              {/* Desktop-only clickable buttons (hidden on mobile) */}
              {windowWidth >= 768 && (
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={() => handleAnswer('left')}
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                      fontSize: '13px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      transition: 'all 0.25s ease',
                      flex: 1,
                      maxWidth: '140px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                  >
                    {surveyType === 'operational' ? 'Not Satisfied' : 'Left'}
                  </button>
                  <button
                    onClick={() => handleAnswer('right')}
                    style={{
                      padding: '12px 24px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                      fontSize: '13px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      transition: 'all 0.25s ease',
                      flex: 1,
                      maxWidth: '140px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                  >
                    {surveyType === 'operational' ? 'Satisfied' : 'Right'}
                  </button>
                </div>
              )}
              
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
        {finished && (
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
                  transition: 'all 0.6s ease',
                  filter: 'drop-shadow(0 0 8px rgba(235, 37, 42, 0.2))'
                }}
                priority
              />
            </div>
            
            <div>
              <h2 style={{ 
                fontSize: windowWidth < 768 ? '24px' : '28px',
                fontWeight: 700,
                marginBottom: windowWidth < 768 ? '20px' : '30px',
                color: '#fff',
                fontFamily: 'Georgia, serif'
              }}>
                Your Fortune Awaits
              </h2>
              
              {/* Fortune slip */}
              <div style={{
                position: 'relative',
                margin: windowWidth < 768 ? '15px auto' : '40px auto',
                padding: windowWidth < 768 ? '20px' : '30px',
                background: '#fff',
                border: 'none',
                maxWidth: '400px',
                boxShadow: '0 5px 15px rgba(235, 37, 42, 0.2)'
              }}>
                <p style={{ 
                  fontStyle: 'italic', 
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: 500,
                  lineHeight: 1.8,
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
              
              <p style={{
                fontSize: '14px',
                color: '#999999',
                marginTop: '20px',
                fontStyle: 'italic'
              }}>Share your fortune with friends</p>
              
              {/* Social sharing buttons */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                marginTop: '15px'
              }}>
                {['twitter', 'fb', 'apple'].map(icon => (
                  <button
                    key={icon}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(235, 37, 42, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Image 
                      src={`/icons/${icon}-icon.svg`} 
                      alt={`${icon} icon`} 
                      width={20} 
                      height={20}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile swipe instruction */}
      {showQuestions && !finished && (
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
