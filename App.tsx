// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode, GamePhase, MathQuestion, User, GameRecord } from './types';
import { generateMathQuestions } from './services/geminiService';
import Button from './components/Button';
import Timer from './components/Timer';
import ScoreDisplay from './components/ScoreDisplay';
import QuestionCard from './components/QuestionCard';
import AuthForm from './components/AuthForm';
import GameHistory from './components/GameHistory';
import Leaderboard from './components/Leaderboard';
import ChallengeSelect from './components/ChallengeSelect'; // New import for ChallengeSelect
import { GAME_DURATION_SECONDS, NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS } from './constants';

// --- Local Storage Utility Functions ---
const LOCAL_STORAGE_USERS_KEY = 'quickMathUsers';
const LOCAL_STORAGE_RECORDS_PREFIX = 'quickMathRecords_';

const loadUsers = (): Map<string, User> => {
  try {
    const usersJson = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return usersJson ? new Map(JSON.parse(usersJson)) : new Map();
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return new Map();
  }
};

const saveUsers = (users: Map<string, User>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(Array.from(users.entries())));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

const loadGameRecords = (username: string): GameRecord[] => {
  try {
    const recordsJson = localStorage.getItem(`${LOCAL_STORAGE_RECORDS_PREFIX}${username}`);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error(`Error loading game records for ${username} from localStorage:`, error);
    return [];
  }
};

const saveGameRecord = (username: string, record: GameRecord) => {
  try {
    const existingRecords = loadGameRecords(username);
    existingRecords.push(record);
    localStorage.setItem(`${LOCAL_STORAGE_RECORDS_PREFIX}${username}`, JSON.stringify(existingRecords));
  } catch (error) {
    console.error(`Error saving game record for ${username} to localStorage:`, error);
  }
};

// Function to load all game records for all users
const loadAllGameRecords = (users: Map<string, User>): GameRecord[] => {
  let allRecords: GameRecord[] = [];
  users.forEach((_user, username) => {
    allRecords = allRecords.concat(loadGameRecords(username));
  });
  return allRecords;
};
// --- End Local Storage Utility Functions ---

