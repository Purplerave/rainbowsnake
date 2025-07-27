import { useRef, useCallback, useEffect } from 'react';

type SoundType = 'eat' | 'bonus' | 'gameover' | 'click' | 'slowdown' | 'eat_mp3' | 'gameover_mp3';

export const useSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const soundsLoadedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return null;
        }
    }
    // Attempt to resume the context if it's suspended. This is crucial for browser autoplay policies.
    if (audioContextRef.current.state === 'suspended') {
      console.log("Attempting to resume AudioContext...");
      audioContextRef.current.resume().then(() => {
        console.log("AudioContext resumed successfully.");
      }).catch(e => console.error("Error resuming AudioContext:", e));
    }
    return audioContextRef.current;
  }, []);

  const loadSound = useCallback(async (url: string, name: string) => {
    const context = getAudioContext();
    if (!context) return;

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
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    console.log(`playSound called for type: ${type}`);
    const context = getAudioContext();
    if (!context) {
      console.warn("No AudioContext available.");
      return;
    }

    // Load sounds only once, after the AudioContext is active due to user gesture
    if (!soundsLoadedRef.current) {
      console.log("First playSound call, loading MP3s...");
      loadSound('/sonido/bola_verde.mp3', 'eat_mp3');
      loadSound('/sonido/game_over.mp3', 'gameover_mp3');
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
  }, [getAudioContext, loadSound]);

  return { playSound };
}; // End of useSounds hook