// components/ScoreDisplay.tsx
import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="text-3xl font-bold text-white mb-6 text-center">
      Score: <span className="text-emerald-300">{score}</span>
    </div>
  );
};

export default ScoreDisplay;
