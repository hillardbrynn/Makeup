'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define proper types for our quiz data
type QuizOption = {
  id: string;
  label: string;
  description: string;
};

type QuizQuestion = {
  id: number;
  question: string;
  subtext: string;
  multiSelect?: boolean;
  options: QuizOption[];
};

// Define type for answers
type Answers = {
  [key: number]: string | string[];
};

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Hey there! First things first—how would you describe your skin tone?",
    subtext: "This helps us find your perfect shade match. No pressure, just pick what feels right!",
    options: [
      { id: 'fair', label: 'Fair', description: 'Very light skin that burns easily' },
      { id: 'light', label: 'Light', description: 'Light skin that sometimes tans' },
      { id: 'medium', label: 'Medium', description: 'Golden or olive undertones' },
      { id: 'tan', label: 'Tan', description: 'Naturally tanned or bronze skin' },
      { id: 'deep', label: 'Deep', description: 'Rich darker skin tones' },
      { id: 'very-deep', label: 'Very Deep', description: 'Deep ebony skin tones' }
    ]
  },
  {
    id: 2,
    question: "What&apos;s your undertone vibe? 💖",
    subtext: "Take a peek at your wrist—are your veins more blue or green? That&apos;s a hint!",
    options: [
      { id: 'cool', label: 'Cool', description: 'Blue or purple veins, silver jewelry looks best' },
      { id: 'warm', label: 'Warm', description: 'Green veins, gold jewelry looks best' },
      { id: 'neutral', label: 'Neutral', description: 'A mix of both, both metals look good' }
    ]
  },
  {
    id: 3,
    question: "How much coverage are we talking? 💁‍♀️",
    subtext: "Think of your everyday vibe—do you like a barely-there look or full-on glam?",
    options: [
      { id: 'sheer', label: 'Sheer', description: 'Just a hint of coverage' },
      { id: 'medium', label: 'Medium', description: 'Natural-looking coverage' },
      { id: 'full', label: 'Full', description: 'Complete coverage' }
    ]
  },
  {
    id: 4,
    question: "Alright, spill the tea—what&apos;s your skin type? 🧴",
    subtext: "This helps us recommend formulas that actually vibe with your skin.",
    options: [
      { id: 'oily', label: 'Oily', description: 'Shiny throughout the day' },
      { id: 'dry', label: 'Dry', description: 'Feels tight and flaky' },
      { id: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
      { id: 'normal', label: 'Normal', description: 'Generally balanced' }
    ]
  },
  {
    id: 5,
    question: "What are your main skin concerns? (Feel free to select all that apply!) ✨",
    subtext: "We&apos;ve got you—this helps us recommend products that work for you.",
    multiSelect: true,
    options: [
      { id: 'acne', label: 'Acne', description: 'Breakouts and blemishes' },
      { id: 'aging', label: 'Fine Lines', description: 'Signs of aging' },
      { id: 'dark-spots', label: 'Dark Spots', description: 'Hyperpigmentation' },
      { id: 'redness', label: 'Redness', description: 'Uneven tone or rosacea' },
      { id: 'pores', label: 'Pores', description: 'Visible or large pores' },
      { id: 'texture', label: 'Texture', description: 'Rough or uneven skin texture' }
    ]
  },
  {
    id: 6,
    question: "What&apos;s your go-to lip product? 💋",
    subtext: "Choose the one that you reach for the most!",
    options: [
      { id: 'lipstick', label: 'Lipstick', description: 'Classic and bold' },
      { id: 'gloss', label: 'Lip Gloss', description: 'Shiny and fresh' },
      { id: 'stain', label: 'Lip Stain', description: 'Long-lasting and subtle' },
      { id: 'balm', label: 'Lip Balm', description: 'Simple and hydrating' }
    ]
  },
  {
    id: 7,
    question: "What&apos;s your eye color? 👀",
    subtext: "This helps us suggest shades that make your eyes pop!",
    options: [
      { id: 'brown', label: 'Brown', description: 'Warm and rich' },
      { id: 'hazel', label: 'Hazel', description: 'A mix of green and brown' },
      { id: 'green', label: 'Green', description: 'Bright and vibrant' },
      { id: 'blue', label: 'Blue', description: 'Cool and striking' },
      { id: 'gray', label: 'Gray', description: 'Soft and unique' }
    ]
  },
  {
    id: 8,
    question: "What&apos;s your makeup vibe? 💄",
    subtext: "Choose the style that fits your aesthetic the most!",
    options: [
      { id: 'natural', label: 'Natural', description: 'Simple and fresh-faced' },
      { id: 'minimal', label: 'Minimal', description: 'Barely-there with a hint of color' },
      { id: 'glam', label: 'Glam', description: 'Bold and camera-ready' },
      { id: 'experimental', label: 'Experimental', description: 'I love trying different looks!' }
    ]
  },
  {
    id: 9,
    question: "Last question—how often do you wear makeup? 💁‍♀️",
    subtext: "We want to recommend products that match your lifestyle!",
    options: [
      { id: 'daily', label: 'Daily', description: 'Makeup is part of my everyday routine' },
      { id: 'few-times', label: 'A few times a week', description: 'I wear makeup pretty regularly' },
      { id: 'occasionally', label: 'Occasionally', description: 'Only for special events' },
      { id: 'rarely', label: 'Rarely', description: 'Almost never wear makeup' }
    ]
  }
];

