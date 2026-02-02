'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/lib/supabase';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  onLoadLeaderboard: (category: 'wpm' | 'accuracy' | 'points' | 'level') => Promise<void>;
  currentUser: string | null;
  isOnline: boolean;
}

const CATEGORIES = [
  { key: 'points' as const, label: 'Poäng', icon: '🏆', field: 'total_points' },
  { key: 'wpm' as const, label: 'WPM', icon: '⚡', field: 'highest_wpm' },
  { key: 'accuracy' as const, label: 'Noggrannhet', icon: '🎯', field: 'highest_accuracy' },
  { key: 'level' as const, label: 'Nivå', icon: '🎖️', field: 'level' },
];

export default function Leaderboard({ leaderboard, onLoadLeaderboard, currentUser, isOnline }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'wpm' | 'accuracy' | 'points' | 'level'>('points');

  useEffect(() => {
    if (isOnline) {
      onLoadLeaderboard(selectedCategory);
    }
  }, [selectedCategory, isOnline, onLoadLeaderboard]);

  const currentCategory = CATEGORIES.find(c => c.key === selectedCategory);
  const userRank = leaderboard.findIndex(entry => entry.username === currentUser) + 1;

  const formatValue = (entry: LeaderboardEntry, field: string) => {
    const value = entry[field as keyof LeaderboardEntry];
    if (field === 'highest_accuracy') return `${value}%`;
    return value.toLocaleString();
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (!isOnline) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🏆 Topplista
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📡</div>
          <p className="text-gray-400">Ingen internetanslutning</p>
          <p className="text-sm text-gray-500 mt-2">Topplistan kräver internetanslutning</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🏆 Topplista
      </h3>

      {/* Category Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.key
                ? 'bg-blue-500/30 border border-blue-400 text-blue-200'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Current User Rank */}
      {currentUser && userRank > 0 && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
          <p className="text-blue-300 text-sm font-medium">
            Din placering: {getMedal(userRank)} av {leaderboard.length} spelare
          </p>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-gray-400">Inga spelare än!</p>
            <p className="text-sm text-gray-500 mt-1">Bli den första att komma på topplistan</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                entry.username === currentUser
                  ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-lg font-bold min-w-[3rem] text-center">
                {getMedal(index + 1)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {entry.username}
                  {entry.username === currentUser && (
                    <span className="text-blue-400 ml-1">(du)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {entry.total_sessions} sessioner
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white">
                  {currentCategory && formatValue(entry, currentCategory.field)}
                </div>
                <div className="text-xs text-gray-400">
                  Nivå {entry.level}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Uppdateras var 30:e sekund</span>
          <span>{leaderboard.length}/20 visade</span>
        </div>
      </div>
    </div>
  );
}