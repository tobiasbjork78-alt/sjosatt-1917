'use client';

import { useEffect, useCallback, useRef } from 'react';

type SoundType = 'keypress' | 'error' | 'success' | 'combo' | 'levelup' | 'achievement';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }

      // Load sound preference from localStorage
      const soundEnabled = localStorage.getItem('typing-game-sound-enabled');
      soundEnabledRef.current = soundEnabled !== 'false';
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create a sound using Web Audio API
  const createSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!audioContextRef.current || !soundEnabledRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Error creating sound:', error);
    }
  }, []);

  // Play specific sound effects
  const playSound = useCallback((soundType: SoundType, combo?: number) => {
    switch (soundType) {
      case 'keypress':
        // Subtle click sound for correct keystrokes
        createSound(800, 0.1, 'square', 0.15);
        break;

      case 'error':
        // Lower, harsher sound for errors
        createSound(200, 0.2, 'sawtooth', 0.2);
        break;

      case 'success':
        // Pleasant chord for completion
        createSound(523, 0.3, 'sine', 0.2); // C
        setTimeout(() => createSound(659, 0.3, 'sine', 0.2), 100); // E
        setTimeout(() => createSound(784, 0.3, 'sine', 0.2), 200); // G
        break;

      case 'combo':
        // Rising tone for combo milestones
        const comboFreq = 400 + ((combo || 0) * 10);
        createSound(comboFreq, 0.15, 'triangle', 0.25);
        break;

      case 'levelup':
        // Triumphant sound for level up
        [262, 330, 392, 523, 659].forEach((freq, index) => {
          setTimeout(() => createSound(freq, 0.4, 'sine', 0.3), index * 100);
        });
        break;

      case 'achievement':
        // Special sound for achievements
        [440, 554, 659, 880].forEach((freq, index) => {
          setTimeout(() => createSound(freq, 0.5, 'sine', 0.25), index * 150);
        });
        break;

      default:
        break;
    }
  }, [createSound]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing-game-sound-enabled', soundEnabledRef.current.toString());
    }
  }, []);

  // Get current sound state
  const isSoundEnabled = useCallback(() => soundEnabledRef.current, []);

  return {
    playSound,
    toggleSound,
    isSoundEnabled,
  };
}