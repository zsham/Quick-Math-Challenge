// components/ActiveChallenges.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ChallengePosting } from '../types';
import Button from './Button';

interface ActiveChallengesProps {
  onBackToGame: () => void;
  onStartChallenge: (challenge: ChallengePosting) => void;
  loggedInUser: string | null;
  loadActiveChallenges: () => ChallengePosting[];
  onRemoveChallenge: (challengeId: string) => void;
}

const ActiveChallenges: React.FC<ActiveChallengesProps> = ({
  onBackToGame,
  onStartChallenge,
  loggedInUser,
  loadActiveChallenges,
  onRemoveChallenge,
}) => {
  const [challenges, setChallenges] = useState<ChallengePosting[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const fetchChallenges = useCallback(() => {
    const fetchedChallenges = loadActiveChallenges();
    // Sort by date posted descending (most recent first)
    fetchedChallenges.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    setChallenges(fetchedChallenges);
  }, [loadActiveChallenges]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleAcceptChallenge = () => {
    if (selectedChallengeId) {
      const challenge = challenges.find((c) => c.id === selectedChallengeId);
      if (challenge) {
        onStartChallenge(challenge);
      }
    }
  };

  const handleRemoveClick = (challengeId: string) => {
    onRemoveChallenge(challengeId);
    setSelectedChallengeId(null); // Deselect if removed
    fetchChallenges(); // Re-fetch to update the list
  };

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-white border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        Active Challenges
      </h2>

      {challenges.length === 0 ? (
        <p className="text-center text-gray-300 text-xl">No active challenges posted yet!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200
                ${index % 2 === 0 ? 'bg-indigo-600/70' : 'bg-purple-700/70'}
                ${selectedChallengeId === challenge.id ? 'border-4 border-yellow-400 scale-105' : 'border-4 border-transparent hover:scale-102 hover:bg-indigo-600'}`}
              onClick={() => setSelectedChallengeId(challenge.id)}
              role="button"
              aria-pressed={selectedChallengeId === challenge.id}
              tabIndex={0}
            >
              <div className="text-left mb-2 sm:mb-0">
                <p className="font-semibold text-lg text-yellow-300">
                  <span className="text-white">Challenger:</span> {challenge.username} {challenge.username === loggedInUser && '(You)'}
                </p>
                <p className="text-md text-emerald-300">Score: {challenge.score} / {challenge.totalQuestions}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">
                  Posted: {new Date(challenge.datePosted).toLocaleString()}
                </p>
                {challenge.username === loggedInUser && (
                  <Button
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); handleRemoveClick(challenge.id); }}
                    className="text-xs px-3 py-1 mt-2"
                  >
                    Remove My Challenge
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center space-x-4">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4" variant="secondary">
          Back to Game
        </Button>
        <Button onClick={handleAcceptChallenge} disabled={!selectedChallengeId || (selectedChallengeId ? challenges.find(c => c.id === selectedChallengeId)?.username === loggedInUser : false)} className="text-xl px-8 py-4">
          Accept Challenge
        </Button>
      </div>
    </div>
  );
};

export default ActiveChallenges;