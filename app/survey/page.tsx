"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  // Questions for the fortune cookie survey
  const questions = [
    'What brings you the most joy in life?',
    'Where would you like to travel next?',
    'What are you most grateful for today?'
  ];

  // State to track which question we're on
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  
  // For swipe gestures
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fortune cookie wisdom to show at the end
  const fortuneWisdom = "Your path is illuminated by the experiences you create. Stay curious, embrace change, and fortune will find you.";

  // Get the current image based on the question index
  const getCurrentImage = () => {
    if (!showQuestions) return "/survey/1.png"; // Initial screen
    if (finished) return "/survey/4.png";       // End screen - changed to 4.png
    
    // During questions, show image based on question number
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

  // Handle an answer ("swipe" left or right)
  const handleAnswer = (direction: 'left' | 'right') => {
    setAnswers(prev => [...prev, direction]);
    console.log(answers)
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      // Make sure we properly set finished state to true when completing the last question
      setShowQuestions(false);
      setFinished(true);
      console.log('Survey completed, showing final image:', finished);
    }
  };
  
  // Swipe detection handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    touchEndX.current = e.touches[0].clientX;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > 30) {
      setSwipeDirection(swipeDistance > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };
  
  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 75;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      const direction = swipeDistance > 0 ? 'right' : 'left';
      handleAnswer(direction);
    }
    
    setSwipeDirection(null);
  };
  
  // Effect to handle image changes when survey is completed
  useEffect(() => {
    if (finished) {
      console.log('Finished state changed, displaying final image: /survey/4.png');
    }
  }, [finished]);
  
  // Effect to handle touch events
  useEffect(() => {
    const element = containerRef.current;
    
    if (!element || !showQuestions || finished) return;
    
    const touchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      setIsSwiping(true);
    };
    
    const touchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      touchEndX.current = e.touches[0].clientX;
      
      const swipeDistance = touchEndX.current - touchStartX.current;
      
      if (Math.abs(swipeDistance) > 30) {
        setSwipeDirection(swipeDistance > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    };
    
    const touchEnd = () => {
      if (!isSwiping) return;
      setIsSwiping(false);
      
      const swipeDistance = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 75;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        const direction = swipeDistance > 0 ? 'right' : 'left';
        handleAnswer(direction);
      }
      
      setSwipeDirection(null);
    };
    
    element.addEventListener('touchstart', touchStart);
    element.addEventListener('touchmove', touchMove);
    element.addEventListener('touchend', touchEnd);
    
    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
    };
  }, [showQuestions, finished, isSwiping]);
  
  // Get swipe direction indicator styles
  const getSwipeIndicatorStyles = () => {
    if (!swipeDirection) return {};
    
    return {
      background: swipeDirection === 'left' 
        ? 'linear-gradient(to left, transparent, rgba(235, 37, 42, 0.2))'
        : 'linear-gradient(to right, transparent, rgba(235, 37, 42, 0.2))',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: 'none',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div 
      style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        textAlign: 'center',
        padding: '20px',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      {/* Main container */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          maxWidth: '650px',
          width: '100%',
          borderRadius: '0',
          overflow: 'hidden',
          background: '#000000',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          padding: finished ? '40px' : '60px 40px',
          transition: 'all 0.4s ease',
          touchAction: showQuestions && !finished ? 'pan-y' : 'auto'
        }}
        onTouchStart={showQuestions && !finished ? handleTouchStart : undefined}
        onTouchMove={showQuestions && !finished ? handleTouchMove : undefined}
        onTouchEnd={showQuestions && !finished ? handleTouchEnd : undefined}
      >
        {/* Swipe direction indicator overlay */}
        {swipeDirection && (
          <div style={getSwipeIndicatorStyles() as React.CSSProperties} />
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
              height: '350px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src={getCurrentImage()}
                alt="Fortune Cookie"
                width={350}
                height={350}
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
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#fff',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}>
                Discover Your Fortune
              </h2>
              
              <p style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#cccccc',
                marginBottom: '30px'
              }}>
                Take a moment to reflect on your journey while we prepare your personalized wisdom.
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
              height: '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src={getCurrentImage()}
                alt="Fortune Cookie"
                width={350} 
                height={350}
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
                marginBottom: '10px',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4
              }}>
                {questions[questionIndex]}
              </h2>
              
              <p style={{ 
                fontSize: '16px',
                color: '#aaaaaa',
                marginBottom: '30px',
                fontWeight: 400
              }}>
                <span style={{ fontStyle: 'italic' }}>Swipe left or right to answer</span>
              </p>
              
              {/* Desktop buttons */}
              <div style={{ 
                display: 'flex',
                gap: '20px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => handleAnswer('left')}
                  style={{ 
                    padding: '14px 28px', 
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '2px solid #ffffff',
                    borderRadius: '50px',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                    flex: 1,
                    maxWidth: '150px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  Left
                </button>
                <button 
                  onClick={() => handleAnswer('right')}
                  style={{ 
                    padding: '14px 28px', 
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '2px solid #ffffff',
                    borderRadius: '50px',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                    flex: 1,
                    maxWidth: '150px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  Right
                </button>
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
              height: '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Image
                src="/survey/4.png"
                alt="Fortune Cookie"
                width={350}
                height={350}
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
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '30px',
                color: '#fff',
                fontFamily: 'Georgia, serif'
              }}>
                Your Fortune Awaits
              </h2>
              
              {/* Fortune slip */}
              <div style={{
                position: 'relative',
                margin: '40px auto',
                padding: '30px',
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
      
      {/* Style for fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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