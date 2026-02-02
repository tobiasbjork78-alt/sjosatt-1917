'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { GameState } from '@/types/game';

export interface MultiplayerRoom {
  id: string;
  name: string;
  host_username: string;
  game_mode: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'active' | 'finished';
  text_content: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface MultiplayerPlayer {
  room_id: string;
  username: string;
  is_host: boolean;
  current_position: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finished_at?: string;
  final_time?: number;
  progress_percentage: number;
}

export interface LiveUpdate {
  username: string;
  position: number;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  timestamp: string;
}

export function useMultiplayer(currentUser: string | null) {
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [availableRooms, setAvailableRooms] = useState<MultiplayerRoom[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [gameResults, setGameResults] = useState<MultiplayerPlayer[]>([]);

  const subscriptionRef = useRef<any>(null);
  const playerUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a new multiplayer room
  const createRoom = useCallback(async (
    roomName: string,
    gameMode: string,
    maxPlayers: number = 4,
    textContent?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const { data, error } = await supabase
        .from('multiplayer_rooms')
        .insert([{
          name: roomName,
          host_username: currentUser,
          game_mode: gameMode,
          max_players: maxPlayers,
          current_players: 1,
          status: 'waiting',
          text_content: textContent || 'Sample multiplayer text for testing...'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating room:', error);
        return false;
      }

      // Join the room as host
      const { error: joinError } = await supabase
        .from('multiplayer_players')
        .insert([{
          room_id: data.id,
          username: currentUser,
          is_host: true,
          current_position: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          progress_percentage: 0
        }]);

      if (joinError) {
        console.error('Error joining as host:', joinError);
        return false;
      }

      setCurrentRoom(data);
      return true;
    } catch (error) {
      console.error('Error creating room:', error);
      return false;
    }
  }, [currentUser]);

  // Join an existing room
  const joinRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Check if room exists and has space
      const { data: room, error: roomError } = await supabase
        .from('multiplayer_rooms')
        .select('*')
        .eq('id', roomId)
        .eq('status', 'waiting')
        .single();

      if (roomError || !room || room.current_players >= room.max_players) {
        return false;
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('multiplayer_players')
        .insert([{
          room_id: roomId,
          username: currentUser,
          is_host: false,
          current_position: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          progress_percentage: 0
        }]);

      if (joinError) {
        console.error('Error joining room:', joinError);
        return false;
      }

      // Update room player count
      await supabase
        .from('multiplayer_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', roomId);

      setCurrentRoom(room);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  }, [currentUser]);

  // Leave current room
  const leaveRoom = useCallback(async (): Promise<boolean> => {
    if (!currentUser || !currentRoom) return false;

    try {
      // Remove player from room
      await supabase
        .from('multiplayer_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('username', currentUser);

      // Update room player count or delete room if host leaves
      const isHost = players.find(p => p.username === currentUser)?.is_host;

      if (isHost || currentRoom.current_players <= 1) {
        // Delete room if host leaves or no players left
        await supabase
          .from('multiplayer_rooms')
          .delete()
          .eq('id', currentRoom.id);
      } else {
        // Just update player count
        await supabase
          .from('multiplayer_rooms')
          .update({ current_players: currentRoom.current_players - 1 })
          .eq('id', currentRoom.id);
      }

      setCurrentRoom(null);
      setPlayers([]);
      setLiveUpdates([]);
      setIsConnected(false);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      return false;
    }
  }, [currentUser, currentRoom, players]);

  // Start the game (host only)
  const startGame = useCallback(async (): Promise<boolean> => {
    if (!currentUser || !currentRoom) return false;

    const isHost = players.find(p => p.username === currentUser)?.is_host;
    if (!isHost) return false;

    try {
      await supabase
        .from('multiplayer_rooms')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', currentRoom.id);

      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      return false;
    }
  }, [currentUser, currentRoom, players]);

  // Update player progress during game
  const updateProgress = useCallback(async (gameState: GameState): Promise<void> => {
    if (!currentUser || !currentRoom || currentRoom.status !== 'active') return;

    // Throttle updates to avoid overwhelming the database
    if (playerUpdateTimeoutRef.current) {
      clearTimeout(playerUpdateTimeoutRef.current);
    }

    playerUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        const progressPercentage = gameState.currentText.length > 0
          ? (gameState.currentIndex / gameState.currentText.length) * 100
          : 0;

        const isFinished = gameState.currentIndex >= gameState.currentText.length;

        const updateData: any = {
          current_position: gameState.currentIndex,
          wpm: gameState.stats.wpm,
          accuracy: gameState.stats.accuracy,
          progress_percentage: progressPercentage,
          finished: isFinished
        };

        if (isFinished && !players.find(p => p.username === currentUser)?.finished) {
          updateData.finished_at = new Date().toISOString();
          updateData.final_time = gameState.stats.currentTime - gameState.stats.startTime;
        }

        await supabase
          .from('multiplayer_players')
          .update(updateData)
          .eq('room_id', currentRoom.id)
          .eq('username', currentUser);

        // Check if all players are finished to end the game
        if (isFinished) {
          const allPlayers = await supabase
            .from('multiplayer_players')
            .select('finished')
            .eq('room_id', currentRoom.id);

          if (allPlayers.data?.every(p => p.finished)) {
            await supabase
              .from('multiplayer_rooms')
              .update({
                status: 'finished',
                finished_at: new Date().toISOString()
              })
              .eq('id', currentRoom.id);
          }
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }, 500); // Update every 500ms
  }, [currentUser, currentRoom, players]);

  // Load available rooms
  const loadAvailableRooms = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('multiplayer_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading rooms:', error);
        return;
      }

      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error loading available rooms:', error);
    }
  }, []);

  // Subscribe to room updates when in a room
  useEffect(() => {
    if (!currentRoom || !currentUser) return;

    const subscribeToRoom = async () => {
      try {
        // Load initial players
        const { data: initialPlayers } = await supabase
          .from('multiplayer_players')
          .select('*')
          .eq('room_id', currentRoom.id);

        setPlayers(initialPlayers || []);

        // Subscribe to real-time updates
        const subscription = supabase
          .channel(`room_${currentRoom.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'multiplayer_players',
            filter: `room_id=eq.${currentRoom.id}`
          }, (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setPlayers(prev => {
                const updated = prev.filter(p => p.username !== payload.new.username);
                return [...updated, payload.new as MultiplayerPlayer];
              });

              // Add to live updates
              if (payload.new.username !== currentUser) {
                setLiveUpdates(prev => [
                  ...prev.slice(-9), // Keep last 10 updates
                  {
                    username: payload.new.username,
                    position: payload.new.current_position,
                    progress: payload.new.progress_percentage,
                    wpm: payload.new.wpm,
                    accuracy: payload.new.accuracy,
                    finished: payload.new.finished,
                    timestamp: new Date().toISOString()
                  }
                ]);
              }
            } else if (payload.eventType === 'DELETE') {
              setPlayers(prev => prev.filter(p => p.username !== payload.old.username));
            }
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'multiplayer_rooms',
            filter: `id=eq.${currentRoom.id}`
          }, (payload) => {
            setCurrentRoom(payload.new as MultiplayerRoom);

            if (payload.new.status === 'finished') {
              // Game ended, load final results
              supabase
                .from('multiplayer_players')
                .select('*')
                .eq('room_id', currentRoom.id)
                .order('finished_at', { ascending: true })
                .then(({ data }) => {
                  setGameResults(data || []);
                });
            }
          })
          .subscribe();

        subscriptionRef.current = subscription;
        setIsConnected(true);
      } catch (error) {
        console.error('Error subscribing to room:', error);
      }
    };

    subscribeToRoom();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      setIsConnected(false);
    };
  }, [currentRoom, currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerUpdateTimeoutRef.current) {
        clearTimeout(playerUpdateTimeoutRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    currentRoom,
    players,
    availableRooms,
    isConnected,
    liveUpdates,
    gameResults,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateProgress,
    loadAvailableRooms,
  };
}