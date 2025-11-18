// components/QuestionCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MathQuestion } from '../types';
import Input from './Input';
import Button from './Button';

interface QuestionCardProps {
  question: MathQuestion;
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
    ? 'border-emerald-400 text-emerald-400'
    : lastAnswerCorrect === false
    ? 'border-red-400 text-red-400'
    : 'border-blue-400 text-blue-400';

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto text-white text-center border-4 border-indigo-500">
      <div className="text-lg font-medium mb-2 opacity-80">Question {questionNumber} / {totalQuestions}</div>
      <h2 className="text-5xl md:text-6xl font-extrabold mb-8 drop-shadow-lg leading-tight">
        {question.questionText}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Your Answer"
          aria-label="Enter your answer"
          className={`text-center transition-all duration-300 ${feedbackClass}`}
        />
        <Button type="submit" className="w-full text-xl py-4">
          {isLastQuestion ? 'Finish Game' : 'Submit Answer'}
        </Button>
      </form>
    </div>
  );
};

export default QuestionCard;
