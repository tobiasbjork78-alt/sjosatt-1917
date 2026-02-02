'use client';

import { useEffect, useState } from 'react';
import { SupabaseService, LeaderboardEntry } from '@/lib/supabase';

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type LeaderboardCategory = 'wpm' | 'accuracy' | 'points' | 'level';

export default function LeaderboardPanel({ isOpen, onClose }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [category, setCategory] = useState<LeaderboardCategory>('points');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { key: LeaderboardCategory; label: string; icon: string }[] = [
    { key: 'points', label: 'Poäng', icon: '🏆' },
    { key: 'wpm', label: 'WPM', icon: '⚡' },
    { key: 'accuracy', label: 'Noggrannhet', icon: '🎯' },
    { key: 'level', label: 'Nivå', icon: '⭐' },
  ];

  const loadLeaderboard = async (cat: LeaderboardCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupabaseService.getLeaderboard(cat, 20);
      setEntries(data);
    } catch (err) {
      setError('Kunde inte ladda topplistan. Kontrollera din internetanslutning.');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard(category);
    }
  }, [isOpen, category]);

  const handleCategoryChange = (newCategory: LeaderboardCategory) => {
    setCategory(newCategory);
  };

  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  const getValueForCategory = (entry: LeaderboardEntry, cat: LeaderboardCategory) => {
    switch (cat) {
      case 'points': return entry.total_points.toLocaleString();
      case 'wpm': return `${entry.highest_wpm} WPM`;
      case 'accuracy': return `${entry.highest_accuracy}%`;
      case 'level': return `Nivå ${entry.level}`;
      default: return '0';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🏆 Topplista</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  category === cat.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-300">Laddar topplistan...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => loadLeaderboard(category)}
                className="mt-2 text-red-200 underline hover:text-red-100"
              >
                Försök igen
              </button>
            </div>
          )}

          {/* Leaderboard Entries */}
          {!loading && !error && (
            <div className="space-y-2">
              {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg">Inga spelare hittades</p>
                  <p className="text-sm">Bli den första att sätta en rekord!</p>
                </div>
              ) : (
                entries.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={`${entry.username}-${rank}`}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        rank <= 3
                          ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30'
                          : 'bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">
                          {entry.username}
                        </div>
                        <div className="text-sm text-gray-300">
                          {entry.total_sessions} sessioner
                        </div>
                      </div>

                      {/* Primary Metric */}
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          rank <= 3 ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {getValueForCategory(entry, category)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Topplistan uppdateras i realtid baserat på alla spelares prestationer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}