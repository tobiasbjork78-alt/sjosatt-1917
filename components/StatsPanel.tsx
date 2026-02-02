'use client';

import { useState } from 'react';
import { UserProgress } from '@/types/achievements';

interface StatsPanelProps {
  userProgress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsPanel({ userProgress, isOpen, onClose }: StatsPanelProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'detailed'>('overview');

  if (!isOpen) return null;

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Aldrig';
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressToNextLevel = () => {
    const currentLevelXP = Math.pow(userProgress.level - 1, 2) * 100;
    const nextLevelXP = Math.pow(userProgress.level, 2) * 100;
    const currentProgress = userProgress.experiencePoints - currentLevelXP;
    const requiredForNext = nextLevelXP - currentLevelXP;

    return {
      current: currentProgress,
      required: requiredForNext,
      percentage: (currentProgress / requiredForNext) * 100,
    };
  };

  const levelProgress = getProgressToNextLevel();
  const achievementCount = Object.values(userProgress.achievements).filter(a => a.unlocked).length;
  const averageWPM = userProgress.totalSessions > 0 ? Math.round(userProgress.totalWordsTyped / (userProgress.totalTimeSpent / 60000)) : 0;

  const tabs = [
    { key: 'overview' as const, label: 'Översikt', icon: '📊' },
    { key: 'achievements' as const, label: 'Prestationer', icon: '🏆' },
    { key: 'detailed' as const, label: 'Detaljer', icon: '📋' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📈 Detaljerad Statistik
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                selectedTab === tab.key
                  ? 'bg-blue-500/20 border-b-2 border-blue-400 text-blue-200'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-2xl font-bold text-blue-300">{userProgress.level}</div>
                  <div className="text-sm text-blue-200">Nuvarande Nivå</div>
                  <div className="mt-2 bg-blue-400/20 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(levelProgress.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-200 mt-1">
                    {levelProgress.current}/{levelProgress.required} XP till nästa nivå
                  </div>
                </div>

                <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                  <div className="text-2xl font-bold text-green-300">{userProgress.totalPoints}</div>
                  <div className="text-sm text-green-200">Totala Poäng</div>
                </div>

                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                  <div className="text-2xl font-bold text-purple-300">{userProgress.highestWpm}</div>
                  <div className="text-sm text-purple-200">Högsta WPM</div>
                </div>

                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-400/30">
                  <div className="text-2xl font-bold text-yellow-300">{userProgress.highestAccuracy}%</div>
                  <div className="text-sm text-yellow-200">Bästa Noggrannhet</div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">🎯 Träningsstatistik</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Totala sessioner:</span>
                      <span className="text-white font-semibold">{userProgress.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ord skrivna:</span>
                      <span className="text-white font-semibold">{userProgress.totalWordsTyped.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total träningstid:</span>
                      <span className="text-white font-semibold">{formatTime(userProgress.totalTimeSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Genomsnittlig WPM:</span>
                      <span className="text-white font-semibold">{averageWPM}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">🔥 Streak Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Nuvarande streak:</span>
                      <span className="text-orange-400 font-semibold">{userProgress.currentStreak} dagar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Längsta streak:</span>
                      <span className="text-orange-400 font-semibold">{userProgress.longestStreak} dagar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Senast spelad:</span>
                      <span className="text-white font-semibold">{formatDate(userProgress.lastPlayedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prestationer:</span>
                      <span className="text-yellow-400 font-semibold">{achievementCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'achievements' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-xl font-bold text-white">Prestationer</h3>
                <p className="text-gray-400">{achievementCount} av {Object.keys(userProgress.achievements).length} upplåsta</p>
              </div>

              <div className="grid gap-3">
                {Object.values(userProgress.achievements)
                  .sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0))
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border flex items-center gap-4 ${
                        achievement.unlocked
                          ? 'bg-green-500/20 border-green-400/30'
                          : 'bg-gray-500/10 border-gray-600/30'
                      }`}
                    >
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${achievement.unlocked ? 'text-green-300' : 'text-gray-400'}`}>
                          {achievement.name}
                        </div>
                        <div className={`text-sm ${achievement.unlocked ? 'text-green-200' : 'text-gray-500'}`}>
                          {achievement.description}
                        </div>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-green-400 mt-1">
                            Upplåst: {formatDate(achievement.unlockedAt)}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-semibold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {achievement.points}p
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {selectedTab === 'detailed' && (
            <div className="space-y-6">
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Prestationsanalys</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Hastighetsframsteg</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">
                        Högsta WPM: <span className="text-white">{userProgress.highestWpm}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Genomsnitt: <span className="text-white">{averageWPM} WPM</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${Math.min((userProgress.highestWpm / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">Målhastighet: 100 WPM</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">Noggrannhetsframsteg</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">
                        Bästa noggrannhet: <span className="text-white">{userProgress.highestAccuracy}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${userProgress.highestAccuracy}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">Mål: 95% noggrannhet</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 Rekommendationer</h3>
                <div className="space-y-2 text-sm">
                  {userProgress.highestWpm < 30 && (
                    <div className="text-yellow-300">• Fokusera på hemradsträning för att öka hastigheten</div>
                  )}
                  {userProgress.highestAccuracy < 90 && (
                    <div className="text-blue-300">• Träna noggrannhet före hastighet för bästa resultat</div>
                  )}
                  {userProgress.currentStreak === 0 && (
                    <div className="text-orange-300">• Försök träna dagligen för att bygga upp din streak</div>
                  )}
                  {userProgress.totalSessions < 10 && (
                    <div className="text-purple-300">• Fortsätt träna regelbundet för att se förbättring</div>
                  )}
                  {userProgress.level < 5 && (
                    <div className="text-green-300">• Prova olika spellägen för att låsa upp fler nivåer</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}