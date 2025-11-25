// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode, GamePhase, Question, User, GameRecord, ChallengePosting } from './types';
import { generateGameQuestions } from './services/geminiService';
import Button from './components/Button';
import Timer from './components/Timer';
import ScoreDisplay from './components/ScoreDisplay';
import QuestionCard from './components/QuestionCard';
import AuthForm from './components/AuthForm';
import GameHistory from './components/GameHistory';
import Leaderboard from './components/Leaderboard';
import ActiveChallenges from './components/ActiveChallenges';
import Statistics from './components/Statistics';
import ProfileForm from './components/ProfileForm';
import Navbar from './components/Navbar';
import { GAME_DURATION_SECONDS, NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS } from './constants';

// --- Local Storage Utility Functions ---
const LOCAL_STORAGE_USERS_KEY = 'quickMathUsers';
const LOCAL_STORAGE_RECORDS_PREFIX = 'quickMathRecords_';
const LOCAL_STORAGE_ACTIVE_CHALLENGES_KEY = 'quickMathActiveChallenges';

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

const loadActiveChallenges = (): ChallengePosting[] => {
  try {
    const challengesJson = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CHALLENGES_KEY);
    return challengesJson ? JSON.parse(challengesJson) : [];
  } catch (error) {
    console.error('Error loading active challenges from localStorage:', error);
    return [];
  }
};

const saveActiveChallenges = (challenges: ChallengePosting[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_CHALLENGES_KEY, JSON.stringify(challenges));
  } catch (error) {
    console.error('Error saving active challenges to localStorage:', error);
  }
};
// --- End Local Storage Utility Functions ---

