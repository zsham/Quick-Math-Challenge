// components/QuestionCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types'; // Updated import to use 'Question'
import Input from './Input';
import Button from './Button';

interface QuestionCardProps {
  question: Question; // Updated prop type to 'Question'
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
  lastAnswerCorrect: boolean | null; // null for no answer yet, true for correct, false for incorrect
  isLastQuestion: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
  lastAnswerCorrect,
  isLastQuestion,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(''); // Clear input on new question
    if (inputRef.current) {
      inputRef.current.focus(); // Focus input field
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userAnswer = parseFloat(inputValue);
    const isCorrect = userAnswer === question.answer;
    onAnswer(isCorrect);
    setInputValue(''); // Clear input after submission
  };

  const feedbackClass = lastAnswerCorrect === true
    ? 'border-emerald-400 ring-4 ring-emerald-100'
    : lastAnswerCorrect === false
    ? 'border-rose-400 ring-4 ring-rose-100'
    : 'border-gray-200';

  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-lg mx-auto text-center border-4 border-white">
      <div className="text-lg font-bold text-indigo-400 mb-2 uppercase tracking-wide">Question {questionNumber} / {totalQuestions}</div>
      {question.type === 'situation' && question.situationText && (
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <p className="text-xl text-gray-700 font-medium leading-relaxed">{question.situationText}</p>
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-black mb-8 text-indigo-900 leading-tight">
        {question.questionText}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="?"
          aria-label="Enter your answer"
          className={`text-center text-4xl font-bold py-6 transition-all duration-300 ${feedbackClass}`}
        />
        <Button type="submit" className="w-full text-xl py-4 rounded-2xl">
          {isLastQuestion ? 'Finish Game 🏁' : 'Submit Answer ✨'}
        </Button>
      </form>
    </div>
  );
};

export default QuestionCard;