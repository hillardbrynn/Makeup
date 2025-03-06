'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';

const quizQuestions = [
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
    question: "What's your undertone vibe? 💖",
    subtext: "Take a peek at your wrist—are your veins more blue or green? That's a hint!",
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
    question: "Alright, spill the tea—what's your skin type? 🧴",
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
    subtext: "We've got you—this helps us recommend products that work for you.",
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
    question: "What's your go-to lip product? 💋",
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
    question: "What's your eye color? 👀",
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
    question: "What's your makeup vibe? 💄",
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

export default function QuizPage() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);
    
    const handleAnswer = (optionId) => {
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
        setAnswers(prev => ({ ...prev, [quizQuestions[currentQuestion].id]: selectedOptions }));
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
          setSelectedOptions(answers[prevQuestion.id]);
        } else {
          setSelectedOptions([]);
        }
      }
    };

// Replace your current handleSubmit function with this version

    const handleSubmit = async () => {
      // For the last question if it's multi-select
      if (quizQuestions[currentQuestion].multiSelect) {
        setAnswers(prev => ({ ...prev, [quizQuestions[currentQuestion].id]: selectedOptions }));
      }

      setIsSubmitting(true);
      setError(null);
      
      try {
        // Format the answers into a structure that matches your FastAPI model
        const formattedAnswers = {};
        
        // Map answer IDs to the question field names in the database
        const fieldMapping = {
          1: 'skin_tone',
          2: 'undertone',
          3: 'coverage',
          4: 'skin_type',
          5: 'skin_concerns',
          6: 'lip_product',
          7: 'eye_color',
          8: 'makeup_style',
          9: 'makeup_frequency'
        };
        
        // Format answers for API request
        Object.entries(answers).forEach(([questionId, answer]) => {
          const fieldName = fieldMapping[questionId];
          if (fieldName) {
            formattedAnswers[fieldName] = Array.isArray(answer) ? answer.join(',') : answer;
          }
        });
        
        // Add the final question's answer if it's multi-select
        if (quizQuestions[currentQuestion].multiSelect) {
          const fieldName = fieldMapping[quizQuestions[currentQuestion].id];
          formattedAnswers[fieldName] = selectedOptions.join(',');
        }
        
        // Ensure all required fields are present
        const requiredFields = Object.values(fieldMapping);
        for (const field of requiredFields) {
          if (!formattedAnswers[field]) {
            formattedAnswers[field] = ''; // Provide default empty string for missing fields
          }
        }
        
        console.log("Submitting data:", formattedAnswers);
        
        // Send to backend
        const response = await fetch('http://localhost:8000/store-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedAnswers),
        });
        
        // Handle different status codes
        if (response.status === 422) {
          const validationErrors = await response.json();
          console.error("Validation errors:", validationErrors);
          
          // Format validation errors for display
          let errorMessage = "Validation error: ";
          if (validationErrors.detail && Array.isArray(validationErrors.detail)) {
            errorMessage += validationErrors.detail.map(err => {
              if (err.loc && err.loc.length > 1) {
                return `Field '${err.loc[1]}': ${err.msg}`;
              }
              return err.msg;
            }).join('; ');
          } else {
            errorMessage += JSON.stringify(validationErrors);
          }
          
          throw new Error(errorMessage);
        } else if (!response.ok) {
          let errorMessage = `Failed to submit quiz results: ${response.status}`;
          
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
            
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (parseErr) {
            // If not JSON, get text
            const errorText = await response.text();
            console.error("Error response:", errorText);
            errorMessage += ` ${errorText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Success response:', data);
        setCompleted(true);
        
        // You could redirect to a results page here
        // router.push('/quiz/results');
      } catch (err) {
        console.error('Error submitting quiz:', err);
        setError(err.message || 'Failed to submit quiz results');
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
              We've received your quiz answers and are generating personalized recommendations for you!
            </p>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md hover:shadow-lg mx-auto"
            >
              Back to Home
            </button>
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
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }