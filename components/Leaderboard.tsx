// components/Leaderboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { GameRecord, User } from '../types';
import Button from './Button';

interface LeaderboardProps {
  onBackToGame: () => void;
  loadUsers: () => Map<string, User>;
  loadGameRecords: (username: string) => GameRecord[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToGame, loadUsers, loadGameRecords }) => {
  const [allRecords, setAllRecords] = useState<GameRecord[]>([]);

  const fetchAllRecords = useCallback(() => {
    const usersMap = loadUsers();
    const usernames = Array.from(usersMap.keys());
    let records: GameRecord[] = [];

    usernames.forEach((username) => {
      const userRecords = loadGameRecords(username);
      records = records.concat(userRecords);
    });

    // Sort: highest score first, then more questions, then most recent date
    records.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.totalQuestions !== a.totalQuestions) {
        return b.totalQuestions - a.totalQuestions;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setAllRecords(records);
  }, [loadUsers, loadGameRecords]);

  useEffect(() => {
    fetchAllRecords();
  }, [fetchAllRecords]);

  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border-4 border-white">
      <h2 className="text-4xl font-extrabold mb-8 text-indigo-900 text-center">
        Leaderboard
      </h2>

      {allRecords.length === 0 ? (
        <p className="text-center text-gray-500 text-xl py-8">No games played yet!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {allRecords.map((record, index) => (
            <div
              key={record.id}
              className={`flex justify-between items-center p-5 rounded-2xl shadow-sm border border-gray-100 ${
                index === 0 ? 'bg-yellow-50 border-yellow-200' : 
                index === 1 ? 'bg-gray-50 border-gray-200' : 
                index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${
                     index === 0 ? 'bg-yellow-400 text-yellow-900' :
                     index === 1 ? 'bg-gray-300 text-gray-800' :
                     index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-sky-100 text-sky-700'
                 }`}>
                     {index + 1}
                 </div>
                 <div>
                    <p className="font-bold text-lg text-gray-800">
                      {record.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                 </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-indigo-600">{record.score} <span className="text-gray-400 text-sm">/ {record.totalQuestions}</span></p>
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

export default Leaderboard;