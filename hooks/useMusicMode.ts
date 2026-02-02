'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface MusicModeConfig {
  isEnabled: boolean;
  reverb: boolean;
  volume: number;
}

// Pentatonic scale frequencies (Hz)
const PENTATONIC_SCALE = {
  'a': 261.63, // C4
  's': 293.66, // D4
  'd': 329.63, // E4
  'f': 392.00, // G4
  'j': 440.00, // A4
  'k': 523.25, // C5 (higher octave)
  'l': 587.33, // D5 (higher octave)
  ';': 659.25, // E5 (higher octave)
};

// Dissonant tone for wrong keys (half-step down)
const DISSONANT_FREQ = 246.94; // B3

export function useMusicMode() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [config, setConfig] = useState<MusicModeConfig>({
    isEnabled: false,
    reverb: false,
    volume: 0.3,
  });

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create reverb effect
  const createReverb = useCallback(() => {
    if (!audioContextRef.current) return null;

    const convolver = audioContextRef.current.createConvolver();
    const length = audioContextRef.current.sampleRate * 2; // 2 seconds
    const impulse = audioContextRef.current.createBuffer(2, length, audioContextRef.current.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.5);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }, []);

  // Play tone for correct key
  const playTone = useCallback((key: string, isCorrect: boolean = true, combo: number = 0) => {
    if (!config.isEnabled || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    // Resume audio context if suspended (Chrome requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Determine frequency
    const frequency = isCorrect
      ? PENTATONIC_SCALE[key.toLowerCase() as keyof typeof PENTATONIC_SCALE] || PENTATONIC_SCALE['a']
      : DISSONANT_FREQ;

    // Set up oscillator (synthwave sound)
    oscillator.type = 'sawtooth'; // Synthwave characteristic
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set up gain (volume envelope)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Release

    // Connect nodes
    let finalNode: AudioNode = gainNode;

    // Add reverb for high combos
    if (config.reverb && combo >= 10) {
      const reverb = createReverb();
      if (reverb) {
        gainNode.connect(reverb);
        reverb.connect(audioContext.destination);
        finalNode = reverb;
      }
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    return oscillator;
  }, [config, createReverb]);

  // Play chord for perfect line
  const playBonusChord = useCallback(() => {
    if (!config.isEnabled || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const chordFreqs = [261.63, 329.63, 392.00]; // C-E-G major chord

    chordFreqs.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'triangle'; // Softer sound for chord
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(config.volume * 0.7, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      }, index * 100); // Slight delay between chord notes
    });
  }, [config]);

  // Enable/disable beat mode
  const toggleBeatMode = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, isEnabled: enabled }));
  }, []);

  // Toggle reverb effect
  const toggleReverb = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, reverb: enabled }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // Check if key is in pentatonic scale
  const isMusicalKey = useCallback((key: string): boolean => {
    return key.toLowerCase() in PENTATONIC_SCALE;
  }, []);

  return {
    config,
    playTone,
    playBonusChord,
    toggleBeatMode,
    toggleReverb,
    setVolume,
    isMusicalKey,
    isSupported: !!audioContextRef.current,
  };
}