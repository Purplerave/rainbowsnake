

import { Coordinates, Direction } from './types';

export const GRID_SIZE = 18;
export const INITIAL_SNAKE: Coordinates[] = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];
export const INITIAL_SPEED = 200; // ms per tick
export const SPEED_INCREMENT = 5; // ms to decrease per food item

export const POINTS_PER_FOOD = 10;
export const BONUS_MULTIPLIER = 2;
export const BONUS_DURATION_MS = 10000; // 10 seconds

export const SLOWDOWN_FACTOR = 1.5; // speed will be multiplied by this
export const SLOWDOWN_DURATION_MS = 8000; // 8 seconds
export const DANGER_DURATION_MS = 5000; // 5 seconds

export const HIGH_SCORE_COUNT = 10;

export const SNAKE_COLORS = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-yellow-400',
    'bg-teal-400',
    'bg-cyan-400',
    'bg-emerald-500',
];

export const PARTICLE_STYLES: { [key: string]: string } = {
    food: 'bg-lime-500',
    danger: 'bg-red-600',
    bonus: 'bg-amber-400',
    slowdown: 'bg-sky-400'
};