'use client';

import { useCallback, useEffect, useRef } from 'react';

export type SoundType = 'correct' | 'incorrect' | 'complete' | 'achievement' | 'levelup' | 'combo';

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

export function useAudioFeedback() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const configRef = useRef<SoundConfig>({ enabled: true, volume: 0.3 });

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }, []);

  // Generate tone with specific frequency and duration
  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.3) => {
    if (!audioContextRef.current || !configRef.current.enabled) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * configRef.current.volume, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }, []);

  // Play chord (multiple frequencies)
  const playChord = useCallback((frequencies: number[], duration: number, volume: number = 0.2) => {
    frequencies.forEach(freq => {
      playTone(freq, duration, volume);
    });
  }, [playTone]);

  const playSound = useCallback((soundType: SoundType) => {
    if (!configRef.current.enabled) return;

    switch (soundType) {
      case 'correct':
        // Pleasant high tone
        playTone(800, 0.1, 0.2);
        break;

      case 'incorrect':
        // Lower, shorter tone
        playTone(200, 0.2, 0.3);
        break;

      case 'complete':
        // Success melody
        setTimeout(() => playTone(523, 0.15, 0.25), 0);   // C5
        setTimeout(() => playTone(659, 0.15, 0.25), 150); // E5
        setTimeout(() => playTone(784, 0.3, 0.3), 300);   // G5
        break;

      case 'achievement':
        // Achievement fanfare
        setTimeout(() => playChord([262, 330, 392], 0.2, 0.2), 0);   // C Major
        setTimeout(() => playChord([330, 415, 523], 0.2, 0.2), 200); // E Major
        setTimeout(() => playChord([392, 494, 659], 0.4, 0.25), 400); // G Major
        break;

      case 'levelup':
        // Level up ascending tones
        setTimeout(() => playTone(523, 0.12, 0.25), 0);   // C5
        setTimeout(() => playTone(659, 0.12, 0.25), 120); // E5
        setTimeout(() => playTone(784, 0.12, 0.25), 240); // G5
        setTimeout(() => playTone(1047, 0.3, 0.3), 360);  // C6
        break;

      case 'combo':
        // Quick rising tone for combo
        if (audioContextRef.current) {
          const now = audioContextRef.current.currentTime;
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);

          // Rising frequency
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.linearRampToValueAtTime(800, now + 0.15);

          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.2 * configRef.current.volume, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          oscillator.start(now);
          oscillator.stop(now + 0.15);
        }
        break;

      default:
        break;
    }
  }, [playTone, playChord]);

  const setEnabled = useCallback((enabled: boolean) => {
    configRef.current.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing-game-sound-enabled', enabled.toString());
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    configRef.current.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing-game-sound-volume', configRef.current.volume.toString());
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('typing-game-sound-enabled');
      const savedVolume = localStorage.getItem('typing-game-sound-volume');

      if (savedEnabled !== null) {
        configRef.current.enabled = savedEnabled === 'true';
      }
      if (savedVolume !== null) {
        configRef.current.volume = parseFloat(savedVolume) || 0.3;
      }
    }
  }, []);

  return {
    playSound,
    setEnabled,
    setVolume,
    isEnabled: configRef.current.enabled,
    volume: configRef.current.volume,
  };
}