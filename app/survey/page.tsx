"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { OPERATIONAL_QUESTIONS } from '@/utils/operational-questions';
import { Phone, Mail, Trophy, XCircle, Wine, PartyPopper, Camera, X } from 'lucide-react';

// --- CANVAS COMPONENT FOR AMBIENT BACKGROUND ---
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set actual canvas size to handle retina displays for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    interface ParticleType {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
      update: () => void;
      draw: () => void;
    }
    const particles: ParticleType[] = [];
    const particleCount = 60; 

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() * 40 + 30; // Warm gold/amber hues
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Pulse effect
        this.opacity += (Math.random() * 0.02 - 0.01);
        if (this.opacity < 0.1) this.opacity = 0.1;
        if (this.opacity > 0.6) this.opacity = 0.6;

        // Wrap around screen
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // subtle gradient background drawn on canvas to blend perfectly
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#050505'); 
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none'
      }} 
    />
  );
};

// --- LOADING COMPONENT ---
function LoadingScreen() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white font-sans">
            <div className="spinner mb-6"></div>
            <p className="opacity-70 tracking-[0.2em] uppercase text-xs animate-pulse">Loading Experience</p>
            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    border-top-color: #D4AF37;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
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

  // For emoji click animation (kept for potential future use)
  const [, setClickedEmoji] = useState<'left' | 'right' | null>(null);

  // Details input state
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'photo' | 'text'>('photo');
  const [questionDetails, setQuestionDetails] = useState<Array<{ photo: File | null; photoPreview: string | null; text: string }>>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<number | null>(null);
  const [pendingAnswerDirection, setPendingAnswerDirection] = useState<string | null>(null);

  // Reset clicked emoji state when question changes
  useEffect(() => {
    setClickedEmoji(null);
    setCurrentQuestionAnswered(false);
    setPendingAnswerDirection(null);
  }, [questionIndex]);

  // Initialize question details array when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && questionDetails.length === 0) {
      setQuestionDetails(Array(questions.length).fill(null).map(() => ({ photo: null, photoPreview: null, text: '' })));
    }
  }, [questions.length, questionDetails.length]);
  
  // Fortune cookie wisdom to show at the end (fetched from database)
  const [fortuneWisdom, setFortuneWisdom] = useState<string | null>(null);
  const [isWisdomLoading, setIsWisdomLoading] = useState(false);

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

        // Store restaurant ID for photo uploads
        setRestaurantId(restaurant.id);

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
        // Both operational and custom surveys have questions in survey_questions table
        const sortedSurveyQuestions = surveys.survey_questions
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        const sortedQuestions = sortedSurveyQuestions.map(q => q.question_text);
        // Use the actual question UUIDs from the database for both types
        const questionMeta = sortedSurveyQuestions.map(q => ({ id: q.id, question_text: q.question_text }));

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
        setActiveSurveyId(surveys.id);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('Failed to load survey. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [restaurantCode]);

  // Fetch a random wisdom when finished becomes true
  useEffect(() => {
    if (finished) {
      const fetchWisdom = async () => {
        setIsWisdomLoading(true);
        try {
          const supabase = createClient();
          // Use the RPC function to get a random wisdom
          const { data, error } = await supabase.rpc('get_random_wisdom');
          if (error || !data || data.length === 0) {
            setFortuneWisdom('Your path is illuminated by the experiences you create. Stay curious, embrace change, and fortune will find you.');
          } else {
            setFortuneWisdom(data[0].text);
          }
        } catch {
          setFortuneWisdom('Your path is illuminated by the experiences you create. Stay curious, embrace change, and fortune will find you.');
        } finally {
          setIsWisdomLoading(false);
        }
      };
      fetchWisdom();
    }
  }, [finished]);

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

  // Upload photo to Supabase Storage
  const uploadPhotoToStorage = async (file: File, responseId: number, questionIndex: number): Promise<string | null> => {
    if (!restaurantId || !activeSurveyId) {
      console.error('Missing restaurant ID or survey ID for photo upload');
      return null;
    }

    try {
      const supabase = createClient();
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setUploadError('File size must be less than 5MB');
        return null;
      }

      // Validate file type (images only)
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${responseId}_${questionIndex}_${timestamp}.${fileExt}`;
      const filePath = `${restaurantId}/${activeSurveyId}/${fileName}`;

      // Upload to storage bucket 'survey-media'
      const { error } = await supabase.storage
        .from('survey-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading photo:', error);
        setUploadError('Failed to upload photo. Please try again.');
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('survey-media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Unexpected error uploading photo:', err);
      setUploadError('An unexpected error occurred. Please try again.');
      return null;
    }
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

  // Save details to survey_response_details table
  const saveQuestionDetails = async (answerId: number, questionIdx: number, responseId: number) => {
    const details = questionDetails[questionIdx];
    if (!details || (!details.photo && !details.text?.trim())) {
      return; // No details to save
    }

    try {
      const supabase = createClient();
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      // Upload photo if exists
      if (details.photo) {
        setIsUploadingMedia(true);
        setUploadError(null);
        
        mediaUrl = await uploadPhotoToStorage(details.photo, responseId, questionIdx);
        if (mediaUrl) {
          mediaType = 'image';
        }
        setIsUploadingMedia(false);
      }

      // Prepare details record
      const detailsRecord: {
        response_answer_id: number;
        additional_text?: string;
        media_url?: string;
        media_type?: string;
      } = {
        response_answer_id: answerId
      };

      if (details.text?.trim()) {
        detailsRecord.additional_text = details.text.trim();
      }

      if (mediaUrl) {
        detailsRecord.media_url = mediaUrl;
        detailsRecord.media_type = mediaType || 'image';
      }

      // Only insert if we have something to save
      if (detailsRecord.additional_text || detailsRecord.media_url) {
        const { error: detailsError } = await supabase
          .from('survey_response_details')
          .insert([detailsRecord]);

        if (detailsError) {
          console.error('Error saving question details:', detailsError);
        } else {
          console.log('Successfully saved question details for answer', answerId);
        }
      }
    } catch (err) {
      console.error('Unexpected error saving question details:', err);
      setIsUploadingMedia(false);
    }
  };

  // Handle continue from details input - save answer and details, then move to next question
  const handleContinueFromDetails = useCallback(async () => {
    if (!pendingAnswerDirection) return;

    setIsProcessingAnswer(true);
    setUploadError(null);

    try {
      const supabase = createClient();

      // Get restaurant and survey info
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('restaurant_code', restaurantCode)
        .single();

      if (!restaurant) {
        console.error('Restaurant not found');
        setIsProcessingAnswer(false);
        return;
      }

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
        setIsProcessingAnswer(false);
        return;
      }

      // Create or get response_id
      let currentResponseId = responseId;
      if (!currentResponseId) {
        // Create new response record
        const updatedAnswers = [...answers, pendingAnswerDirection];
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
          console.error('Error creating response:', responseError);
          setIsProcessingAnswer(false);
          return;
        }

        currentResponseId = insertedData.id;
        setResponseId(currentResponseId);
      }

      // Save the current answer to survey_response_answers
      const questionMeta = questionMetadata[questionIndex];
      if (!questionMeta?.id) {
        console.error('Missing question ID for answer');
        setIsProcessingAnswer(false);
        return;
      }

      const { data: insertedAnswer, error: answerError } = await supabase
        .from('survey_response_answers')
        .insert([{
          response_id: currentResponseId,
          survey_question_id: questionMeta.id,
          answer_value: pendingAnswerDirection
        }])
        .select('id')
        .single();

      if (answerError) {
        console.error('Error saving answer:', answerError);
        setIsProcessingAnswer(false);
        return;
      }

      // Update local answers state
      const updatedAnswers = [...answers, pendingAnswerDirection];
      setAnswers(updatedAnswers);

      // Update question_answers JSONB field in survey_responses if this is the last question
      if (questionIndex === questions.length - 1) {
        const questionAnswers = updatedAnswers.reduce<Record<string, string>>((acc, ans, idx) => {
          acc[questions[idx]] = ans;
          return acc;
        }, {});

        const supabase = createClient();
        await supabase
          .from('survey_responses')
          .update({ question_answers: questionAnswers })
          .eq('id', currentResponseId);
      }

      // Save details if provided
      if (insertedAnswer && currentResponseId) {
        await saveQuestionDetails(insertedAnswer.id, questionIndex, currentResponseId);
      }

      // Clear details input and move to next question
      setCurrentQuestionAnswered(false);
      setPendingAnswerDirection(null);

      // Move to next question or show contact question
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // End of questions - show contact question
        setShowQuestions(false);
        setShowContactQuestion(true);
      }
    } catch (err) {
      console.error('Error processing continue from details:', err);
    } finally {
      setIsProcessingAnswer(false);
    }
  }, [pendingAnswerDirection, responseId, restaurantCode, questionIndex, questionMetadata, answers, questions, saveQuestionDetails]);

  // Handle answer submission - show details input on same page
  const handleAnswer = useCallback((direction: string) => {
    if (isProcessingAnswer) {
      console.log('Already processing an answer, ignoring this one');
      return;
    }
    
    // Store the answer direction and mark question as answered
    // Allow changing answer if user swipes again
    setPendingAnswerDirection(direction);
    setCurrentQuestionAnswered(true);
  }, [isProcessingAnswer]);
  
  // Handle contact details submission
  const handleContactSubmit = useCallback(async () => {
    if (!responseId || !contactType || !contactValue.trim()) {
      console.log('Contact submit blocked:', { responseId, contactType, contactValue: contactValue.trim() });
      return;
    }

    setIsSavingContact(true);
    
    // Hide contact question and show lottery
    setShowContactQuestion(false);
    setShowLottery(true);
    setIsRolling(true);
    
    // Determine win/loss (1 in 10 chance)
    const hasWon = Math.random() < 0.1; // 10% chance
    
    // Roll animation for 2 seconds
    setTimeout(async () => {
      setIsRolling(false);
      setLotteryResult(hasWon ? 'win' : 'lose');
      
      // Save contact details after showing result
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
      } finally {
        setIsSavingContact(false);
      }
      
      // After result, go to final screen
      setTimeout(() => {
        setShowLottery(false);
        setFinished(true);
      }, 3500);
    }, 2000);
  }, [responseId, contactType, contactValue]);

  // Handle skip contact details
  const handleSkipContact = () => {
    setShowContactQuestion(false);
    setFinished(true);
  };

  // Handle photo file selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionDetails(prev => {
        const newDetails = [...prev];
        newDetails[questionIndex] = {
          ...newDetails[questionIndex],
          photo: file,
          photoPreview: reader.result as string
        };
        return newDetails;
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle remove photo
  const handleRemovePhoto = () => {
    setQuestionDetails(prev => {
      const newDetails = [...prev];
      newDetails[questionIndex] = {
        ...newDetails[questionIndex],
        photo: null,
        photoPreview: null
      };
      return newDetails;
    });
    setUploadError(null);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionDetails(prev => {
      const newDetails = [...prev];
      newDetails[questionIndex] = {
        ...newDetails[questionIndex],
        text: e.target.value
      };
      return newDetails;
    });
  };

  
  // Swipe detection handlers with velocity and smooth animations
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't trigger swipe if touching interactive elements
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('textarea') ||
      target.closest('input') ||
      target.closest('button') ||
      target.closest('label');
    
    if (isInteractiveElement) {
      return;
    }

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


  if (isLoading) return <LoadingScreen />;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ParticleCanvas />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .glass-card {
            background: rgba(20, 20, 20, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>

      <div className="fixed inset-0 flex flex-col items-center justify-center p-5 md:p-8">
        {/* MAIN CARD */}
        <div 
          className="glass-card w-full max-w-[420px] min-h-[600px] rounded-[32px] relative overflow-hidden flex flex-col text-white"
          style={{
            touchAction: showQuestions && !finished ? 'pan-y' : 'auto',
            ...((showQuestions && !finished) ? getCardTransform() : {})
          }}
          onTouchStart={showQuestions && !finished ? handleTouchStart : undefined}
          onTouchMove={showQuestions && !finished ? handleTouchMove : undefined}
          onTouchEnd={showQuestions && !finished ? handleTouchEnd : undefined}
        >

            {/* Swipe Feedback Overlay */}
            <div 
                className={`absolute inset-0 pointer-events-none z-10 flex items-center p-10 transition-opacity duration-300
                ${swipeDirection === 'left' ? 'justify-start bg-gradient-to-r from-red-500/20 to-transparent' : ''}
                ${swipeDirection === 'right' ? 'justify-end bg-gradient-to-l from-green-500/20 to-transparent' : ''}
                ${!swipeDirection ? 'opacity-0' : 'opacity-100'}
                `}
            >
                {swipeDirection && (
                    <div className="text-6xl drop-shadow-lg transform scale-110 transition-transform">
                        {swipeDirection === 'left' ? '😞' : '😊'}
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col p-8 items-center justify-center w-full">
                
                {/* 1. START SCREEN */}
                {!showQuestions && !finished && !showContactQuestion && !showLottery && (
                    <div className="animate-slideUp w-full text-center flex flex-col items-center">
                        <div className="w-60 h-60 mb-8 relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                            <Image 
                                src={getCurrentImage()} 
                                alt="Welcome" 
                                width={240}
                                height={240}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        </div>
                        
                        <h1 className="font-playfair text-3xl font-semibold mb-2 leading-tight tracking-tight text-white">
                            {surveyTitle || 'The Golden Lotus'}
                        </h1>
                        
                        <p className="text-white/60 mb-8 font-inter text-sm tracking-wide uppercase">
                            {surveyLocation || 'Your favorite restaurant'}
                        </p>
                        
                        <p className="text-white/80 mb-10 text-[15px] leading-relaxed max-w-[280px] font-light">
                            We value your presence. Help us curate better moments with a few simple touches.
                        </p>
                        
                        <button 
                            onClick={handleStart}
                            className="bg-white text-black px-12 py-4 rounded-full text-sm font-bold tracking-widest uppercase 
                            hover:bg-gray-200 active:scale-95 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
                        >
                            Begin
                        </button>
                    </div>
                )}

                {/* 3. CONTACT INPUT */}
                {showContactQuestion && !finished && (
                    <div className="animate-slideUp w-full text-center flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                            <Trophy className="text-black w-8 h-8" />
                        </div>

                        <h2 className="font-playfair text-3xl mb-3 text-white">Stay connected</h2>
                        <p className="text-white/60 mb-8 text-sm max-w-[260px] leading-relaxed">
                            Enter your contact details for a chance to win a complimentary drink.
                        </p>

                        {/* Toggle */}
                        <div className="bg-white/10 p-1 rounded-full inline-flex mb-8 backdrop-blur-md">
                            <button 
                                onClick={() => { setContactType('phone'); setContactValue(''); }}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                ${contactType === 'phone' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Phone
                            </button>
                            <button 
                                onClick={() => { setContactType('email'); setContactValue(''); }}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                ${contactType === 'email' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Email
                            </button>
                        </div>

                        {contactType && (
                            <div className="w-full mb-6 animate-fadeIn">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                        {contactType === 'phone' ? <Phone size={18} /> : <Mail size={18} />}
                                    </div>
                                    <input
                                        type={contactType === 'phone' ? 'tel' : 'email'}
                                        value={contactValue}
                                        onChange={(e) => setContactValue(e.target.value)}
                                        placeholder={contactType === 'phone' ? '(555) 000-0000' : 'you@example.com'}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all text-center"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleContactSubmit}
                                disabled={!contactType || !contactValue.trim() || isSavingContact}
                                className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300
                                ${(!contactType || !contactValue.trim() || isSavingContact) 
                                    ? 'bg-white/10 text-white/20 cursor-not-allowed' 
                                    : 'bg-[#D4AF37] text-black hover:bg-[#E5C158] shadow-[0_0_20px_rgba(212,175,55,0.3)]'}`}
                            >
                                {isSavingContact ? 'Submitting...' : 'Enter Draw'}
                            </button>
                            <button
                                onClick={handleSkipContact}
                                className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors py-2"
                            >
                                No thanks, skip
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. LOTTERY ANIMATION */}
                {showLottery && (
                    <div className="animate-fadeIn w-full text-center flex flex-col items-center justify-center h-full">
                        <h2 className="font-playfair text-2xl mb-8 text-[#D4AF37]">
                            {isRolling ? 'Manifesting luck...' : lotteryResult === 'win' ? 'Destiny calls!' : 'Almost there'}
                        </h2>
                        
                        <div className="w-full h-40 bg-black/40 rounded-2xl border border-[#D4AF37]/50 flex items-center justify-center mb-8 overflow-hidden relative shadow-inner shadow-black">
                            <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse" />
                             
                             {isRolling ? (
                                 <div className="flex gap-8 text-5xl animate-bounce">
                                    <span>🎰</span><span>🎲</span><span>✨</span>
                                 </div>
                             ) : lotteryResult === 'win' ? (
                                 <div className="flex flex-col items-center animate-slideUp">
                                    <div className="flex gap-4 mb-2 text-[#D4AF37]">
                                        <Wine size={40} />
                                        <PartyPopper size={40} />
                                    </div>
                                    <span className="text-4xl font-bold text-white">WINNER</span>
                                 </div>
                             ) : (
                                 <div className="animate-slideUp text-gray-400 flex flex-col items-center">
                                     <XCircle size={48} className="mb-2 opacity-50"/>
                                     <span className="text-xl">Not this time</span>
                                 </div>
                             )}
                        </div>

                        {!isRolling && lotteryResult === 'win' && (
                            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl text-green-300 text-sm font-medium animate-fadeIn">
                                Show this screen to your server to claim your complimentary drink.
                            </div>
                        )}
                         {!isRolling && lotteryResult === 'lose' && (
                            <div className="text-white/50 text-sm animate-fadeIn max-w-xs">
                                The stars didn&apos;t align today, but we look forward to serving you again soon.
                            </div>
                        )}
                    </div>
                )}

                {/* 2. QUESTION SCREEN */}
                {showQuestions && !finished && !showContactQuestion && !showLottery && (
                     <div className="animate-fadeIn w-full h-full flex flex-col justify-between">
                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-6">
                            {questions.map((_, idx) => (
                                <div key={idx} 
                                    className={`h-1 flex-1 rounded-full transition-all duration-500 
                                    ${idx <= questionIndex ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                             <div className="w-52 h-52 relative mb-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                <Image 
                                    src={getCurrentImage()} 
                                    alt="Question Context" 
                                    width={208}
                                    height={208}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            <h2 className="font-playfair text-2xl md:text-3xl text-center leading-tight mb-6 px-2 text-white">
                                {questions[questionIndex]}
                            </h2>

                            {/* Answer Options - Always Visible */}
                            <div className="flex w-full justify-between px-4 gap-4 mb-6">
                                <button 
                                    onClick={() => handleEmojiClick('left')} 
                                    disabled={isProcessingAnswer}
                                    className={`flex-1 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 group
                                    ${currentQuestionAnswered && pendingAnswerDirection === 'left' ? 'ring-2 ring-[#D4AF37] bg-white/10' : ''}
                                    ${isProcessingAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-4xl transform group-hover:scale-110 transition-transform group-active:scale-90">😞</div>
                                    <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold text-white">
                                        {surveyType === 'operational' ? 'Dissatisfied' : 'Left'}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => handleEmojiClick('right')} 
                                    disabled={isProcessingAnswer}
                                    className={`flex-1 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 group
                                    ${currentQuestionAnswered && pendingAnswerDirection === 'right' ? 'ring-2 ring-[#D4AF37] bg-white/10' : ''}
                                    ${isProcessingAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-4xl transform group-hover:scale-110 transition-transform group-active:scale-90">😊</div>
                                    <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold text-white">
                                        {surveyType === 'operational' ? 'Delighted' : 'Right'}
                                    </span>
                                </button>
                            </div>

                            {/* Optional Details Section - Always Visible */}
                            <div className="w-full space-y-3 animate-fadeIn">
                                <p className="text-white/60 text-xs text-center">Add details (optional)</p>
                                
                                {/* Tabs */}
                                <div className="bg-white/10 p-1 rounded-full inline-flex w-full backdrop-blur-md">
                                    <button 
                                        onClick={() => setDetailsTab('photo')}
                                        className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                        ${detailsTab === 'photo' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    >
                                        <Camera size={12} className="inline mr-1.5" />
                                        Photo
                                    </button>
                                    <button 
                                        onClick={() => setDetailsTab('text')}
                                        className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                        ${detailsTab === 'text' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    >
                                        Text
                                    </button>
                                </div>

                                {/* Photo Tab */}
                                {detailsTab === 'photo' && (
                                    <div className="space-y-2">
                                        {questionDetails[questionIndex]?.photoPreview ? (
                                            <div className="relative">
                                                <Image 
                                                    src={questionDetails[questionIndex].photoPreview!} 
                                                    alt="Preview" 
                                                    width={400}
                                                    height={112}
                                                    className="w-full h-28 object-cover rounded-xl"
                                                    unoptimized
                                                />
                                                <button
                                                    onClick={handleRemovePhoto}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors"
                                                >
                                                    <X size={12} className="text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-white/5">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Camera size={20} className="text-white/40 mb-1" />
                                                    <p className="text-xs text-white/60">Tap to add photo</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={handlePhotoSelect}
                                                />
                                            </label>
                                        )}
                                        {uploadError && (
                                            <p className="text-red-400 text-xs text-center">{uploadError}</p>
                                        )}
                                    </div>
                                )}

                                {/* Text Tab */}
                                {detailsTab === 'text' && (
                                    <div className="space-y-2">
                                        <textarea
                                            value={questionDetails[questionIndex]?.text || ''}
                                            onChange={handleTextChange}
                                            placeholder="Share your feedback..."
                                            className="w-full bg-white/5 border border-white/20 rounded-xl py-2.5 px-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all resize-none text-sm"
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Continue Button - Show when answer is selected */}
                                {currentQuestionAnswered && (
                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={handleContinueFromDetails}
                                            disabled={isProcessingAnswer || isUploadingMedia}
                                            className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300
                                            ${(isProcessingAnswer || isUploadingMedia) 
                                                ? 'bg-white/10 text-white/20 cursor-not-allowed' 
                                                : 'bg-[#D4AF37] text-black hover:bg-[#E5C158] shadow-[0_0_20px_rgba(212,175,55,0.3)]'}`}
                                        >
                                            {isUploadingMedia ? 'Uploading...' : isProcessingAnswer ? 'Saving...' : 'Continue'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!currentQuestionAnswered && (
                            <div className="text-center opacity-50 text-[10px] uppercase tracking-widest mt-4 text-white">
                                Swipe card to answer
                            </div>
                        )}
                     </div>
                )}

                {/* 5. FINAL FORTUNE */}
                {finished && !showLottery && (
                     <div className="animate-fadeIn w-full text-center flex flex-col items-center">
                        <div className="w-32 h-32 mb-6 relative">
                             <Image 
                                 src="/survey/4.png" 
                                 alt="Fortune" 
                                 width={128}
                                 height={128}
                                 className="w-full h-full object-contain opacity-90"
                             />
                        </div>
                        
                        <h2 className="font-playfair text-2xl text-[#D4AF37] mb-6">
                            Your Fortune
                        </h2>
                        
                        <div className="bg-[#fffdf5] text-black p-8 relative mb-8 shadow-2xl max-w-xs mx-auto transform rotate-1">
                            <p className="font-playfair italic text-lg leading-relaxed opacity-80">
                                {isWisdomLoading ? 'Loading your fortune...' : `"${fortuneWisdom ?? ''}"`}
                            </p>
                             <div className="h-1 w-12 bg-[#D4AF37] mx-auto mt-6" />
                        </div>
                        
                        <p className="text-[10px] opacity-40 uppercase tracking-[0.3em]">Thank you for visiting</p>
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
