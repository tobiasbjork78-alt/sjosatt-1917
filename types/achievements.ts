export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (gameState: any) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'speed' | 'accuracy' | 'persistence' | 'special';
  points: number;
}

export interface UserProgress {
  totalSessions: number;
  totalWordsTyped: number;
  totalTimeSpent: number; // in milliseconds
  highestWpm: number;
  highestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate?: Date;
  achievements: Record<string, Achievement>;
  totalPoints: number;
  level: number;
  experiencePoints: number;
}