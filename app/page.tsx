'use client';

import VirtualKeyboard from '@/components/VirtualKeyboard';
import AchievementNotification from '@/components/AchievementNotification';
import AchievementPanel from '@/components/AchievementPanel';
import LoginModal from '@/components/LoginModal';
import Leaderboard from '@/components/Leaderboard';
import StatsPanel from '@/components/StatsPanel';
import SettingsPanel from '@/components/SettingsPanel';
import MultiplayerPanel from '@/components/MultiplayerPanel';
import ThemeProvider from '@/components/ThemeProvider';
import { useTypingGame } from '@/hooks/useTypingGame';
import { useAchievements } from '@/hooks/useAchievements';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTheme } from '@/hooks/useTheme';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { GameMode } from '@/types/game';
import { useState, useEffect } from 'react';

const GAME_MODES: { key: GameMode; label: string; icon: string; description: string }[] = [
  { key: 'homerow', label: 'Hemrader', icon: '🎯', description: 'ASDF JKL; - grunderna' },
  { key: 'words', label: 'Ord', icon: '📝', description: 'Blandade ord' },
  { key: 'sentences', label: 'Meningar', icon: '📖', description: 'Svenska meningar' },
  { key: 'code', label: 'Kod', icon: '⌨️', description: 'JavaScript kod' },
  { key: 'swedish', label: 'Svenska', icon: '🇸🇪', description: 'Svenska texter' },
  { key: 'numbers', label: 'Siffror', icon: '🔢', description: 'Siffror och tal' },
  { key: 'symbols', label: 'Symboler', icon: '⚡', description: 'Specialtecken' },
];

