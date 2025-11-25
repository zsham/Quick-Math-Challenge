// components/ScoreDisplay.tsx
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  challengedScore?: number | null; // Optional prop for challenge mode
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, challengedScore }) => {
  return (
    <div className="text-3xl font-black text-indigo-900 mb-6 text-center bg-white/30 backdrop-blur-md py-2 px-6 rounded-full inline-block mx-auto">
      ⭐ <span className="text-sky-700">{score}</span>
      {challengedScore !== undefined && challengedScore !== null && (
        <span className="text-indigo-800 ml-4 text-2xl">
          / Target: <span className="text-amber-600">{challengedScore}</span>
        </span>
      )}
    </div>
  );
};

export default ScoreDisplay;