// Interface for formatted answers to be sent to the API
interface FormattedAnswers {
  skin_tone: string;
  under_tone: string;
  coverage_level: string;
  skin_type: string;
  restrictions: string;
  lip_product: string;
  eye_color: string;
  makeup_style: string;
  makeup_frequency: string;
  [key: string]: string;
}

export default function QuizPage() {
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [debugInfo, setDebugInfo] = useState<string>('');
    const router = useRouter();
    
    const handleAnswer = (optionId: string) => {
      const question = quizQuestions[currentQuestion];
      
      if (question.multiSelect) {
        // For multi-select questions, just update selection without advancing
        setSelectedOptions(prev => 
          prev.includes(optionId) 
            ? prev.filter(id => id !== optionId)
            : [...prev, optionId]
        );
      } else {
        // For single-select questions, save answer and move to next question
        setAnswers(prev => ({ ...prev, [question.id]: optionId }));
        
        // Only advance if there's a next question
        if (currentQuestion < quizQuestions.length - 1) {
          setTimeout(() => {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOptions([]);
          }, 300); // Small delay for better UX
        }
      }
    };
  
    const handleNext = () => {
      if (quizQuestions[currentQuestion].multiSelect) {
        setAnswers(prev => ({ ...prev, [quizQuestions[currentQuestion].id]: [...selectedOptions] }));
        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setSelectedOptions([]);
        }
      }
    };
  
    const handleBack = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
        // For better UX, when going back to a multi-select question, restore previous selections
        const prevQuestion = quizQuestions[currentQuestion - 1];
        if (prevQuestion.multiSelect && answers[prevQuestion.id]) {
          const prevAnswers = answers[prevQuestion.id];
          if (Array.isArray(prevAnswers)) {
            setSelectedOptions(prevAnswers);
          } else {
            setSelectedOptions([]);
          }
        } else {
          setSelectedOptions([]);
        }
      }
    };

    // Replace the handleSubmit function in your QuizPage component

    const handleSubmit = async () => {
      // For the last question if it's multi-select
      if (quizQuestions[currentQuestion].multiSelect) {
        setAnswers(prev => ({ ...prev, [quizQuestions[currentQuestion].id]: [...selectedOptions] }));
      }

      setIsSubmitting(true);
      setError(null);
      setDebugInfo('');
      
      try {
        // Format the answers into a structure that matches FastAPI model
        const formattedAnswers: FormattedAnswers = {
          skin_tone: '',
          under_tone: '',
          coverage_level: '',
          skin_type: '',
          restrictions: '',
          lip_product: '',
          eye_color: '',
          makeup_style: '',
          makeup_frequency: ''
        };
        
        // Map answer IDs to the question field names in the database
        const fieldMapping: { [key: number]: keyof FormattedAnswers } = {
          1: 'skin_tone',
          2: 'under_tone',
          3: 'coverage_level',
          4: 'skin_type',
          5: 'restrictions',
          6: 'lip_product',
          7: 'eye_color',
          8: 'makeup_style',
          9: 'makeup_frequency'
        };
        
        // Format answers for API request
        Object.entries(answers).forEach(([questionIdStr, answer]) => {
          const questionId = parseInt(questionIdStr, 10);
          const fieldName = fieldMapping[questionId];
          if (fieldName) {
            formattedAnswers[fieldName] = Array.isArray(answer) ? answer.join(',') : answer;
          }
        });
        
        // Add the final question's answer if it's multi-select
        if (quizQuestions[currentQuestion].multiSelect) {
          const fieldName = fieldMapping[quizQuestions[currentQuestion].id];
          if (fieldName) {
            formattedAnswers[fieldName] = selectedOptions.join(',');
          }
        }
        
        // Clear existing embeddings before creating new ones
        sessionStorage.removeItem('quiz_embedding');
        
        console.log("Generating embedding for:", formattedAnswers);
        setDebugInfo(prev => prev + `\nGenerating embedding for quiz answers: ${JSON.stringify(formattedAnswers)}`);
        
        // Send to backend to generate embedding (without storing)
        const timestamp = new Date().getTime();
        const apiUrl = `${process.env.API_LINK}generate-embedding?t=${timestamp}`;
        console.log(`Calling API: ${apiUrl}`);
        setDebugInfo(prev => prev + `\nCalling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(formattedAnswers),
        });
        
        console.log("Response status:", response.status);
        setDebugInfo(prev => prev + `\nResponse status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status} ${errorText}`);
          setDebugInfo(prev => prev + `\nAPI error: ${response.status} ${errorText}`);
          throw new Error(`Failed to generate embedding: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        // Validate embedding data
        if (!data.embedding || !Array.isArray(data.embedding)) {
          console.error('Invalid embedding response:', data);
          setDebugInfo(prev => prev + `\nInvalid embedding response: ${JSON.stringify(data)}`);
          throw new Error('Server returned invalid embedding data');
        }
        
        console.log('Embedding generated successfully', {
          length: data.embedding.length,
          sample: data.embedding.slice(0, 5),
          meta: data.meta
        });
        
        setDebugInfo(prev => prev + `\nEmbedding generated successfully with length: ${data.embedding.length}`);
        setDebugInfo(prev => prev + `\nNon-zero values: ${data.meta?.nonzero_values || 'unknown'}`);
        
        // Store answers and profile information for debugging
        const profile = {
          answers: formattedAnswers,
          timestamp: new Date().toISOString(),
          // Add basic profile information for easier debugging
          summary: `Skin: ${formattedAnswers.skin_tone}/${formattedAnswers.under_tone}, Style: ${formattedAnswers.makeup_style}`
        };
        
        // Store the embedding in sessionStorage for the shop page to access
        sessionStorage.setItem('quiz_embedding', JSON.stringify(data.embedding));
        sessionStorage.setItem('quiz_answers', JSON.stringify(formattedAnswers));
        sessionStorage.setItem('quiz_profile', JSON.stringify(profile));
        
        console.log('Stored quiz data in sessionStorage');
        setDebugInfo(prev => prev + `\nStored quiz data in sessionStorage`);
        
        // Verify what was stored
        const storedEmbedding = sessionStorage.getItem('quiz_embedding');
        if (storedEmbedding) {
          try {
            const parsed = JSON.parse(storedEmbedding);
            console.log('Successfully stored embedding:', {
              length: parsed.length,
              sample: parsed.slice(0, 5)
            });
            setDebugInfo(prev => prev + `\nVerified embedding in storage: length=${parsed.length}`);
          } catch (err) {
            console.error('Error parsing stored embedding:', err);
            setDebugInfo(prev => prev + `\nError verifying stored embedding: ${(err as Error).message}`);
          }
        }
        
        setCompleted(true);
        
        // Wait a moment before redirecting to shop page
        setTimeout(() => {
          setIsRedirecting(true);
          router.push(`/shop?personalized=true&t=${timestamp}`);
        }, 2000);
      } catch (err) {
        console.error('Error submitting quiz:', err);
        setDebugInfo(prev => prev + `\nError submitting quiz: ${err instanceof Error ? err.message : String(err)}`);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to process quiz results');
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    
    // Show completion screen
    if (completed) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50 flex items-center justify-center p-6">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-30" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-100 rounded-tr-[40%] opacity-20" />
          
          <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full p-8 text-center">
            <div className="h-2 bg-gradient-to-r from-rose-400 to-pink-500 absolute top-0 left-0 right-0"></div>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Thank You! 🎉</h2>
            <p className="text-lg text-gray-700 mb-6">
              We&apos;ve analyzed your beauty profile and found your perfect product matches!
            </p>
            
            {isRedirecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
                <p>Redirecting to your personalized shop...</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsRedirecting(true);
                  router.push('/shop?personalized=true');
                }}
                className="px-8 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md hover:shadow-lg mx-auto"
              >
                View personalized products
              </button>
            )}
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50 flex items-center justify-center p-6">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-100 rounded-bl-[40%] opacity-30" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-100 rounded-tr-[40%] opacity-20" />
        
        <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
          {/* Header accent */}
          <div className="h-2 bg-gradient-to-r from-rose-400 to-pink-500"></div>
          
          <div className="p-8">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
  
            {/* Question counter */}
            <div className="text-sm text-gray-500 mb-2">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>
  
            {/* Question */}
            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              {quizQuestions[currentQuestion].question}
            </h2>
            <p className="text-gray-600 mb-8">
              {quizQuestions[currentQuestion].subtext}
            </p>
  
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quizQuestions[currentQuestion].options.map((option) => (
                <button
                  key={option.id}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                    ${(quizQuestions[currentQuestion].multiSelect 
                      ? selectedOptions.includes(option.id)
                      : answers[quizQuestions[currentQuestion].id] === option.id)
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-rose-300'
                    }
                  `}
                  onClick={() => handleAnswer(option.id)}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full transition-colors
                  ${currentQuestion === 0 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft size={20} />
                Back
              </button>
  
              {currentQuestion < quizQuestions.length - 1 && quizQuestions[currentQuestion].multiSelect && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md hover:shadow-lg"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              )}
              
              {currentQuestion === quizQuestions.length - 1 && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`
                    flex items-center gap-2 px-8 py-3 rounded-full bg-rose-500 text-white 
                    hover:bg-rose-600 transition-all shadow-md hover:shadow-lg
                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubmitting ? 'Analyzing...' : 'See your matches'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {/* Debug info - hidden in production */}
            {process.env.NODE_ENV !== 'production' && debugInfo && (
              <div className="mt-4 p-3 bg-gray-50 text-gray-700 rounded-lg text-xs font-mono whitespace-pre-wrap">
                <p className="font-medium">Debug Info:</p>
                <p>{debugInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }