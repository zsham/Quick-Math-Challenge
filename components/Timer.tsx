// components/Timer.tsx
import React from 'react';

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="text-3xl font-bold text-white mb-6 text-center">
      Time Left: <span className={timeLeft <= 10 ? 'text-red-400' : 'text-yellow-300'}>{displayTime}</span>
    </div>
  );
};

export default Timer;
