'use client';

import { Achievement } from '@/types/achievements';
import { useEffect, useState } from 'react';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-4 max-w-sm border-2 border-yellow-300">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-1">🏆 Achievement Unlocked!</div>
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-sm opacity-90">{achievement.description}</div>
            <div className="text-xs font-bold mt-1">+{achievement.points} poäng</div>
          </div>
        </div>
      </div>
    </div>
  );
}