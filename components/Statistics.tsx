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
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-3xl mx-auto border-4 border-white">
      <h2 className="text-3xl font-extrabold mb-8 text-indigo-900 text-center">
        {username}'s Statistics
      </h2>

      {stats.totalGames === 0 ? (
        <p className="text-center text-gray-500 text-xl py-8">Play some games to see your stats!</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
            <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
              <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Total Games</p>
              <p className="text-indigo-600 text-4xl font-black mt-2">{stats.totalGames}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
              <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Highest Score</p>
              <p className="text-purple-600 text-4xl font-black mt-2">{stats.highestScore}</p>
            </div>
            <div className="bg-sky-50 p-6 rounded-2xl shadow-sm border border-sky-100">
              <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Avg. Score</p>
              <p className="text-sky-600 text-4xl font-black mt-2">{stats.averageScore}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
              <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Accuracy</p>
              <p className="text-emerald-500 text-4xl font-black mt-2">{(stats.averageCorrectPerQuestion * 100).toFixed(0)}%</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Recent Performance</h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {chartData.length === 0 ? (
              <p className="text-center text-gray-400">No recent games for chart.</p>
            ) : (
              <div className="flex justify-around items-end h-48 py-2 relative">
                {/* Y-axis guide lines */}
                <div className="absolute left-0 top-0 right-0 h-full border-l border-b border-gray-200"></div>
                <div className="absolute left-0 top-1/2 right-0 border-t border-dashed border-gray-300"></div>

                {chartData.map((data, index) => {
                  const barHeight = (data.score / maxScoreInChart) * 100; // Height as percentage of container
                  return (
                    <div key={index} className="flex flex-col items-center mx-1 group relative w-full max-w-[40px]">
                      <div className="absolute -top-8 text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white px-2 py-1 rounded shadow-sm">
                        {data.score}
                      </div>
                      <div
                        className="w-full rounded-t-lg bg-sky-400 hover:bg-sky-500 transition-all duration-300 relative"
                        style={{ height: `${barHeight}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4" variant="secondary">
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default Statistics;