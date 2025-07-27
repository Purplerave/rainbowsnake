
import { useEffect, useRef, useCallback } from 'react';

export const useGameLoop = (callback: () => void, speed: number | null) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback((time: number) => {
    if (speed !== null) {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        if (deltaTime > speed) {
          previousTimeRef.current = time;
          callbackRef.current();
        }
      } else {
        previousTimeRef.current = time;
      }
    } else {
        // Reset previous time when paused to avoid a large jump when resuming
        previousTimeRef.current = undefined;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
};
