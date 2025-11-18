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
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-white border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        {username}'s Game History
      </h2>

      {records.length === 0 ? (
        <p className="text-center text-gray-300 text-xl">No games played yet. Go challenge yourself!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {records.map((record, index) => (
            <div
              key={record.id}
              className={`flex justify-between items-center p-4 rounded-lg shadow-md ${
                index % 2 === 0 ? 'bg-indigo-600/70' : 'bg-purple-700/70'
              }`}
            >
              <div>
                <p className="font-semibold text-lg">Score: <span className="text-emerald-300">{record.score}</span> / {record.totalQuestions}</p>
                <p className="text-sm text-gray-300">
                  {new Date(record.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4">
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default GameHistory;