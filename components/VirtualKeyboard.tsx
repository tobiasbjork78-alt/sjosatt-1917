'use client';

import { KeyboardKey } from '@/types/game';
import { useMemo } from 'react';

interface VirtualKeyboardProps {
  nextKey?: string;
  lastKeyCorrect?: boolean;
  className?: string;
}

const KEYBOARD_LAYOUT = [
  // Top row (numbers)
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  // Top letter row
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  // Home row
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  // Bottom row
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

const FINGER_COLORS = {
  'left-pinky': 'bg-red-500/20 border-red-400',
  'left-ring': 'bg-orange-500/20 border-orange-400',
  'left-middle': 'bg-yellow-500/20 border-yellow-400',
  'left-index': 'bg-green-500/20 border-green-400',
  'left-thumb': 'bg-blue-500/20 border-blue-400',
  'right-thumb': 'bg-blue-500/20 border-blue-400',
  'right-index': 'bg-green-500/20 border-green-400',
  'right-middle': 'bg-yellow-500/20 border-yellow-400',
  'right-ring': 'bg-orange-500/20 border-orange-400',
  'right-pinky': 'bg-red-500/20 border-red-400',
};

const getKeyFinger = (key: string, position: number): keyof typeof FINGER_COLORS => {
  // Home row finger assignments
  const homeRowAssignments: Record<string, keyof typeof FINGER_COLORS> = {
    'a': 'left-pinky', 's': 'left-ring', 'd': 'left-middle', 'f': 'left-index',
    'g': 'left-index', 'h': 'right-index', 'j': 'right-index', 'k': 'right-middle',
    'l': 'right-ring', ';': 'right-pinky'
  };

  if (homeRowAssignments[key]) {
    return homeRowAssignments[key];
  }

  // For other rows, use position-based assignment
  if (position <= 1) return 'left-pinky';
  if (position <= 2) return 'left-ring';
  if (position <= 3) return 'left-middle';
  if (position <= 4) return 'left-index';
  if (position <= 5) return 'right-index';
  if (position <= 7) return 'right-middle';
  if (position <= 8) return 'right-ring';
  return 'right-pinky';
};

export default function VirtualKeyboard({ nextKey, lastKeyCorrect, className }: VirtualKeyboardProps) {
  const keys = useMemo(() => {
    return KEYBOARD_LAYOUT.flat().map(key => ({
      key,
      finger: getKeyFinger(key, KEYBOARD_LAYOUT.findIndex(row => row.includes(key))),
      isNext: nextKey === key,
      isCorrect: lastKeyCorrect === true && nextKey === key,
      isIncorrect: lastKeyCorrect === false && nextKey === key,
    }));
  }, [nextKey, lastKeyCorrect]);

  const getKeyClasses = (key: typeof keys[0]) => {
    let classes = 'relative transition-all duration-200 rounded-lg border-2 p-2 md:p-3 text-center font-mono font-bold text-sm md:text-base min-w-[2.5rem] md:min-w-[3rem] h-10 md:h-12 flex items-center justify-center ';

    // Base finger color
    classes += FINGER_COLORS[key.finger] + ' ';

    // State-based highlighting
    if (key.isNext) {
      classes += 'ring-4 ring-white ring-opacity-80 scale-110 shadow-lg shadow-white/30 ';
    }

    if (key.isCorrect) {
      classes += 'bg-green-400/40 border-green-300 ';
    } else if (key.isIncorrect) {
      classes += 'bg-red-400/40 border-red-300 animate-pulse ';
    }

    return classes;
  };

  return (
    <div className={`bg-black/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 ${className}`}>
      <div className="space-y-2 md:space-y-3">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
            {row.map((keyChar) => {
              const key = keys.find(k => k.key === keyChar)!;
              return (
                <div
                  key={keyChar}
                  className={getKeyClasses(key)}
                >
                  {keyChar.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}

        {/* Spacebar */}
        <div className="flex justify-center mt-4">
          <div
            className={`${nextKey === ' ' ? 'ring-4 ring-white ring-opacity-80 scale-105' : ''} ${FINGER_COLORS['left-thumb']} transition-all duration-200 rounded-lg border-2 p-2 md:p-3 text-center font-mono font-bold min-w-[12rem] md:min-w-[16rem] h-10 md:h-12 flex items-center justify-center`}
          >
            SPACE
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/20 border border-red-400 rounded"></div>
          <span>Lillfinger</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500/20 border border-orange-400 rounded"></div>
          <span>Ringfinger</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-400 rounded"></div>
          <span>Långfinger</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/20 border border-green-400 rounded"></div>
          <span>Pekfinger</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500/20 border border-blue-400 rounded"></div>
          <span>Tumme</span>
        </div>
      </div>
    </div>
  );
}