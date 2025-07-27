import React from 'react';
import { SnakeSegment } from './SnakeSegment';
import { Particle as ParticleComponent } from './Particle';
import { Coordinates, Particle } from '../types';
import { GRID_SIZE, SNAKE_COLORS } from '../constants';

interface GameBoardProps {
  snake: Coordinates[];
  particles: Particle[];
  isBonusActive: boolean;
  isSlowedDown: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ snake, particles, isBonusActive, isSlowedDown }) => {
  return (
    <div
      className="grid bg-slate-900/50 backdrop-blur-sm border-2 border-cyan-400/30 shadow-lg rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        width: '100%',
        height: '100%',
      }}
    >
      {snake.map((segment, index) => (
        <SnakeSegment
          key={index}
          position={segment}
          isHead={index === 0}
          color={index === 0 ? 'bg-blue-500' : SNAKE_COLORS[index % SNAKE_COLORS.length]}
          isBonusActive={isBonusActive}
          isSlowedDown={isSlowedDown}
        />
      ))}
      {particles.map((particle) => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </div>
  );
};