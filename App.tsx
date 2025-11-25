// App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode, GamePhase, Question, User, GameRecord, ChallengePosting } from './types'; // Updated import to use 'Question'
import { generateGameQuestions } from './services/geminiService'; // Renamed import
import Button from './components/Button';
import Timer from './components/Timer';
import ScoreDisplay from './components/ScoreDisplay';
import QuestionCard from './components/QuestionCard';
import AuthForm from './components/AuthForm';
import GameHistory from './components/GameHistory';
import Leaderboard from './components/Leaderboard';
import ActiveChallenges from './components/ActiveChallenges';
import Statistics from './components/Statistics';
import ProfileForm from './components/ProfileForm'; // New import for ProfileForm
import { GAME_DURATION_SECONDS, NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS } from './constants';

// --- Local Storage Utility Functions ---
const LOCAL_STORAGE_USERS_KEY = 'quickMathUsers';
const LOCAL_STORAGE_RECORDS_PREFIX = 'quickMathRecords_';
const LOCAL_STORAGE_ACTIVE_CHALLENGES_KEY = 'quickMathActiveChallenges'; // New key for active challenges

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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null); // Changed to User object
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.IDLE); // Internal game state
  const [questions, setQuestions] = useState<Question[]>([]); // Updated type to 'Question'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null); // null, true, false
  const [challengedRecord, setChallengedRecord] = useState<GameRecord | null>(null); // State for active challenge game
  const [challengePostedMessage, setChallengePostedMessage] = useState<string | null>(null); // Feedback for posting challenge
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
    setChallengePostedMessage(null); // Clear challenge message when starting a new game
    try {
      const fetchedQuestions = await generateGameQuestions(NUMBER_OF_QUESTIONS, MAX_NUMBER_FOR_QUESTIONS); // Changed function call
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
        username: loggedInUser.username,
        score: score,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
      };
      saveGameRecord(loggedInUser.username, newRecord);
      setChallengedRecord(null); // Clear challenged record after game completion
    }
  }, [gamePhase, loggedInUser, score, questions.length]);

  const handleLogin = (username: string) => {
    const users = loadUsers();
    const user = users.get(username);
    if (user) {
      setLoggedInUser(user); // Set full User object
      setCurrentViewMode(ViewMode.GAME);
      setGamePhase(GamePhase.IDLE);
    }
  };

  const handleRegister = (username: string) => {
    // Re-load user to get full object (though logic in AuthForm handles creation)
    const users = loadUsers();
    const user = users.get(username);
    if (user) {
      setLoggedInUser(user);
    } else {
        // Fallback if not found immediately (shouldn't happen with sync code)
        setLoggedInUser({ username, passwordHash: '' }); 
    }
    setCurrentViewMode(ViewMode.GAME);
    setGamePhase(GamePhase.IDLE);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentViewMode(ViewMode.LOGIN);
    setGamePhase(GamePhase.IDLE); // Clear game state
    setChallengedRecord(null); // Clear any active challenge
    setChallengePostedMessage(null); // Clear any challenge posted message
  };

  const startChallengeGame = (challenge: ChallengePosting) => {
    // Convert ChallengePosting to a GameRecord-like object for challengedRecord state
    const targetRecord: GameRecord = {
      id: challenge.originalRecordId,
      username: challenge.username,
      score: challenge.score,
      totalQuestions: challenge.totalQuestions,
      date: challenge.datePosted, // Using datePosted as a placeholder for date
    };
    setChallengedRecord(targetRecord);
    fetchQuestions(); // This will set gamePhase to PLAYING
    setCurrentViewMode(ViewMode.GAME);
  };

  const handlePostChallenge = () => {
    if (loggedInUser && gamePhase === GamePhase.FINISHED && questions.length > 0) {
      const currentRecords = loadGameRecords(loggedInUser.username);
      const lastGameRecord = currentRecords[currentRecords.length - 1]; // Get the just-finished game record

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
      // Update fields if present
      if (updateData.displayName !== undefined) user.displayName = updateData.displayName;
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.profilePictureBase64 !== undefined) user.profilePictureBase64 = updateData.profilePictureBase64;
      if (updateData.newPassword !== undefined) user.passwordHash = updateData.newPassword;

      users.set(loggedInUser.username, user);
      saveUsers(users);
      
      // Update local state immediately so UI reflects changes
      setLoggedInUser({ ...user }); 
    }
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
            username={loggedInUser!.username}
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
              setChallengePostedMessage(null);
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
              setChallengePostedMessage(null);
            }}
            loadUsers={loadUsers}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.ACTIVE_CHALLENGES:
        return (
          <ActiveChallenges
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
              setChallengePostedMessage(null);
            }}
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
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
              setChallengePostedMessage(null);
            }}
            loadGameRecords={loadGameRecords}
          />
        );
      case ViewMode.PROFILE: // New case for ProfileForm
        return (
          <ProfileForm
            currentUser={loggedInUser!}
            onBackToGame={() => {
              setCurrentViewMode(ViewMode.GAME);
              setGamePhase(GamePhase.IDLE);
              setChallengedRecord(null); // Clear challenge when going back to game idle
              setChallengePostedMessage(null);
            }}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case ViewMode.GAME:
        return (
          <>
            <div className="flex justify-between w-full max-w-4xl mb-8 items-center px-6 py-4 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center gap-3">
                 {loggedInUser?.profilePictureBase64 ? (
                     <img src={loggedInUser.profilePictureBase64} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                        {loggedInUser?.displayName?.charAt(0).toUpperCase() || loggedInUser?.username.charAt(0).toUpperCase()}
                    </div>
                 )}
                 <h2 className="text-xl font-bold text-indigo-900">
                     Hi, {loggedInUser?.displayName || loggedInUser?.username}!
                 </h2>
              </div>
              
              <div className="flex space-x-2 flex-wrap justify-end gap-y-2">
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.HISTORY)} className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg">
                  History
                </Button>
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.LEADERBOARD)} className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg">
                  Leaderboard
                </Button>
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.STATISTICS)} className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg">
                  Stats
                </Button>
                <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.PROFILE)} className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg">
                  Profile
                </Button>
                <Button variant="danger" onClick={handleLogout} className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg">
                  Logout
                </Button>
              </div>
            </div>

            {gamePhase === GamePhase.IDLE && (
              <div className="text-center w-full max-w-3xl">
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
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.ACTIVE_CHALLENGES)} className="text-xl px-10 py-6 rounded-3xl">
                    Active Challenges
                  </Button>
                </div>
              </div>
            )}

            {gamePhase === GamePhase.LOADING_QUESTIONS && (
              <div className="text-center bg-white/50 backdrop-blur-md p-12 rounded-3xl shadow-xl">
                <div className="text-6xl mb-4">🎲</div>
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
              <div className="text-center bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border-4 border-white w-full max-w-2xl mx-auto">
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
                  <Button variant="secondary" onClick={() => setCurrentViewMode(ViewMode.ACTIVE_CHALLENGES)} className="text-lg px-8 py-4 bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-none border-2 border-purple-200">
                    See Other Challenges
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