import { useRef, useCallback } from 'react';

type SoundType = 'eat' | 'bonus' | 'gameover' | 'click' | 'slowdown' | 'eat_mp3' | 'gameover_mp3';

export const useSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const soundsLoadedRef = useRef(false);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return; // Already initialized

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("AudioContext created.");
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
      return;
    }

    // Attempt to resume the context if it's suspended.
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log("AudioContext resumed successfully.");
      } catch (e) {
        console.error("Error resuming AudioContext:", e);
        return;
      }
    }

    // Load sounds only once, after the AudioContext is active due to user gesture
    if (!soundsLoadedRef.current) {
      console.log("Loading MP3s...");
      await loadSound('/sonido/bola_verde.mp3', 'eat_mp3');
      await loadSound('/sonido/game_over.mp3', 'gameover_mp3');
      soundsLoadedRef.current = true;
      console.log("MP3s loaded.");
    }
  }, []);

  const loadSound = useCallback(async (url: string, name: string) => {
    const context = audioContextRef.current; // Use the already created context
    if (!context) {
      console.warn("AudioContext not available for loading sound.");
      return;
    }

    console.log(`Loading sound: ${url} as ${name}`);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      audioBuffersRef.current.set(name, audioBuffer);
      console.log(`Sound loaded: ${name}`);
    } catch (e) {
      console.error(`Error loading sound ${url}:`, e);
    }
  }, []); // No dependency on getAudioContext anymore

  const playSound = useCallback(async (type: SoundType) => {
    console.log(`playSound called for type: ${type}`);
    const context = audioContextRef.current;
    if (!context) {
      console.warn("No AudioContext available.");
      return;
    }

    // Ensure context is running before proceeding
    if (context.state === 'suspended') {
      try {
        await context.resume(); // Await the resume
        console.log("AudioContext resumed successfully within playSound.");
      } catch (e) {
        console.error("Error resuming AudioContext in playSound:", e);
        return; // Don't proceed if resume fails
      }
    }

    // Load sounds only once, after the AudioContext is active due to user gesture
    if (!soundsLoadedRef.current) {
      console.log("First playSound call, loading MP3s...");
      // Await these loadSound calls
      await loadSound('/sonido/bola_verde.mp3', 'eat_mp3');
      await loadSound('/sonido/game_over.mp3', 'gameover_mp3');
      soundsLoadedRef.current = true;
    }

    if (type === 'eat_mp3' || type === 'gameover_mp3') {
      const buffer = audioBuffersRef.current.get(type);
      if (buffer) {
        console.log(`Playing MP3: ${type}`);
        const source = context.createBufferSource(); // Create a new source each time
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      } else {
        console.warn(`Audio buffer for ${type} not loaded yet. Playing fallback.`);
        // Fallback to programmatic sound if MP3 not loaded yet
        if (type === 'eat_mp3') playSound('eat');
        if (type === 'gameover_mp3') playSound('gameover');
      }
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
    
    switch (type) {
      case 'eat':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, context.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);
        break;
      case 'bonus':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.linearRampToValueAtTime(1046.50, context.currentTime + 0.2); // C6
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.2);
        break;
      case 'slowdown':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        oscillator.frequency.linearRampToValueAtTime(220, context.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
        break;
      case 'gameover':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(164.81, context.currentTime); // E3
        oscillator.frequency.linearRampToValueAtTime(82.41, context.currentTime + 0.25); // E2
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.25);
        break;
      case 'click':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
        break;
    }

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }, []); // No dependency on getAudioContext anymore

  return { playSound, initAudio };
}; // End of useSounds hook