export default function Home() {
  const {
    gameState,
    gameMode,
    lastKeyCorrect,
    nextKey,
    progress,
    problematicKeys,
    startGame,
    resetGame,
    togglePause,
    setGameMode,
  } = useTypingGame();

  const {
    userProgress,
    newAchievement,
    updateProgress,
    checkAchievements,
    getAllAchievements,
    clearAchievementNotification,
  } = useAchievements();

  const {
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
    clearError,
  } = useSupabaseSync();

  const { playSound, toggleSound, isSoundEnabled } = useSoundEffects();
  const { currentTheme, changeTheme, getAllThemes, getThemeClasses } = useTheme();

  const {
    currentRoom,
    players,
    availableRooms,
    isConnected: isMultiplayerConnected,
    liveUpdates,
    gameResults,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame: startMultiplayerGame,
    updateProgress: updateMultiplayerProgress,
    loadAvailableRooms,
  } = useMultiplayer(currentUser);

  const [showAchievements, setShowAchievements] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  const currentModeInfo = GAME_MODES.find(m => m.key === gameMode) || GAME_MODES[0];

  // Update progress when game ends
  useEffect(() => {
    if (!gameState.isActive && gameState.currentIndex > 0) {
      updateProgress(gameState, gameMode);
    }
  }, [gameState.isActive, gameState.currentIndex, updateProgress, gameState, gameMode]);

  // Check achievements during game
  useEffect(() => {
    if (gameState.isActive) {
      checkAchievements(gameState);
    }
  }, [gameState.stats.wpm, gameState.stats.accuracy, gameState.level, checkAchievements, gameState]);

  // Sync progress to Supabase when updated
  useEffect(() => {
    if (currentUser && isOnline) {
      syncProgress(userProgress);
    }
  }, [userProgress, currentUser, isOnline, syncProgress]);

  // Save game session to Supabase when game ends
  useEffect(() => {
    if (!gameState.isActive && gameState.currentIndex > 0 && currentUser && isOnline) {
      saveSession(gameState, gameMode);
    }
  }, [gameState.isActive, gameState.currentIndex, currentUser, isOnline, saveSession, gameState, gameMode]);

  // Load initial progress from Supabase when user logs in
  useEffect(() => {
    if (currentUser && isOnline) {
      loadProgress().then(progress => {
        if (progress) {
          // Update local progress with server data if server has newer data
          // This is a simple sync - could be more sophisticated
          console.log('Loaded progress from server:', progress);
        }
      });
    }
  }, [currentUser, isOnline, loadProgress]);

  // Play sound effects based on game events
  useEffect(() => {
    if (lastKeyCorrect === true) {
      playSound('keypress');

      // Play combo sound for significant combos
      if (gameState.stats.currentCombo > 0 && gameState.stats.currentCombo % 10 === 0) {
        playSound('combo', gameState.stats.currentCombo);
      }
    } else if (lastKeyCorrect === false) {
      playSound('error');
    }
  }, [lastKeyCorrect, gameState.stats.currentCombo, playSound]);

  // Play success sound when game ends
  useEffect(() => {
    if (!gameState.isActive && gameState.currentIndex > 0 && gameState.currentIndex >= gameState.currentText.length) {
      playSound('success');
    }
  }, [gameState.isActive, gameState.currentIndex, gameState.currentText.length, playSound]);

  // Play achievement sound
  useEffect(() => {
    if (newAchievement) {
      playSound('achievement');
    }
  }, [newAchievement, playSound]);

  // Update multiplayer progress during game
  useEffect(() => {
    if (currentRoom && gameState.isActive) {
      updateMultiplayerProgress(gameState);
    }
  }, [currentRoom, gameState.isActive, gameState.currentIndex, gameState.stats.wpm, gameState.stats.accuracy, updateMultiplayerProgress, gameState]);

  const allAchievements = getAllAchievements();

  const themeClasses = getThemeClasses();

  return (
    <ThemeProvider>
      <div className="space-y-6">
      {/* Game Mode Selection */}
      {!gameState.isActive && (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4 text-center">Välj träningsläge</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setGameMode(mode.key)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                  gameMode === mode.key
                    ? 'border-blue-400 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{mode.icon}</div>
                <div className="font-bold text-sm">{mode.label}</div>
                <div className="text-xs opacity-80">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Status & Online Features */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                {currentUser ? `Inloggad som ${currentUser}` : 'Spelar lokalt'}
              </span>
              {isSyncing && <div className="text-blue-400 animate-pulse text-sm">Synkar...</div>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                📊 Statistik
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                ⚙️ Inställningar
              </button>
              <button
                onClick={() => {
                  setShowMultiplayer(true);
                  loadAvailableRooms();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                👥 Multiplayer
              </button>

              {!currentUser ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Logga in
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    🏆 Topplista
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Logga ut
                  </button>
                </>
              )}
            </div>
          </div>

          {syncError && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-400 rounded text-red-300 text-sm flex justify-between items-center">
              <span>{syncError}</span>
              <button onClick={clearError} className="text-red-200 hover:text-white">×</button>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && currentUser && (
        <Leaderboard
          leaderboard={leaderboard}
          onLoadLeaderboard={loadLeaderboard}
          currentUser={currentUser}
          isOnline={isOnline}
        />
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-green-400">{gameState.stats.wpm}</div>
          <div className="text-sm text-blue-200">WPM</div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-blue-400">{gameState.stats.accuracy}%</div>
          <div className="text-sm text-blue-200">Noggrannhet</div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-purple-400">{gameState.level}</div>
          <div className="text-sm text-blue-200">Nivå</div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-yellow-400">{gameState.score}</div>
          <div className="text-sm text-blue-200">Poäng</div>
        </div>
        <div className={`bg-black/20 backdrop-blur-sm rounded-lg p-4 border text-center transition-all duration-300 ${
          gameState.stats.currentCombo > 10 ? 'border-orange-400 bg-orange-500/20' : 'border-white/10'
        }`}>
          <div className={`text-2xl font-bold ${gameState.stats.currentCombo > 10 ? 'text-orange-400 animate-pulse' : 'text-red-400'}`}>
            {gameState.stats.currentCombo}
          </div>
          <div className="text-sm text-blue-200">Combo</div>
          {gameState.stats.currentCombo > 10 && (
            <div className="text-xs text-orange-300">+{gameState.stats.comboPoints}</div>
          )}
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
          <div className="text-2xl font-bold text-indigo-400">{userProgress.currentStreak}</div>
          <div className="text-sm text-blue-200">Streak</div>
        </div>
      </div>

      {/* Problematic Keys Alert */}
      {problematicKeys.length > 0 && gameState.isActive && (
        <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-4">
          <h3 className="text-orange-300 font-bold mb-2">⚠️ Träna mer på dessa tangenter:</h3>
          <div className="flex gap-2">
            {problematicKeys.map(key => (
              <span key={key} className="bg-orange-400/20 text-orange-200 px-2 py-1 rounded font-mono text-sm">
                {key === ' ' ? 'SPACE' : key.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Text Display */}
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-2">
            {currentModeInfo.icon} {currentModeInfo.label} - Nivå {gameState.level}
          </h2>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-base md:text-lg leading-relaxed min-h-[120px] overflow-auto">
          {gameState.currentText.split('').map((char, index) => {
            let className = 'transition-all duration-200 ';

            if (index < gameState.currentIndex) {
              className += 'text-green-400 bg-green-400/20';
            } else if (index === gameState.currentIndex) {
              className += 'text-white bg-white/30 animate-pulse shadow-sm';
            } else {
              className += 'text-gray-400';
            }

            if (char === '\n') {
              return <br key={index} />;
            }

            return (
              <span key={index} className={`${className} px-0.5 py-0.5 rounded`}>
                {char === ' ' ? '␣' : char}
              </span>
            );
          })}
        </div>

        {/* Real-time WPM indicator during typing */}
        {gameState.isActive && gameState.stats.wpm > 0 && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time: {gameState.stats.wpm} WPM
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        {!gameState.isActive ? (
          <>
            <button
              onClick={() => startGame()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🚀 Starta {currentModeInfo.label}
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🏆 Prestationer
            </button>
          </>
        ) : (
          <>
            <button
              onClick={togglePause}
              className={`${
                gameState.isPaused
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg`}
            >
              {gameState.isPaused ? '▶️ Fortsätt' : '⏸️ Pausa'}
            </button>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              🔄 Börja om
            </button>
          </>
        )}
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        nextKey={nextKey}
        lastKeyCorrect={lastKeyCorrect}
        className="max-w-4xl mx-auto"
      />

      {/* Instructions and Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2">📚 Instruktioner</h3>
          <div className="text-sm text-blue-200 space-y-1">
            <p>• Välj ett träningsläge ovan</p>
            <p>• Tryck &quot;Starta&quot; och börja skriva</p>
            <p>• Följ färgkodningen på tangentbordet</p>
            <p>• Sikta på 85%+ noggrannhet för att gå upp i nivå</p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2">💡 Tips</h3>
          <div className="text-sm text-blue-200 space-y-1">
            <p>• Hemrader: A S D F - J K L ;</p>
            <p>• Använd rätt finger för varje tangent</p>
            <p>• Fokusera på noggrannhet före hastighet</p>
            <p>• Träna regelbundet för bästa resultat</p>
          </div>
        </div>
      </div>

      {/* Key Statistics (when game is active) */}
      {gameState.isActive && Object.keys(gameState.stats.keyStats).length > 0 && (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <h3 className="font-bold text-white mb-3">📊 Tangenstatistik</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Object.entries(gameState.stats.keyStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(0, 16)
              .map(([key, stats]) => (
                <div key={key} className="text-center p-2 bg-gray-800/50 rounded">
                  <div className="font-mono font-bold text-white">
                    {key === ' ' ? '␣' : key.toUpperCase()}
                  </div>
                  <div className={`text-xs font-semibold ${
                    stats.accuracy >= 90 ? 'text-green-400' :
                    stats.accuracy >= 75 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {stats.accuracy}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={clearAchievementNotification}
      />

      {/* Achievement Panel */}
      <AchievementPanel
        achievements={allAchievements}
        totalPoints={userProgress.totalPoints}
        level={userProgress.level}
        experiencePoints={userProgress.experiencePoints}
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onLogin={login}
        onClose={() => setShowLogin(false)}
        isLoading={isSyncing}
        error={syncError}
      />

      {/* Stats Panel */}
      <StatsPanel
        userProgress={userProgress}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentTheme={currentTheme}
        onThemeChange={changeTheme}
        availableThemes={getAllThemes()}
        isSoundEnabled={isSoundEnabled()}
        onToggleSound={toggleSound}
      />

      {/* Multiplayer Panel */}
      <MultiplayerPanel
        isOpen={showMultiplayer}
        onClose={() => setShowMultiplayer(false)}
        currentUser={currentUser}
        currentRoom={currentRoom}
        players={players}
        availableRooms={availableRooms}
        isConnected={isMultiplayerConnected}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
        onStartGame={startMultiplayerGame}
        onLoadRooms={loadAvailableRooms}
      />
      </div>
    </ThemeProvider>
  );
}