// components/ChallengeSelect.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { GameRecord, User } from '../types';
import Button from './Button';

interface ChallengeSelectProps {
  onBackToGame: () => void;
  onStartChallenge: (record: GameRecord) => void;
  loadUsers: () => Map<string, User>;
  loadAllGameRecords: (users: Map<string, User>) => GameRecord[];
  currentUser: string | null;
}

const ChallengeSelect: React.FC<ChallengeSelectProps> = ({
  onBackToGame,
  onStartChallenge,
  loadUsers,
  loadAllGameRecords,
  currentUser,
}) => {
  const [allRecords, setAllRecords] = useState<GameRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const fetchAndSortAllRecords = useCallback(() => {
    const usersMap = loadUsers();
    let records: GameRecord[] = loadAllGameRecords(usersMap);

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
  }, [loadUsers, loadAllGameRecords]);

  useEffect(() => {
    fetchAndSortAllRecords();
  }, [fetchAndSortAllRecords]);

  const handleStartChallenge = () => {
    if (selectedRecordId) {
      const record = allRecords.find((r) => r.id === selectedRecordId);
      if (record) {
        onStartChallenge(record);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-white border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        Select a Challenge
      </h2>

      {allRecords.length === 0 ? (
        <p className="text-center text-gray-300 text-xl">No games played yet to challenge!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {allRecords.map((record, index) => (
            <div
              key={record.id}
              className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200
                ${index % 2 === 0 ? 'bg-indigo-600/70' : 'bg-purple-700/70'}
                ${selectedRecordId === record.id ? 'border-4 border-yellow-400 scale-105' : 'border-4 border-transparent hover:scale-102 hover:bg-indigo-600'}`}
              onClick={() => setSelectedRecordId(record.id)}
              role="button"
              aria-pressed={selectedRecordId === record.id}
              tabIndex={0}
            >
              <div className="text-left mb-2 sm:mb-0">
                <p className="font-semibold text-lg text-yellow-300">
                  <span className="text-white">#{index + 1}</span> {record.username} {record.username === currentUser && '(You)'}
                </p>
                <p className="text-md text-emerald-300">Score: {record.score} / {record.totalQuestions}</p>
              </div>
              <p className="text-sm text-gray-300">
                {new Date(record.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center space-x-4">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4" variant="secondary">
          Back to Game
        </Button>
        <Button onClick={handleStartChallenge} disabled={!selectedRecordId} className="text-xl px-8 py-4">
          Start Challenge
        </Button>
      </div>
    </div>
  );
};

export default ChallengeSelect;