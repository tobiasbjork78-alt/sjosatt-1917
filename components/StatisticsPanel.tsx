'use client';

import { useState, useEffect } from 'react';
import { UserProgress } from '@/types/achievements';
import { DatabaseSession, SupabaseService } from '@/lib/supabase';

interface StatisticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  currentUser?: string;
}

export default function StatisticsPanel({ isOpen, onClose, userProgress, currentUser }: StatisticsPanelProps) {
  const [sessions, setSessions] = useState<DatabaseSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  // Load sessions from Supabase
  useEffect(() => {
    if (isOpen && currentUser) {
      setLoading(true);
      SupabaseService.getUserStats(currentUser).then(({ sessions: userSessions }) => {
        setSessions(userSessions || []);
        setLoading(false);
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Filter sessions by timeframe
  const getFilteredSessions = () => {
    const now = new Date();
    const cutoff = new Date();

    if (timeframe === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      cutoff.setDate(now.getDate() - 30);
    } else {
      return sessions; // all
    }

    return sessions.filter(session => new Date(session.created_at) >= cutoff);
  };

  const filteredSessions = getFilteredSessions();

  // Calculate statistics
  const calculateStats = () => {
    if (filteredSessions.length === 0) {
      return {
        avgWpm: 0,
        avgAccuracy: 0,
        totalTime: 0,
        totalSessions: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalWords: 0,
        improvement: { wpm: 0, accuracy: 0 },
      };
    }

    const avgWpm = filteredSessions.reduce((sum, s) => sum + s.wpm, 0) / filteredSessions.length;
    const avgAccuracy = filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) / filteredSessions.length;
    const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalWords = Math.round(filteredSessions.reduce((sum, s) => sum + (s.text_length / 5), 0));
    const bestWpm = Math.max(...filteredSessions.map(s => s.wpm));
    const bestAccuracy = Math.max(...filteredSessions.map(s => s.accuracy));

    // Calculate improvement (first vs last 3 sessions)
    const sortedSessions = [...filteredSessions].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let improvement = { wpm: 0, accuracy: 0 };
    if (sortedSessions.length >= 6) {
      const firstThree = sortedSessions.slice(0, 3);
      const lastThree = sortedSessions.slice(-3);

      const firstAvgWpm = firstThree.reduce((sum, s) => sum + s.wpm, 0) / 3;
      const lastAvgWpm = lastThree.reduce((sum, s) => sum + s.wpm, 0) / 3;
      const firstAvgAccuracy = firstThree.reduce((sum, s) => sum + s.accuracy, 0) / 3;
      const lastAvgAccuracy = lastThree.reduce((sum, s) => sum + s.accuracy, 0) / 3;

      improvement = {
        wpm: lastAvgWpm - firstAvgWpm,
        accuracy: lastAvgAccuracy - firstAvgAccuracy,
      };
    }

    return {
      avgWpm: Math.round(avgWpm),
      avgAccuracy: Math.round(avgAccuracy),
      totalTime,
      totalSessions: filteredSessions.length,
      bestWpm: Math.round(bestWpm),
      bestAccuracy: Math.round(bestAccuracy),
      totalWords,
      improvement,
    };
  };

  const stats = calculateStats();

  // Format time duration
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Get progress chart data (last 10 sessions)
  const getChartData = () => {
    return filteredSessions
      .slice(-10)
      .map((session, index) => ({
        session: index + 1,
        wpm: session.wpm,
        accuracy: session.accuracy,
        date: new Date(session.created_at).toLocaleDateString('sv-SE'),
      }));
  };

  const chartData = getChartData();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">📊 Statistik</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'week', label: 'Senaste veckan' },
              { key: 'month', label: 'Senaste månaden' },
              { key: 'all', label: 'Alla sessioner' },
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setTimeframe(period.key as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  timeframe === period.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-300">Laddar statistik...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-black/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.avgWpm}</div>
                  <div className="text-sm text-gray-300">Snitt WPM</div>
                  {stats.improvement.wpm !== 0 && (
                    <div className={`text-xs ${stats.improvement.wpm > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.improvement.wpm > 0 ? '+' : ''}{Math.round(stats.improvement.wpm)} förbättring
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.avgAccuracy}%</div>
                  <div className="text-sm text-gray-300">Snitt noggrannhet</div>
                  {stats.improvement.accuracy !== 0 && (
                    <div className={`text-xs ${stats.improvement.accuracy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.improvement.accuracy > 0 ? '+' : ''}{Math.round(stats.improvement.accuracy)}% förbättring
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalSessions}</div>
                  <div className="text-sm text-gray-300">Sessioner</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{formatDuration(stats.totalTime)}</div>
                  <div className="text-sm text-gray-300">Träningstid</div>
                </div>
              </div>

              {/* Personal records */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">🏆 Personliga rekord</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Högsta WPM:</span>
                    <span className="text-green-400 font-bold">{userProgress.highestWpm} WPM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Högsta noggrannhet:</span>
                    <span className="text-blue-400 font-bold">{userProgress.highestAccuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Längsta streak:</span>
                    <span className="text-purple-400 font-bold">{userProgress.longestStreak} dagar</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total ord skrivna:</span>
                    <span className="text-orange-400 font-bold">{userProgress.totalWordsTyped}</span>
                  </div>
                </div>
              </div>

              {/* Recent sessions chart */}
              {chartData.length > 0 && (
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">📈 Senaste sessioner</h3>
                  <div className="space-y-2">
                    {chartData.map((session, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-gray-400">{session.date}</div>
                        <div className="flex-1 flex gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-12 text-sm text-green-400">{session.wpm} WPM</div>
                            <div
                              className="bg-green-500/20 h-2 rounded"
                              style={{ width: `${Math.min(session.wpm / 100 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-10 text-sm text-blue-400">{session.accuracy}%</div>
                            <div
                              className="bg-blue-500/20 h-2 rounded"
                              style={{ width: `${session.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.totalSessions === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg">Inga sessioner hittades</p>
                  <p className="text-sm">Spela några rundor för att se din statistik!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}