function App() {
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(ViewMode.LOGIN);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.IDLE); // Internal game state
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null); // null, true, false
  const [challengedRecord, setChallengedRecord] = useState<GameRecord | null>(null); // New state for challenge mode
  const timerRef = useRef<number | null>(null);

  // Initialize view mode based on logged in user
  useEffect(() => {
    if (!loggedInUser) {
      setCurrentViewMode(ViewMode.LOGIN);
    }
  }, [loggedInUser]);

  // Timer logic
  useEffect(() => {
    if (currentViewMode === ViewMode.GAME && gamePhase === GamePhase.PLAYING) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setGamePhase(GamePhase.FINISHED);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }

    // Cleanup on component unmount
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentViewMode, gamePhase]);

  const fetchQuestions = useCallback(async () => {
    if (!loggedInUser) {
      setCurrentViewMode(ViewMode.LOGIN); // Ensure user is logged in
      return;
    }
    setGamePhase(GamePhase.LOADING_QUESTIONS);
    try {
      const fetchedQuestions = await generateMathQuestions(NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS);
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setGamePhase(GamePhase.PLAYING);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(GAME_DURATION_SECONDS);
        setLastAnswerCorrect(null);
      } else {
        console.error('No questions fetched.');
        setGamePhase(GamePhase.IDLE); // Revert to IDLE if no questions
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setGamePhase(GamePhase.IDLE); // Revert to IDLE on error
    }
  }, [loggedInUser]);

  const handleAnswer = (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // Move to the next question or end the game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setGamePhase(GamePhase.FINISHED);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    // When game finishes, save the record
    if (gamePhase === GamePhase.FINISHED && loggedInUser && questions.length > 0) {
      const newRecord: GameRecord = {
        id: crypto.randomUUID(), // Unique ID for each record
        username: loggedInUser,
        score: score,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
      };
      saveGameRecord(loggedInUser, newRecord);
    }
  }, [gamePhase, loggedInUser, score, questions.length]);

  const handleLogin = (username: string) => {
    setLoggedInUser(username);
    setCurrentViewMode(ViewMode.GAME);
    setGamePhase(GamePhase.IDLE); // Reset game state
  };

  const handleRegister = (username: string) => {
    setLoggedInUser(username);
    setCurrentViewMode(ViewMode.GAME);
    setGamePhase(GamePhase.IDLE); // Reset game state
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentViewMode(ViewMode.LOGIN);
    setGamePhase(GamePhase.IDLE); // Clear game state
    setChallengedRecord(null); // Clear any active challenge
  };

  const startChallengeGame = (record: GameRecord) => {
    setChallengedRecord(record);
    fetchQuestions(); // This will set gamePhase to PLAYING
    setCurrentViewMode(ViewMode.GAME);
  };

  const renderContent = () => {
    switch (currentViewMode) {
      case ViewMode.LOGIN:
      case ViewMode.REGISTER:
        return (
          <AuthForm
            viewMode={currentViewMode}
            onSwitchView={(mode) => setCurrentViewMode(mode)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            loadUsers={loadUsers}
            saveUsers={saveUsers}
          />
        );
      case ViewMode.HISTORY:
        return (
          <GameHistory
            username={loggedInUser!}
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
            }}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.LEADERBOARD:
        return (
          <Leaderboard
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
            }}
            loadUsers={loadUsers}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.CHALLENGE_SELECT: // New case for Challenge Selection
        return (
          <ChallengeSelect
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
            }}
            onStartChallenge={startChallengeGame}
            loadUsers={loadUsers}
            loadAllGameRecords={loadAllGameRecords}
            currentUser={loggedInUser}
          />
        );
      case ViewMode.GAME:
        return (
          <>
            <div className="flex justify-between w-full max-w-lg mb-8 items-center px-4">
              <h2 className="text-xl font-bold text-gray-200">Hello, {loggedInUser}!</h2>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.HISTORY)} className="text-sm px-4 py-2">
                  History
                </Button>
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.LEADERBOARD)} className="text-sm px-4 py-2">
                  Leaderboard
                </Button>
                <Button variant="danger" onClick={handleLogout} className="text-sm px-4 py-2">
                  Logout
                </Button>
              </div>
            </div>

            {gamePhase === GamePhase.IDLE && (
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 drop-shadow-lg">Quick Math Challenge</h1>
                <p className="text-xl text-gray-200 mb-12 max-w-md mx-auto">Test your mental math skills against the clock!</p>
                {challengedRecord && (
                  <div className="bg-blue-600/50 p-4 rounded-lg mb-8 max-w-sm mx-auto animate-pulse">
                    <p className="text-lg font-semibold text-blue-200">Challenging: <span className="text-yellow-200">{challengedRecord.username}</span></p>
                    <p className="text-md text-blue-200">Target Score: <span className="text-yellow-200">{challengedRecord.score}</span> / {challengedRecord.totalQuestions}</p>
                  </div>
                )}
                <div className="space-x-4">
                  <Button onClick={fetchQuestions} className="text-2xl px-10 py-5">
                    {challengedRecord ? 'Re-Challenge' : 'Start Game'}
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.CHALLENGE_SELECT)} className="text-2xl px-10 py-5">
                    Challenge Mode
                  </Button>
                </div>
              </div>
            )}

            {gamePhase === GamePhase.LOADING_QUESTIONS && (
              <div className="text-center text-white text-3xl font-semibold animate-pulse">
                Loading questions...
              </div>
            )}

            {gamePhase === GamePhase.PLAYING && (
              <>
                <div className="flex justify-between w-full max-w-lg mb-8">
                  <ScoreDisplay score={score} challengedScore={challengedRecord?.score} />
                  <Timer timeLeft={timeLeft} />
                </div>
                {questions[currentQuestionIndex] && (
                  <QuestionCard
                    question={questions[currentQuestionIndex]}
                    onAnswer={handleAnswer}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    lastAnswerCorrect={lastAnswerCorrect}
                    isLastQuestion={currentQuestionIndex === questions.length - 1}
                  />
                )}
              </>
            )}

            {gamePhase === GamePhase.FINISHED && (
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 drop-shadow-lg">Game Over!</h1>
                <p className="text-4xl font-bold text-emerald-300 mb-8">Your Final Score: {score} / {questions.length}</p>
                {challengedRecord && (
                  <div className="bg-blue-600/50 p-4 rounded-lg mb-8 max-w-md mx-auto">
                    <p className="text-2xl font-semibold text-blue-200">
                      Challenged <span className="text-yellow-200">{challengedRecord.username}</span> (Target: {challengedRecord.score})
                    </p>
                    {score > challengedRecord.score ? (
                      <p className="text-3xl font-bold text-emerald-400 mt-2">CHALLENGE WON!</p>
                    ) : score === challengedRecord.score ? (
                      <p className="text-3xl font-bold text-blue-400 mt-2">IT'S A TIE!</p>
                    ) : (
                      <p className="text-3xl font-bold text-red-400 mt-2">CHALLENGE LOST!</p>
                    )}
                  </div>
                )}
                <div className="space-x-4">
                  <Button onClick={fetchQuestions} className="text-2xl px-10 py-5">
                    Play Again
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.HISTORY)} className="text-2xl px-10 py-5">
                    View History
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.LEADERBOARD)} className="text-2xl px-10 py-5">
                    Leaderboard
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.CHALLENGE_SELECT)} className="text-2xl px-10 py-5">
                    New Challenge
                  </Button>
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-4 min-h-screen">
      {renderContent()}
    </div>
  );
}

export default App;