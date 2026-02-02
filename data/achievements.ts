import { Achievement } from '@/types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Speed achievements
  {
    id: 'first_steps',
    name: 'Första stegen',
    description: 'Nå 10 WPM',
    icon: '👶',
    condition: (gameState) => gameState.stats.wpm >= 10,
    unlocked: false,
    category: 'speed',
    points: 100,
  },
  {
    id: 'getting_faster',
    name: 'Blir snabbare',
    description: 'Nå 20 WPM',
    icon: '🚀',
    condition: (gameState) => gameState.stats.wpm >= 20,
    unlocked: false,
    category: 'speed',
    points: 200,
  },
  {
    id: 'speed_demon',
    name: 'Hastighetsdämon',
    description: 'Nå 40 WPM',
    icon: '⚡',
    condition: (gameState) => gameState.stats.wpm >= 40,
    unlocked: false,
    category: 'speed',
    points: 500,
  },
  {
    id: 'lightning_fingers',
    name: 'Blixtsnabba fingrar',
    description: 'Nå 60 WPM',
    icon: '🔥',
    condition: (gameState) => gameState.stats.wpm >= 60,
    unlocked: false,
    category: 'speed',
    points: 1000,
  },

  // Accuracy achievements
  {
    id: 'precise_starter',
    name: 'Noggrann nybörjare',
    description: 'Nå 80% noggrannhet',
    icon: '🎯',
    condition: (gameState) => gameState.stats.accuracy >= 80,
    unlocked: false,
    category: 'accuracy',
    points: 150,
  },
  {
    id: 'accuracy_master',
    name: 'Noggrannhetsmästare',
    description: 'Nå 95% noggrannhet',
    icon: '🏆',
    condition: (gameState) => gameState.stats.accuracy >= 95,
    unlocked: false,
    category: 'accuracy',
    points: 300,
  },
  {
    id: 'perfectionist',
    name: 'Perfektionist',
    description: 'Nå 100% noggrannhet på en hel text',
    icon: '💎',
    condition: (gameState) => gameState.stats.accuracy === 100 && gameState.currentIndex > 50,
    unlocked: false,
    category: 'accuracy',
    points: 750,
  },

  // Level achievements
  {
    id: 'level_5',
    name: 'Femte nivån',
    description: 'Nå nivå 5',
    icon: '🎖️',
    condition: (gameState) => gameState.level >= 5,
    unlocked: false,
    category: 'persistence',
    points: 400,
  },
  {
    id: 'level_10',
    name: 'Tionde nivån',
    description: 'Nå nivå 10',
    icon: '🏅',
    condition: (gameState) => gameState.level >= 10,
    unlocked: false,
    category: 'persistence',
    points: 800,
  },

  // Special achievements
  {
    id: 'homerow_hero',
    name: 'Hemradshjälte',
    description: 'Klara hemradsträning med 90%+ noggrannhet',
    icon: '🦸',
    condition: (gameState) => gameState.stats.accuracy >= 90 && !gameState.isActive,
    unlocked: false,
    category: 'special',
    points: 250,
  },
  {
    id: 'code_warrior',
    name: 'Kodkrigare',
    description: 'Klara kodträning med 85%+ noggrannhet',
    icon: '⚔️',
    condition: (gameState) => gameState.stats.accuracy >= 85 && !gameState.isActive,
    unlocked: false,
    category: 'special',
    points: 350,
  },
  {
    id: 'swedish_scholar',
    name: 'Svenskalärare',
    description: 'Klara svenska texter med 90%+ noggrannhet',
    icon: '🇸🇪',
    condition: (gameState) => gameState.stats.accuracy >= 90 && !gameState.isActive,
    unlocked: false,
    category: 'special',
    points: 300,
  },

  // New combo and streak achievements
  {
    id: 'combo_master',
    name: 'Kombomästare',
    description: 'Träffa 25 tangenter i rad utan fel',
    icon: '🔥',
    condition: (gameState) => gameState.stats.currentCombo >= 25,
    unlocked: false,
    category: 'special',
    points: 400,
  },
  {
    id: 'speed_burst',
    name: 'Hastighetsskur',
    description: 'Nå 80 WPM',
    icon: '💨',
    condition: (gameState) => gameState.stats.wpm >= 80,
    unlocked: false,
    category: 'speed',
    points: 1500,
  },
  {
    id: 'endurance_master',
    name: 'Uthållighetsmaström',
    description: 'Genomför 10 sessioner på en dag',
    icon: '⏱️',
    condition: () => false, // Will be handled separately in useAchievements
    unlocked: false,
    category: 'persistence',
    points: 600,
  },
  {
    id: 'flawless_victory',
    name: 'Felfri seger',
    description: 'Genomför hela texten utan ett enda fel',
    icon: '👑',
    condition: (gameState) => gameState.stats.accuracy === 100 && gameState.stats.totalKeystrokes > 100 && !gameState.isActive,
    unlocked: false,
    category: 'accuracy',
    points: 1000,
  },
  {
    id: 'number_ninja',
    name: 'Sifferninja',
    description: 'Klara sifferträning med 90%+ noggrannhet',
    icon: '🔢',
    condition: (gameState) => gameState.stats.accuracy >= 90 && !gameState.isActive,
    unlocked: false,
    category: 'special',
    points: 400,
  },
  {
    id: 'symbol_master',
    name: 'Symbolmästare',
    description: 'Klara symbolträning med 85%+ noggrannhet',
    icon: '⚡',
    condition: (gameState) => gameState.stats.accuracy >= 85 && !gameState.isActive,
    unlocked: false,
    category: 'special',
    points: 500,
  },
];

export const calculateLevelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getXPForNextLevel = (currentLevel: number): number => {
  return Math.pow(currentLevel, 2) * 100;
};

export const calculateScoreMultiplier = (wpm: number, accuracy: number, level: number, combo: number = 0): number => {
  const speedBonus = Math.max(1, wpm / 10);
  const accuracyBonus = accuracy / 100;
  const levelBonus = 1 + (level * 0.1);
  const comboBonus = 1 + Math.min(combo / 100, 2); // Up to 3x multiplier for 200+ combo

  return speedBonus * accuracyBonus * levelBonus * comboBonus;
};

export const calculateComboPoints = (combo: number): number => {
  if (combo < 10) return 0;
  if (combo < 25) return Math.floor(combo / 10) * 5;
  if (combo < 50) return Math.floor(combo / 10) * 10;
  return Math.floor(combo / 10) * 20;
};