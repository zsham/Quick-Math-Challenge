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
    <div className="text-3xl font-black text-indigo-900 mb-6 text-center drop-shadow-sm bg-white/30 backdrop-blur-md py-2 px-6 rounded-full inline-block mx-auto">
      ⏰ <span className={timeLeft <= 10 ? 'text-rose-500' : 'text-indigo-800'}>{displayTime}</span>
    </div>
  );
};

export default Timer;