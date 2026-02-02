'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, GameMode } from '@/types/game';
import { HOMEROW_TEXTS, WORD_LISTS, CODE_SNIPPETS, SWEDISH_SENTENCES } from '@/data/training-texts';
import { calculateScoreMultiplier, calculateComboPoints } from '@/data/achievements';

const initialStats: GameStats = {
  wpm: 0,
  accuracy: 0,
  startTime: 0,
  currentTime: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  keyStats: {},
  currentCombo: 0,
  maxCombo: 0,
  comboPoints: 0,
};

const initialGameState: GameState = {
  isActive: false,
  isPaused: false,
  currentText: '',
  currentIndex: 0,
  userInput: '',
  stats: initialStats,
  level: 1,
  score: 0,
};

export function useTypingGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameMode, setGameMode] = useState<GameMode>('homerow');
  const [lastKeyCorrect, setLastKeyCorrect] = useState<boolean | undefined>(undefined);

  // Generate text based on game mode
  const generateText = useCallback((mode: GameMode, level: number): string => {
    switch (mode) {
      case 'homerow':
        return HOMEROW_TEXTS[Math.min(level - 1, HOMEROW_TEXTS.length - 1)] || HOMEROW_TEXTS[0];

      case 'words':
        const wordCount = Math.min(5 + level, 25);
        // Mix different word types based on level
        let words = WORD_LISTS.basic;
        if (level >= 3) words = [...words, ...WORD_LISTS.programming.slice(0, 5)];
        if (level >= 5) words = [...words, ...WORD_LISTS.swedish.slice(0, 10)];
        if (level >= 7) words = [...words, ...WORD_LISTS.numbers.slice(0, 5)];

        return Array.from({ length: wordCount }, () =>
          words[Math.floor(Math.random() * words.length)]
        ).join(' ');

      case 'sentences':
        const sentences = SWEDISH_SENTENCES.slice(0, Math.min(level, SWEDISH_SENTENCES.length));
        return sentences[Math.floor(Math.random() * sentences.length)] || SWEDISH_SENTENCES[0];

      case 'code':
        const codeCount = Math.min(level, CODE_SNIPPETS.length);
        return CODE_SNIPPETS.slice(0, codeCount).join('\n');

      case 'swedish':
        const swedishCount = Math.min(2 + level, SWEDISH_SENTENCES.length);
        return SWEDISH_SENTENCES.slice(0, swedishCount).join(' ');

      case 'numbers':
        const numberCount = Math.min(8 + level * 2, 20);
        const numberWords = WORD_LISTS.numbers;
        return Array.from({ length: numberCount }, () =>
          numberWords[Math.floor(Math.random() * numberWords.length)]
        ).join(' ');

      case 'symbols':
        const symbolCount = Math.min(5 + level, 15);
        const symbolWords = WORD_LISTS.symbols;
        return Array.from({ length: symbolCount }, () =>
          symbolWords[Math.floor(Math.random() * symbolWords.length)]
        ).join(' ');

      default:
        return HOMEROW_TEXTS[0];
    }
  }, []);

  // Calculate WPM with more precision
  const calculateWPM = useCallback((stats: GameStats): number => {
    if (stats.currentTime === 0 || stats.startTime === 0) return 0;
    const timeInMinutes = (stats.currentTime - stats.startTime) / (1000 * 60);

    // Calculate words as characters typed divided by 5 (standard)
    const charactersTyped = stats.correctKeystrokes;
    const wordsTyped = charactersTyped / 5;

    return timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
  }, []);

  // Calculate accuracy percentage
  const calculateAccuracy = useCallback((stats: GameStats): number => {
    if (stats.totalKeystrokes === 0) return 100;
    return Math.round((stats.correctKeystrokes / stats.totalKeystrokes) * 100);
  }, []);

  // Update key statistics
  const updateKeyStats = useCallback((key: string, isCorrect: boolean) => {
    setGameState(prev => {
      const newKeyStats = { ...prev.stats.keyStats };

      if (!newKeyStats[key]) {
        newKeyStats[key] = { correct: 0, incorrect: 0, accuracy: 0 };
      }

      if (isCorrect) {
        newKeyStats[key].correct++;
      } else {
        newKeyStats[key].incorrect++;
      }

      const total = newKeyStats[key].correct + newKeyStats[key].incorrect;
      newKeyStats[key].accuracy = total > 0 ? Math.round((newKeyStats[key].correct / total) * 100) : 0;

      return {
        ...prev,
        stats: {
          ...prev.stats,
          keyStats: newKeyStats,
        },
      };
    });
  }, []);

  // Update overall stats
  const updateStats = useCallback((isCorrect: boolean, key: string) => {
    setGameState(prev => {
      const now = Date.now();
      const newStats = {
        ...prev.stats,
        currentTime: now,
        totalKeystrokes: prev.stats.totalKeystrokes + 1,
        correctKeystrokes: prev.stats.correctKeystrokes + (isCorrect ? 1 : 0),
        // Update combo
        currentCombo: isCorrect ? prev.stats.currentCombo + 1 : 0,
        maxCombo: isCorrect ? Math.max(prev.stats.maxCombo, prev.stats.currentCombo + 1) : prev.stats.maxCombo,
      };

      newStats.wpm = calculateWPM(newStats);
      newStats.accuracy = calculateAccuracy(newStats);

      // Calculate combo points
      const comboBonus = isCorrect ? calculateComboPoints(newStats.currentCombo) : 0;
      newStats.comboPoints = prev.stats.comboPoints + comboBonus;

      const scoreMultiplier = calculateScoreMultiplier(newStats.wpm, newStats.accuracy, prev.level, newStats.currentCombo);
      const basePoints = isCorrect ? 10 : 0;
      const multipliedScore = Math.floor(basePoints * scoreMultiplier);

      return {
        ...prev,
        stats: newStats,
        score: prev.score + multipliedScore + comboBonus,
      };
    });

    // Update individual key statistics
    updateKeyStats(key, isCorrect);
  }, [calculateWPM, calculateAccuracy, updateKeyStats]);

  // Start a new game
  const startGame = useCallback((mode?: GameMode, level?: number) => {
    const selectedMode = mode || gameMode;
    const selectedLevel = level || gameState.level;
    const text = generateText(selectedMode, selectedLevel);

    const now = Date.now();
    setGameState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      currentText: text,
      currentIndex: 0,
      userInput: '',
      level: selectedLevel,
      stats: {
        ...initialStats,
        startTime: now,
        currentTime: now,
      },
    }));

    if (mode) setGameMode(mode);
    setLastKeyCorrect(undefined);
  }, [gameMode, gameState.level, generateText]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setLastKeyCorrect(undefined);
  }, []);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameState.isActive || gameState.isPaused) return;

    const key = event.key;
    const currentChar = gameState.currentText[gameState.currentIndex];

    // Prevent default for most keys except development tools
    if (key !== 'F12' && key !== 'F5' && !event.ctrlKey) {
      event.preventDefault();
    }

    // Skip if it's a modifier key
    if (key.length > 1 && key !== 'Space' && key !== 'Backspace') {
      return;
    }

    const keyToCheck = key === 'Space' ? ' ' : key;
    const isCorrect = keyToCheck === currentChar;

    setLastKeyCorrect(isCorrect);
    updateStats(isCorrect, keyToCheck);

    if (isCorrect) {
      const newIndex = gameState.currentIndex + 1;
      const newInput = gameState.userInput + keyToCheck;

      setGameState(prev => ({
        ...prev,
        currentIndex: newIndex,
        userInput: newInput,
        isActive: newIndex < prev.currentText.length,
      }));

      // Check if level complete
      if (newIndex >= gameState.currentText.length) {
        const finalWpm = gameState.stats.wpm;
        const finalAccuracy = gameState.stats.accuracy;

        // Level up if performance is good
        setTimeout(() => {
          const shouldLevelUp = finalWpm >= 15 + (gameState.level * 5) && finalAccuracy >= 85;
          if (shouldLevelUp) {
            setGameState(prev => ({
              ...prev,
              level: prev.level + 1,
            }));
          }

          const message = shouldLevelUp
            ? `Utmärkt! Nivå ${gameState.level + 1} upplåst!\nWPM: ${finalWpm}\nNoggrannhet: ${finalAccuracy}%`
            : `Bra jobbat!\nWPM: ${finalWpm}\nNoggrannhet: ${finalAccuracy}%\nTräna mer för att nå nästa nivå!`;

          alert(message);
        }, 100);
      }
    }
  }, [gameState.isActive, gameState.isPaused, gameState.currentIndex, gameState.currentText, gameState.userInput, gameState.stats.wpm, gameState.stats.accuracy, gameState.level, updateStats]);

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Current character and progress
  const nextKey = gameState.currentIndex < gameState.currentText.length
    ? gameState.currentText[gameState.currentIndex]
    : '';

  const progress = gameState.currentText.length > 0
    ? (gameState.currentIndex / gameState.currentText.length) * 100
    : 0;

  // Get problematic keys (lowest accuracy)
  const problematicKeys = Object.entries(gameState.stats.keyStats)
    .filter(([_, stats]) => stats.accuracy < 80 && (stats.correct + stats.incorrect) >= 3)
    .sort(([_, a], [__, b]) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(([key]) => key);

  return {
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
  };
}