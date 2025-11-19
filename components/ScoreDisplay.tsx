// components/ScoreDisplay.tsx
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  challengedScore?: number | null; // Optional prop for challenge mode
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, challengedScore }) => {
  return (
    <div className="text-3xl font-bold text-white mb-6 text-center">
      Score: <span className="text-emerald-300">{score}</span>
      {challengedScore !== undefined && challengedScore !== null && (
        <span className="text-blue-300 ml-4">
          {' '}
          / Target: <span className="text-yellow-300">{challengedScore}</span>
        </span>
      )}
    </div>
  );
};

export default ScoreDisplay;