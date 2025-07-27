export enum GameState {
  MainMenu,
  GetReady,
  Playing,
  Paused,
  EnteringInitials,
  GameOver,
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export interface Coordinates {
  x: number;
  y: number;
}

export type ParticleType = 'food' | 'danger' | 'bonus' | 'slowdown';

export interface Particle {
  id: number;
  position: Coordinates;
  type: ParticleType;
  timer?: number; // Optional: time in milliseconds until particle disappears
}

export interface HighScore {
    score: number;
    date: string;
    initials: string;
}

export interface VisualEffect {
  id: number;
  type: 'particle-burst' | 'score-text';
  position: Coordinates;
  text?: string;
  color?: string;
}