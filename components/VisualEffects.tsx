import React from 'react';
import { VisualEffect } from '../types';
import { GRID_SIZE } from '../constants';

interface VisualEffectsProps {
  effects: VisualEffect[];
  onRemove: (id: number) => void;
}

const Effect: React.FC<{ effect: VisualEffect; onRemove: (id: number) => void }> = ({ effect, onRemove }) => {
  const style = {
    gridColumnStart: effect.position.x + 1,
    gridRowStart: effect.position.y + 1,
  };
  
  const handleAnimationEnd = () => {
    onRemove(effect.id);
  };

  if (effect.type === 'particle-burst') {
    return (
      <div style={style} className="flex items-center justify-center pointer-events-none">
        <div className={`particle-burst w-full h-full rounded-full border-2 ${effect.color}`} onAnimationEnd={handleAnimationEnd}></div>
      </div>
    );
  }

  if (effect.type === 'score-text') {
    return (
      <div style={style} className="flex items-center justify-center pointer-events-none">
        <div className="score-text-anim text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px black' }} onAnimationEnd={handleAnimationEnd}>
          {effect.text}
        </div>
      </div>
    );
  }

  return null;
};

export const VisualEffects: React.FC<VisualEffectsProps> = ({ effects, onRemove }) => {
  return (
    <div
      className="absolute inset-0 grid pointer-events-none"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
      }}
    >
      {effects.map(effect => (
        <Effect key={effect.id} effect={effect} onRemove={onRemove} />
      ))}
    </div>
  );
};
