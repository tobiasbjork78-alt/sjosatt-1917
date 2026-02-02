'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupabaseService, DatabaseProfile, LeaderboardEntry } from '@/lib/supabase';
import { UserProgress } from '@/types/achievements';
import { GameState } from '@/types/game';

export function useSupabaseSync() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Check if user is logged in (stored in localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('typing-game-username');
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    }
  }, []);

  // Login user (or create new profile)
  const login = useCallback(async (username: string): Promise<boolean> => {
    if (!username.trim()) return false;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Check if profile exists
      let profile = await SupabaseService.getProfile(username);

      // If profile doesn't exist, create it
      if (!profile) {
        profile = await SupabaseService.createProfile(username);
        if (!profile) {
          setSyncError('Kunde inte skapa profil');
          return false;
        }
      }

      setCurrentUser(username);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typing-game-username', username);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setSyncError('Anslutningsfel vid inloggning');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typing-game-username');
    }
  }, []);

  // Sync progress to Supabase
  const syncProgress = useCallback(async (progress: UserProgress): Promise<boolean> => {
    if (!currentUser || !isOnline) return false;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const updates: Partial<DatabaseProfile> = {
        total_sessions: progress.totalSessions,
        total_words_typed: progress.totalWordsTyped,
        total_time_spent: progress.totalTimeSpent,
        highest_wpm: progress.highestWpm,
        highest_accuracy: progress.highestAccuracy,
        current_streak: progress.currentStreak,
        longest_streak: progress.longestStreak,
        total_points: progress.totalPoints,
        level: progress.level,
        experience_points: progress.experiencePoints,
        achievements: progress.achievements,
        updated_at: new Date().toISOString(),
      };

      const success = await SupabaseService.updateProfile(currentUser, updates);
      if (!success) {
        setSyncError('Kunde inte synka framsteg');
      }

      return success;
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Anslutningsfel vid synkning');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, isOnline]);

  // Load progress from Supabase
  const loadProgress = useCallback(async (): Promise<UserProgress | null> => {
    if (!currentUser || !isOnline) return null;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const profile = await SupabaseService.getProfile(currentUser);
      if (!profile) {
        setSyncError('Profil hittades inte');
        return null;
      }

      const progress: UserProgress = {
        totalSessions: profile.total_sessions,
        totalWordsTyped: profile.total_words_typed,
        totalTimeSpent: profile.total_time_spent,
        highestWpm: profile.highest_wpm,
        highestAccuracy: profile.highest_accuracy,
        currentStreak: profile.current_streak,
        longestStreak: profile.longest_streak,
        totalPoints: profile.total_points,
        level: profile.level,
        experiencePoints: profile.experience_points,
        achievements: profile.achievements || {},
        lastPlayedDate: profile.updated_at ? new Date(profile.updated_at) : undefined,
      };

      return progress;
    } catch (error) {
      console.error('Load progress error:', error);
      setSyncError('Kunde inte ladda framsteg');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, isOnline]);

  // Save game session
  const saveSession = useCallback(async (gameState: GameState, gameMode: string): Promise<boolean> => {
    if (!currentUser || !isOnline || gameState.currentIndex === 0) return false;

    try {
      const profile = await SupabaseService.getProfile(currentUser);
      if (!profile) return false;

      const sessionTime = gameState.stats.currentTime - gameState.stats.startTime;
      const success = await SupabaseService.saveSession(profile.id, {
        game_mode: gameMode,
        wpm: gameState.stats.wpm,
        accuracy: gameState.stats.accuracy,
        score: gameState.score,
        level: gameState.level,
        duration: sessionTime,
        text_length: gameState.currentText.length,
        combo_max: gameState.stats.maxCombo,
        combo_points: gameState.stats.comboPoints,
      });

      return success;
    } catch (error) {
      console.error('Save session error:', error);
      return false;
    }
  }, [currentUser, isOnline]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (category: 'wpm' | 'accuracy' | 'points' | 'level' = 'points'): Promise<void> => {
    if (!isOnline) return;

    try {
      const data = await SupabaseService.getLeaderboard(category, 20);
      setLeaderboard(data);
    } catch (error) {
      console.error('Load leaderboard error:', error);
      setSyncError('Kunde inte ladda topplista');
    }
  }, [isOnline]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    currentUser,
    isOnline,
    isSyncing,
    leaderboard,
    syncError,
    login,
    logout,
    syncProgress,
    loadProgress,
    saveSession,
    loadLeaderboard,
    clearError: () => setSyncError(null),
  };
}