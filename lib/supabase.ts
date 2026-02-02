import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.includes('.supabase.co');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DatabaseProfile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
  total_sessions: number;
  total_words_typed: number;
  total_time_spent: number;
  highest_wpm: number;
  highest_accuracy: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  experience_points: number;
  achievements: Record<string, any>;
}

export interface DatabaseSession {
  id: string;
  profile_id: string;
  game_mode: string;
  wpm: number;
  accuracy: number;
  score: number;
  level: number;
  duration: number;
  text_length: number;
  created_at: string;
  combo_max: number;
  combo_points: number;
}

export interface LeaderboardEntry {
  username: string;
  highest_wpm: number;
  highest_accuracy: number;
  total_points: number;
  level: number;
  total_sessions: number;
}

export class SupabaseService {
  static async createProfile(username: string): Promise<DatabaseProfile | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping profile creation');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          username,
          total_sessions: 0,
          total_words_typed: 0,
          total_time_spent: 0,
          highest_wpm: 0,
          highest_accuracy: 0,
          current_streak: 0,
          longest_streak: 0,
          total_points: 0,
          level: 1,
          experience_points: 0,
          achievements: {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }

  static async getProfile(username: string): Promise<DatabaseProfile | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping profile get');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, return null
          return null;
        }
        console.error('Error getting profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  static async updateProfile(username: string, updates: Partial<DatabaseProfile>): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping profile update');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('username', username);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  static async saveSession(profileId: string, sessionData: Omit<DatabaseSession, 'id' | 'profile_id' | 'created_at'>): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping session save');
      return false;
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .insert([{
          profile_id: profileId,
          ...sessionData
        }]);

      if (error) {
        console.error('Error saving session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveSession:', error);
      return false;
    }
  }

  static async getLeaderboard(category: 'wpm' | 'accuracy' | 'points' | 'level' = 'points', limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty leaderboard');
      return [];
    }

    try {
      let orderColumn = 'total_points';
      if (category === 'wpm') orderColumn = 'highest_wpm';
      if (category === 'accuracy') orderColumn = 'highest_accuracy';
      if (category === 'level') orderColumn = 'level';

      const { data, error } = await supabase
        .from('profiles')
        .select('username, highest_wpm, highest_accuracy, total_points, level, total_sessions')
        .order(orderColumn, { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }

  static async getUserStats(username: string): Promise<{ sessions: DatabaseSession[]; profile: DatabaseProfile | null }> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty stats');
      return { sessions: [], profile: null };
    }

    try {
      const profile = await this.getProfile(username);
      if (!profile) {
        return { sessions: [], profile: null };
      }

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error getting user stats:', error);
        return { sessions: [], profile };
      }

      return { sessions: sessions || [], profile };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return { sessions: [], profile: null };
    }
  }
}