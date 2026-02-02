export interface MultiplayerRoom {
  id: string;
  name: string;
  host: string;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'starting' | 'active' | 'finished';
  gameMode: string;
  gameText: string;
  maxPlayers: number;
  createdAt: string;
  startTime?: number;
  endTime?: number;
  settings: {
    gameMode: string;
    level: number;
    timeLimit?: number;
  };
}

export interface MultiplayerPlayer {
  username: string;
  isHost: boolean;
  isReady: boolean;
  progress: number; // 0-100%
  wpm: number;
  accuracy: number;
  position: number; // Current character index
  status: 'connected' | 'disconnected' | 'finished';
  finishTime?: number;
  score: number;
  lastUpdate: number;
}

export interface MultiplayerGameState {
  room: MultiplayerRoom | null;
  localPlayer: MultiplayerPlayer | null;
  isHost: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  winner: MultiplayerPlayer | null;
  countdown: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface MultiplayerUpdate {
  type: 'player_update' | 'game_start' | 'game_end' | 'player_join' | 'player_leave' | 'room_update';
  playerId: string;
  data: any;
  timestamp: number;
}

export interface CreateRoomRequest {
  roomName: string;
  hostUsername: string;
  gameMode: string;
  maxPlayers: number;
  level: number;
}

export interface JoinRoomRequest {
  roomId: string;
  username: string;
}