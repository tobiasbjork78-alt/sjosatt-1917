export interface KeyStats {
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  startTime: number;
  currentTime: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  keyStats: Record<string, KeyStats>;
  currentCombo: number;
  maxCombo: number;
  comboPoints: number;
}

export interface GameState {
  isActive: boolean;
  isPaused: boolean;
  currentText: string;
  currentIndex: number;
  userInput: string;
  stats: GameStats;
  level: number;
  score: number;
}

export type GameMode = 'homerow' | 'words' | 'sentences' | 'code' | 'swedish' | 'numbers' | 'symbols' | 'beat';

export interface KeyboardKey {
  key: string;
  displayKey: string;
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  hand: 'left' | 'right';
  row: number;
  isHighlighted: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}