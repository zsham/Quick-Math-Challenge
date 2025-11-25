// components/GameHistory.tsx
import React, { useEffect, useState } from 'react';
import { GameRecord } from '../types';
import Button from './Button';

interface GameHistoryProps {
  username: string;
  onBackToGame: () => void;
  loadGameRecords: (username: string) => GameRecord[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ username, onBackToGame, loadGameRecords }) => {
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    const fetchedRecords = loadGameRecords(username);
    // Sort by date descending (most recent first)
    fetchedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(fetchedRecords);
  }, [username, loadGameRecords]);

  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border-4 border-white">
      <h2 className="text-3xl font-extrabold mb-8 text-indigo-900 text-center">
        {username}'s History
      </h2>

      {records.length === 0 ? (
        <p className="text-center text-gray-500 text-xl py-8">No games played yet. Go challenge yourself!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {records.map((record, index) => (
            <div
              key={record.id}
              className={`flex justify-between items-center p-5 rounded-2xl transition-transform hover:scale-[1.01] ${
                index % 2 === 0 ? 'bg-sky-50' : 'bg-purple-50'
              }`}
            >
              <div>
                <p className="font-bold text-xl text-gray-800">Score: <span className="text-indigo-600">{record.score}</span> / {record.totalQuestions}</p>
                <p className="text-sm text-gray-500 font-medium">
                  {new Date(record.date).toLocaleString()}
                </p>
              </div>
              <div className="text-2xl">
                {record.score === record.totalQuestions ? '🏆' : '📜'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4" variant="secondary">
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default GameHistory;