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
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-white border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        Global Leaderboard
      </h2>

      {allRecords.length === 0 ? (
        <p className="text-center text-gray-300 text-xl">No games played across all users yet!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {allRecords.map((record, index) => (
            <div
              key={record.id}
              className={`flex justify-between items-center p-4 rounded-lg shadow-md ${
                index % 2 === 0 ? 'bg-indigo-600/70' : 'bg-purple-700/70'
              }`}
            >
              <div>
                <p className="font-semibold text-lg text-yellow-300">
                  <span className="text-white">#{index + 1}</span> {record.username}
                </p>
                <p className="text-md text-emerald-300">Score: {record.score} / {record.totalQuestions}</p>
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

export default Leaderboard;