'use client';

import { Achievement } from '@/types/achievements';

interface AchievementPanelProps {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  experiencePoints: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementPanel({
  achievements,
  totalPoints,
  level,
  experiencePoints,
  isOpen,
  onClose
}: AchievementPanelProps) {
  if (!isOpen) return null;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const nextLevelXP = Math.pow(level, 2) * 100;
  const progressToNextLevel = ((experiencePoints - Math.pow(level - 1, 2) * 100) / (nextLevelXP - Math.pow(level - 1, 2) * 100)) * 100;

  const categoryGroups = achievements.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  const categoryNames = {
    speed: '⚡ Hastighet',
    accuracy: '🎯 Noggrannhet',
    persistence: '💪 Uthållighet',
    special: '⭐ Specialprestationer',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🏆 Prestationer</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm text-gray-300">Totala poäng</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{level}</div>
              <div className="text-sm text-gray-300">Nivå</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{unlockedAchievements.length}</div>
              <div className="text-sm text-gray-300">Upplåsta prestationer</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Nivå {level}</span>
              <span>Nivå {level + 1}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-center">
              {experiencePoints} XP / {nextLevelXP} XP
            </div>
          </div>

          {/* Achievements by category */}
          <div className="space-y-6">
            {Object.entries(categoryGroups).map(([category, categoryAchievements]) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-white mb-3">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        achievement.unlocked
                          ? 'bg-green-500/10 border-green-400/50'
                          : 'bg-gray-800/50 border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.name}
                          </div>
                          <div className="text-xs text-yellow-400 font-semibold">
                            +{achievement.points} poäng
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm ${achievement.unlocked ? 'text-green-200' : 'text-gray-500'}`}>
                        {achievement.description}
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-green-400 mt-1">
                          Upplåst: {achievement.unlockedAt.toLocaleDateString('sv-SE')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}