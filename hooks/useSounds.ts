import { useRef, useCallback } from 'react';

type SoundType = 'eat' | 'bonus' | 'gameover' | 'click' | 'slowdown';

export const useSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
    return audioContextRef.current;
  };

  const playSound = useCallback((type: SoundType) => {
    const context = getAudioContext();
    if (!context) return;

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
  }, []);

  return { playSound };
};