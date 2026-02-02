'use client';

import { useState } from 'react';
import { MultiplayerRoom, MultiplayerPlayer } from '@/hooks/useMultiplayer';

interface MultiplayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  currentRoom: MultiplayerRoom | null;
  players: MultiplayerPlayer[];
  availableRooms: MultiplayerRoom[];
  isConnected: boolean;
  onCreateRoom: (name: string, gameMode: string, maxPlayers: number) => Promise<boolean>;
  onJoinRoom: (roomId: string) => Promise<boolean>;
  onLeaveRoom: () => Promise<boolean>;
  onStartGame: () => Promise<boolean>;
  onLoadRooms: () => Promise<void>;
}

export default function MultiplayerPanel({
  isOpen,
  onClose,
  currentUser,
  currentRoom,
  players,
  availableRooms,
  isConnected,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onStartGame,
  onLoadRooms,
}: MultiplayerPanelProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'current'>('rooms');
  const [roomName, setRoomName] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState('words');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-white mb-4">Multiplayer Kräver Inloggning</h2>
            <p className="text-gray-300 mb-6">
              Du måste vara inloggad för att spela multiplayer-läge med andra spelare.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHost = players.find(p => p.username === currentUser)?.is_host;
  const canStartGame = isHost && currentRoom?.status === 'waiting' && players.length >= 2;

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setIsLoading(true);
    const success = await onCreateRoom(roomName.trim(), selectedGameMode, maxPlayers);
    if (success) {
      setRoomName('');
      setActiveTab('current');
    }
    setIsLoading(false);
  };

  const handleJoinRoom = async (roomId: string) => {
    setIsLoading(true);
    const success = await onJoinRoom(roomId);
    if (success) {
      setActiveTab('current');
    }
    setIsLoading(false);
  };

  const handleStartGame = async () => {
    setIsLoading(true);
    await onStartGame();
    setIsLoading(false);
    onClose(); // Close multiplayer panel when game starts
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            👥 Multiplayer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Connection Status */}
        {currentRoom && (
          <div className="px-6 py-3 bg-black/20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white text-sm">
                {isConnected ? 'Ansluten till rum' : 'Ansluter...'}
              </span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-blue-300 text-sm font-medium">{currentRoom.name}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'rooms'
                ? 'bg-blue-500/20 border-b-2 border-blue-400 text-blue-200'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏠 Rum
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'current'
                ? 'bg-blue-500/20 border-b-2 border-blue-400 text-blue-200'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            disabled={!currentRoom}
          >
            🎮 Aktuellt Rum
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Create Room */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Skapa Nytt Rum</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rumnamn
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Familjetävling"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Spelläge
                    </label>
                    <select
                      value={selectedGameMode}
                      onChange={(e) => setSelectedGameMode(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="words">Ord</option>
                      <option value="sentences">Meningar</option>
                      <option value="code">Kod</option>
                      <option value="homerow">Hemrader</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max spelare
                    </label>
                    <select
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value={2}>2 spelare</option>
                      <option value={3}>3 spelare</option>
                      <option value={4}>4 spelare</option>
                      <option value={6}>6 spelare</option>
                      <option value={8}>8 spelare</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || isLoading}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Skapar...' : 'Skapa Rum'}
                </button>
              </div>

              {/* Available Rooms */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Tillgängliga Rum</h3>
                  <button
                    onClick={onLoadRooms}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔄 Uppdatera
                  </button>
                </div>

                {availableRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏠</div>
                    <p className="text-gray-400">Inga tillgängliga rum</p>
                    <p className="text-sm text-gray-500 mt-1">Skapa ett nytt rum för att börja spela!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <div className="text-white font-medium">{room.name}</div>
                          <div className="text-sm text-gray-400">
                            {room.game_mode} • {room.current_players}/{room.max_players} spelare • {room.host_username}
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={room.current_players >= room.max_players || isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {room.current_players >= room.max_players ? 'Fullt' : 'Gå med'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'current' && currentRoom && (
            <div className="space-y-6">
              {/* Room Info */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentRoom.name}</h3>
                    <div className="text-sm text-gray-400">
                      {currentRoom.game_mode} • Status: {currentRoom.status}
                      {isHost && <span className="text-blue-400 ml-2">(Du är värd)</span>}
                    </div>
                  </div>
                  <button
                    onClick={onLeaveRoom}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Lämna Rum
                  </button>
                </div>

                {/* Game Controls */}
                {currentRoom.status === 'waiting' && (
                  <div className="flex gap-3">
                    {canStartGame && (
                      <button
                        onClick={handleStartGame}
                        disabled={isLoading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        {isLoading ? 'Startar...' : '🚀 Starta Spel'}
                      </button>
                    )}
                    {!canStartGame && players.length < 2 && (
                      <div className="text-yellow-400 text-sm">
                        Väntar på fler spelare... (minst 2 behövs)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Players List */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Spelare ({players.length}/{currentRoom.max_players})
                </h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.username}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        player.username === currentUser
                          ? 'bg-blue-500/20 border-blue-400/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          {player.is_host ? '👑' : '👤'}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {player.username}
                            {player.username === currentUser && (
                              <span className="text-blue-400 ml-1">(du)</span>
                            )}
                          </div>
                          {currentRoom.status === 'active' && (
                            <div className="text-sm text-gray-400">
                              Progress: {Math.round(player.progress_percentage)}% •
                              {player.wpm} WPM • {player.accuracy}%
                            </div>
                          )}
                        </div>
                      </div>

                      {currentRoom.status === 'active' && (
                        <div className="text-right">
                          {player.finished ? (
                            <div className="text-green-400 text-sm font-medium">✓ Klar</div>
                          ) : (
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${player.progress_percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {currentRoom.status === 'waiting' && (
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">📋 Instruktioner</h4>
                  <div className="text-sm text-blue-200 space-y-1">
                    {isHost ? (
                      <>
                        <div>• Du är värd för detta rum</div>
                        <div>• Vänta på att fler spelare ska gå med</div>
                        <div>• Klicka &quot;Starta Spel&quot; när minst 2 spelare har gått med</div>
                        <div>• Alla spelare kommer att få samma text att skriva</div>
                      </>
                    ) : (
                      <>
                        <div>• Väntar på att värden ska starta spelet</div>
                        <div>• Spelet startar när värden väljer att börja</div>
                        <div>• Alla spelare kommer att få samma text att skriva</div>
                        <div>• Tävla om vem som skriver snabbast och mest noggrant!</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}