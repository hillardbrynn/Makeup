import { useState } from 'react';
import '../styles/globals.css';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const quizQuestions = [
  {
    id: 1,
    question: "What's your skin tone?",
    subtext: "This helps us find your perfect shade match",
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
    question: "What's your undertone?",
    subtext: "Look at the veins on your wrist to help determine",
    options: [
      { id: 'cool', label: 'Cool', description: 'Blue or purple veins, silver jewelry looks best' },
      { id: 'warm', label: 'Warm', description: 'Green veins, gold jewelry looks best' },
      { id: 'neutral', label: 'Neutral', description: 'Mix of both, both metals look good' }
    ]
  },
  {
    id: 3,
    question: "What's your preferred coverage level?",
    subtext: "How much coverage do you typically like?",
    options: [
      { id: 'sheer', label: 'Sheer', description: 'Just a hint of coverage' },
      { id: 'medium', label: 'Medium', description: 'Natural-looking coverage' },
      { id: 'full', label: 'Full', description: 'Complete coverage' }
    ]
  },
  {
    id: 4,
    question: "What's your skin type?",
    subtext: "This helps us recommend the right formula",
    options: [
      { id: 'oily', label: 'Oily', description: 'Shiny throughout the day' },
      { id: 'dry', label: 'Dry', description: 'Feels tight and flaky' },
      { id: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
      { id: 'normal', label: 'Normal', description: 'Generally balanced' }
    ]
  },
  {
    id: 5,
    question: "What are your main concerns?",
    subtext: "Select all that apply",
    multiSelect: true,
    options: [
      { id: 'acne', label: 'Acne', description: 'Breakouts and blemishes' },
      { id: 'aging', label: 'Fine Lines', description: 'Signs of aging' },
      { id: 'dark-spots', label: 'Dark Spots', description: 'Hyperpigmentation' },
      { id: 'redness', label: 'Redness', description: 'Uneven tone or rosacea' }
    ]
  }
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleAnswer = (optionId) => {
    const question = quizQuestions[currentQuestion];
    
    if (question.multiSelect) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: optionId }));
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOptions([]);
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
      setSelectedOptions([]);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
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
        <h2 className="text-3xl font-bold mb-2">
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
                p-4 rounded-lg border-2 text-left transition
                ${(quizQuestions[currentQuestion].multiSelect 
                  ? selectedOptions.includes(option.id)
                  : answers[quizQuestions[currentQuestion].id] === option.id)
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-rose-300'
                }
              `}
              onClick={() => handleAnswer(option.id)}
            >
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full transition
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

          {quizQuestions[currentQuestion].multiSelect && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition"
            >
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;