function App() {
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(ViewMode.LOGIN);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.IDLE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [challengedRecord, setChallengedRecord] = useState<GameRecord | null>(null);
  const [challengePostedMessage, setChallengePostedMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loggedInUser) {
      setCurrentViewMode(ViewMode.LOGIN);
    }
  }, [loggedInUser]);

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
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentViewMode, gamePhase]);

  const fetchQuestions = useCallback(async () => {
    if (!loggedInUser) {
      setCurrentViewMode(ViewMode.LOGIN);
      return;
    }
    setGamePhase(GamePhase.LOADING_QUESTIONS);
    setChallengePostedMessage(null);
    try {
      const fetchedQuestions = await generateGameQuestions(NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS);
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setGamePhase(GamePhase.PLAYING);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(GAME_DURATION_SECONDS);
        setLastAnswerCorrect(null);
      } else {
        console.error('No questions fetched.');
        setGamePhase(GamePhase.IDLE);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setGamePhase(GamePhase.IDLE);
    }
  }, [loggedInUser]);

  const handleAnswer = (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
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
    if (gamePhase === GamePhase.FINISHED && loggedInUser && questions.length > 0) {
      const newRecord: GameRecord = {
        id: crypto.randomUUID(),
        username: loggedInUser.username,
        score: score,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
      };
      saveGameRecord(loggedInUser.username, newRecord);
      setChallengedRecord(null);
    }
  }, [gamePhase, loggedInUser, score, questions.length]);

  const handleLogin = (username: string) => {
    const users = loadUsers();
    const user = users.get(username);
    if (user) {
      setLoggedInUser(user);
      setCurrentViewMode(ViewMode.GAME);
      setGamePhase(GamePhase.IDLE);
    }
  };

  const handleRegister = (username: string) => {
    const users = loadUsers();
    const user = users.get(username);
    if (user) {
      setLoggedInUser(user);
    } else {
        setLoggedInUser({ username, passwordHash: '' }); 
    }
    setCurrentViewMode(ViewMode.GAME);
    setGamePhase(GamePhase.IDLE);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentViewMode(ViewMode.LOGIN);
    setGamePhase(GamePhase.IDLE);
    setChallengedRecord(null);
    setChallengePostedMessage(null);
  };

  const startChallengeGame = (challenge: ChallengePosting) => {
    const targetRecord: GameRecord = {
      id: challenge.originalRecordId,
      username: challenge.username,
      score: challenge.score,
      totalQuestions: challenge.totalQuestions,
      date: challenge.datePosted,
    };
    setChallengedRecord(targetRecord);
    fetchQuestions();
    setCurrentViewMode(ViewMode.GAME);
  };

  const handlePostChallenge = () => {
    if (loggedInUser && gamePhase === GamePhase.FINISHED && questions.length > 0) {
      const currentRecords = loadGameRecords(loggedInUser.username);
      const lastGameRecord = currentRecords[currentRecords.length - 1];

      if (lastGameRecord) {
        const newChallenge: ChallengePosting = {
          id: crypto.randomUUID(),
          originalRecordId: lastGameRecord.id,
          username: loggedInUser.username,
          score: lastGameRecord.score,
          totalQuestions: lastGameRecord.totalQuestions,
          datePosted: new Date().toISOString(),
        };
        const existingChallenges = loadActiveChallenges();
        saveActiveChallenges([...existingChallenges, newChallenge]);
        setChallengePostedMessage('Your score has been posted as a challenge!');
      }
    }
  };

  const handleRemoveChallenge = (challengeId: string) => {
    const existingChallenges = loadActiveChallenges();
    const updatedChallenges = existingChallenges.filter(c => c.id !== challengeId);
    saveActiveChallenges(updatedChallenges);
  };

  const handleUpdateProfile = (updateData: Partial<User & { newPassword?: string }>) => {
    if (!loggedInUser) return;
    const users = loadUsers();
    const user = users.get(loggedInUser.username);
    if (user) {
      if (updateData.displayName !== undefined) user.displayName = updateData.displayName;
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.profilePictureBase64 !== undefined) user.profilePictureBase64 = updateData.profilePictureBase64;
      if (updateData.newPassword !== undefined) user.passwordHash = updateData.newPassword;

      users.set(loggedInUser.username, user);
      saveUsers(users);
      setLoggedInUser({ ...user }); 
    }
  };

  const handleNavbarNavigate = (view: ViewMode) => {
    // If going back to the main game screen, reset IDLE state to avoid confusing states
    if (view === ViewMode.GAME) {
        setGamePhase(GamePhase.IDLE);
        setChallengedRecord(null);
        setChallengePostedMessage(null);
    }
    setCurrentViewMode(view);
  };

  const renderContent = () => {
    // Auth screens don't get the navbar (handled in main return)
    if (currentViewMode === ViewMode.LOGIN || currentViewMode === ViewMode.REGISTER) {
        return (
            <div className="flex-grow flex items-center justify-center w-full">
              <AuthForm
                  viewMode={currentViewMode}
                  onSwitchView={(mode) => setCurrentViewMode(mode)}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  loadUsers={loadUsers}
                  saveUsers={saveUsers}
              />
            </div>
        );
    }

    // Main App Content
    switch (currentViewMode) {
      case ViewMode.HISTORY:
        return (
          <GameHistory
            username={loggedInUser!.username}
            onBackToGame={() => handleNavbarNavigate(ViewMode.GAME)}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.LEADERBOARD:
        return (
          <Leaderboard
            onBackToGame={() => handleNavbarNavigate(ViewMode.GAME)}
            loadUsers={loadUsers}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.ACTIVE_CHALLENGES:
        return (
          <ActiveChallenges
            onBackToGame={() => handleNavbarNavigate(ViewMode.GAME)}
            onStartChallenge={startChallengeGame}
            loggedInUser={loggedInUser ? loggedInUser.username : null}
            loadActiveChallenges={loadActiveChallenges}
            onRemoveChallenge={handleRemoveChallenge}
          />
        );
      case ViewMode.STATISTICS:
        return (
          <Statistics
            username={loggedInUser!.username}
            onBackToGame={() => handleNavbarNavigate(ViewMode.GAME)}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.PROFILE:
        return (
          <ProfileForm
            currentUser={loggedInUser!}
            onBackToGame={() => handleNavbarNavigate(ViewMode.GAME)}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case ViewMode.GAME:
        return (
          <div className="w-full flex flex-col items-center justify-center p-4">
            {gamePhase === GamePhase.IDLE && (
              <div className="text-center w-full max-w-3xl animate-fade-in">
                <h1 className="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-xl tracking-tight">Quick Math<br/>Challenge</h1>
                <p className="text-2xl text-indigo-900 font-medium mb-12 max-w-lg mx-auto leading-relaxed bg-white/40 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                    Test your mental math skills against the clock! 🧠✨
                </p>
                {challengedRecord && (
                  <div className="bg-sky-100 p-6 rounded-2xl mb-8 max-w-sm mx-auto animate-pulse border-4 border-sky-200 shadow-lg">
                    <p className="text-lg font-bold text-sky-800">Challenging: <span className="text-rose-500">{challengedRecord.username}</span></p>
                    <p className="text-md text-sky-700">Target Score: <span className="text-rose-500 font-black">{challengedRecord.score}</span></p>
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button onClick={fetchQuestions} className="text-2xl px-12 py-6 rounded-3xl shadow-xl hover:scale-105 transform transition-transform">
                    {challengedRecord ? 'Start Challenge!' : 'Start Game! 🚀'}
                  </Button>
                </div>
              </div>
            )}

            {gamePhase === GamePhase.LOADING_QUESTIONS && (
              <div className="text-center bg-white/50 backdrop-blur-md p-12 rounded-3xl shadow-xl">
                <div className="text-6xl mb-4 animate-bounce">🎲</div>
                <div className="text-indigo-900 text-3xl font-bold animate-pulse">
                  Generating Fun...
                </div>
              </div>
            )}

            {gamePhase === GamePhase.PLAYING && (
              <>
                <div className="flex justify-between w-full max-w-lg mb-8 items-end px-4">
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
              <div className="text-center bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border-4 border-white w-full max-w-2xl mx-auto animate-pop-in">
                <h1 className="text-5xl md:text-7xl font-black text-indigo-900 mb-8">Game Over!</h1>
                <p className="text-5xl font-black text-emerald-500 mb-8 bg-emerald-50 inline-block px-8 py-4 rounded-2xl">
                    Score: {score} <span className="text-2xl text-gray-400 font-bold">/ {questions.length}</span>
                </p>
                
                {challengedRecord && (
                  <div className="bg-sky-50 p-6 rounded-2xl mb-8 max-w-md mx-auto border-2 border-sky-100">
                    <p className="text-xl font-bold text-gray-600">
                      Vs <span className="text-sky-600">{challengedRecord.username}</span> (Target: {challengedRecord.score})
                    </p>
                    {score > challengedRecord.score ? (
                      <p className="text-3xl font-black text-emerald-500 mt-2">🎉 CHALLENGE WON! 🎉</p>
                    ) : score === challengedRecord.score ? (
                      <p className="text-3xl font-black text-blue-500 mt-2">🤝 IT'S A TIE! 🤝</p>
                    ) : (
                      <p className="text-3xl font-black text-rose-500 mt-2">💪 TRY AGAIN! 💪</p>
                    )}
                  </div>
                )}
                
                {challengePostedMessage && (
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 font-bold animate-bounce">
                      {challengePostedMessage}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4 mt-8">
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <Button onClick={fetchQuestions} className="text-xl px-10 py-5 w-full md:w-auto">
                        Play Again 🔄
                      </Button>
                      <Button variant="secondary" onClick={handlePostChallenge} className="text-xl px-10 py-5 w-full md:w-auto" disabled={!!challengePostedMessage}>
                        Post Challenge 📢
                      </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
       {loggedInUser && currentViewMode !== ViewMode.LOGIN && currentViewMode !== ViewMode.REGISTER && (
          <Navbar 
             user={loggedInUser} 
             currentView={currentViewMode} 
             onNavigate={handleNavbarNavigate} 
             onLogout={handleLogout} 
          />
       )}
       {renderContent()}
    </div>
  );
}

export default App;