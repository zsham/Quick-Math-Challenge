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
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border-4 border-white">
      <h2 className="text-4xl font-extrabold mb-8 text-indigo-900 text-center">
        Active Challenges
      </h2>

      {challenges.length === 0 ? (
        <p className="text-center text-gray-500 text-xl py-8">No active challenges posted yet!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`flex flex-col sm:flex-row justify-between items-center p-5 rounded-2xl shadow-sm border-2 cursor-pointer transition-all duration-200
                ${selectedChallengeId === challenge.id 
                    ? 'bg-indigo-50 border-indigo-400 scale-[1.02]' 
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              onClick={() => setSelectedChallengeId(challenge.id)}
              role="button"
              aria-pressed={selectedChallengeId === challenge.id}
              tabIndex={0}
            >
              <div className="text-left mb-2 sm:mb-0">
                <p className="font-bold text-lg text-indigo-900">
                  <span className="text-gray-500 font-normal">Challenger:</span> {challenge.username} {challenge.username === loggedInUser && '(You)'}
                </p>
                <p className="text-md text-sky-600 font-bold">Target Score: {challenge.score} / {challenge.totalQuestions}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(challenge.datePosted).toLocaleDateString()}
                </p>
                {challenge.username === loggedInUser && (
                  <Button
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); handleRemoveClick(challenge.id); }}
                    className="text-xs px-3 py-1 rounded-lg"
                  >
                    Remove
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