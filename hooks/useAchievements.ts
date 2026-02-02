'use client';

import { useState, useEffect, useCallback } from 'react';
import { Achievement, UserProgress } from '@/types/achievements';
import { ACHIEVEMENTS, calculateLevelFromXP, calculateScoreMultiplier } from '@/data/achievements';
import { GameState } from '@/types/game';
import { SupabaseService } from '@/lib/supabase';

const STORAGE_KEY = 'typing-game-progress';

const initialProgress: UserProgress = {
  totalSessions: 0,
  totalWordsTyped: 0,
  totalTimeSpent: 0,
  highestWpm: 0,
  highestAccuracy: 0,
  currentStreak: 0,
  longestStreak: 0,
  achievements: {},
  totalPoints: 0,
  level: 1,
  experiencePoints: 0,
};

export function useAchievements() {
  const [userProgress, setUserProgress] = useState<UserProgress>(initialProgress);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          if (parsed.lastPlayedDate) {
            parsed.lastPlayedDate = new Date(parsed.lastPlayedDate);
          }
          Object.values(parsed.achievements || {}).forEach((achievement: any) => {
            if (achievement.unlockedAt) {
              achievement.unlockedAt = new Date(achievement.unlockedAt);
            }
          });
          setUserProgress(parsed);
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback((gameState: GameState) => {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      const wasUnlocked = userProgress.achievements[achievement.id]?.unlocked;

      if (!wasUnlocked && achievement.condition(gameState)) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
        };

        newlyUnlocked.push(unlockedAchievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUserProgress(prev => {
        const newProgress = { ...prev };
        let totalNewPoints = 0;

        newlyUnlocked.forEach(achievement => {
          newProgress.achievements[achievement.id] = achievement;
          totalNewPoints += achievement.points;
        });

        newProgress.totalPoints += totalNewPoints;
        newProgress.experiencePoints += totalNewPoints;
        newProgress.level = calculateLevelFromXP(newProgress.experiencePoints);

        saveProgress(newProgress);
        return newProgress;
      });

      // Show achievement notification for the first one
      setNewAchievement(newlyUnlocked[0]);
    }
  }, [userProgress.achievements, saveProgress]);

  // Update progress after game session
  const updateProgress = useCallback((gameState: GameState, gameMode: string) => {
    if (!gameState.isActive && gameState.currentIndex > 0) {
      const sessionTime = gameState.stats.currentTime - gameState.stats.startTime;
      const wordsTyped = Math.floor(gameState.stats.correctKeystrokes / 5);

      const scoreMultiplier = calculateScoreMultiplier(
        gameState.stats.wpm,
        gameState.stats.accuracy,
        gameState.level
      );

      const baseScore = gameState.stats.correctKeystrokes * 10;
      const bonusScore = Math.floor(baseScore * (scoreMultiplier - 1));

      setUserProgress(prev => {
        const newProgress = {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalWordsTyped: prev.totalWordsTyped + wordsTyped,
          totalTimeSpent: prev.totalTimeSpent + sessionTime,
          highestWpm: Math.max(prev.highestWpm, gameState.stats.wpm),
          highestAccuracy: Math.max(prev.highestAccuracy, gameState.stats.accuracy),
          lastPlayedDate: new Date(),
          totalPoints: prev.totalPoints + baseScore + bonusScore,
          experiencePoints: prev.experiencePoints + baseScore + bonusScore,
        };

        // Update streak
        const today = new Date().toDateString();
        const lastPlayed = prev.lastPlayedDate?.toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPlayed === today) {
          // Same day, keep streak
        } else if (lastPlayed === yesterday.toDateString()) {
          // Yesterday, increment streak
          newProgress.currentStreak = prev.currentStreak + 1;
        } else {
          // Break in streak
          newProgress.currentStreak = 1;
        }

        newProgress.longestStreak = Math.max(newProgress.longestStreak, newProgress.currentStreak);
        newProgress.level = calculateLevelFromXP(newProgress.experiencePoints);

        saveProgress(newProgress);
        return newProgress;
      });

      // Check for new achievements
      checkAchievements(gameState);
    }
  }, [saveProgress, checkAchievements]);

  // Get all achievements with current unlock status
  const getAllAchievements = useCallback(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: userProgress.achievements[achievement.id]?.unlocked || false,
      unlockedAt: userProgress.achievements[achievement.id]?.unlockedAt,
    }));
  }, [userProgress.achievements]);

  // Clear achievement notification
  const clearAchievementNotification = useCallback(() => {
    setNewAchievement(null);
  }, []);

  // Reset progress (for testing or user choice)
  const resetProgress = useCallback(() => {
    setUserProgress(initialProgress);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    userProgress,
    newAchievement,
    updateProgress,
    checkAchievements,
    getAllAchievements,
    clearAchievementNotification,
    resetProgress,
  };
}