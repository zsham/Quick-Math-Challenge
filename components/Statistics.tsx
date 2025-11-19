// components/Statistics.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { GameRecord } from '../types';
import Button from './Button';

interface StatisticsProps {
  username: string;
  onBackToGame: () => void;
  loadGameRecords: (username: string) => GameRecord[];
}

const Statistics: React.FC<StatisticsProps> = ({ username, onBackToGame, loadGameRecords }) => {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    highestScore: 0,
    averageScore: 0,
    averageCorrectPerQuestion: 0,
  });
  const [chartData, setChartData] = useState<{ score: number; date: string }[]>([]);

  const calculateStatistics = useCallback(() => {
    const fetchedRecords = loadGameRecords(username);
    // Sort by date ascending for consistent chart order (oldest first for chart)
    const sortedRecords = [...fetchedRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setRecords(sortedRecords);

    if (sortedRecords.length === 0) {
      setStats({
        totalGames: 0,
        highestScore: 0,
        averageScore: 0,
        averageCorrectPerQuestion: 0,
      });
      setChartData([]);
      return;
    }

    const totalGames = sortedRecords.length;
    const highestScore = Math.max(...sortedRecords.map((r) => r.score));
    const totalScoreSum = sortedRecords.reduce((sum, r) => sum + r.score, 0);
    const averageScore = parseFloat((totalScoreSum / totalGames).toFixed(2));

    const totalQuestionsAnswered = sortedRecords.reduce((sum, r) => sum + r.totalQuestions, 0);
    const averageCorrectPerQuestion = totalQuestionsAnswered > 0 ? parseFloat((totalScoreSum / totalQuestionsAnswered).toFixed(2)) : 0;


    setStats({
      totalGames,
      highestScore,
      averageScore,
      averageCorrectPerQuestion,
    });

    // Prepare chart data for the last 10 games
    const gamesForChart = sortedRecords.slice(-10); // Get last 10 games
    setChartData(gamesForChart.map(r => ({
      score: r.score,
      date: new Date(r.date).toLocaleDateString(),
    })));
  }, [username, loadGameRecords]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  // Calculate max score in chart data for scaling
  const maxScoreInChart = Math.max(1, ...chartData.map(d => d.score)); // Ensure it's at least 1 to avoid division by zero

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto text-white border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-8 drop-shadow-lg text-center">
        {username}'s Statistics
      </h2>

      {stats.totalGames === 0 ? (
        <p className="text-center text-gray-300 text-xl">Play some games to see your stats!</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
            <div className="bg-indigo-600/70 p-4 rounded-lg shadow-md">
              <p className="text-gray-300 text-lg">Total Games Played</p>
              <p className="text-emerald-300 text-3xl font-bold">{stats.totalGames}</p>
            </div>
            <div className="bg-purple-700/70 p-4 rounded-lg shadow-md">
              <p className="text-gray-300 text-lg">Highest Score</p>
              <p className="text-yellow-300 text-3xl font-bold">{stats.highestScore}</p>
            </div>
            <div className="bg-purple-700/70 p-4 rounded-lg shadow-md">
              <p className="text-gray-300 text-lg">Average Score</p>
              <p className="text-blue-300 text-3xl font-bold">{stats.averageScore}</p>
            </div>
            <div className="bg-indigo-600/70 p-4 rounded-lg shadow-md">
              <p className="text-gray-300 text-lg">Avg. Correct %</p>
              <p className="text-pink-300 text-3xl font-bold">{(stats.averageCorrectPerQuestion * 100).toFixed(1)}%</p>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-6 drop-shadow-lg text-center">Last {chartData.length} Games</h3>
          <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
            {chartData.length === 0 ? (
              <p className="text-center text-gray-400">No recent games for chart.</p>
            ) : (
              <div className="flex justify-around items-end h-48 py-2 relative">
                {/* Y-axis guide lines */}
                <div className="absolute left-0 top-0 right-0 h-full border-l border-b border-gray-600"></div>
                <div className="absolute left-0 top-1/2 right-0 border-t border-dashed border-gray-700"></div>

                {chartData.map((data, index) => {
                  const barHeight = (data.score / maxScoreInChart) * 100; // Height as percentage of container
                  return (
                    <div key={index} className="flex flex-col items-center mx-1 group relative">
                      <div className="absolute -top-6 text-xs text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {data.score}
                      </div>
                      <div
                        className="w-8 rounded-t-sm bg-emerald-500 hover:bg-emerald-400 transition-all duration-300 relative"
                        style={{ height: `${barHeight}%` }}
                      ></div>
                      <div className="text-xs mt-1 text-gray-400 w-16 text-center overflow-hidden whitespace-nowrap text-ellipsis">
                        {data.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4">
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default Statistics;