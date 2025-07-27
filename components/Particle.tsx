

import React from 'react';
import { Particle as ParticleType } from '../types';
import { PARTICLE_STYLES } from '../constants';

interface ParticleProps {
  particle: ParticleType;
}

export const Particle: React.FC<ParticleProps> = ({ particle }) => {
  const style = {
    gridColumnStart: particle.position.x + 1,
    gridRowStart: particle.position.y + 1,
  };

  const colorClass = PARTICLE_STYLES[particle.type] || 'bg-gray-500';

  const shapeClass = particle.type === 'slowdown' ? 'skew-y-[30deg] w-[60%] h-[60%] rotate-45' : 'w-3/4 h-3/4 rounded-full';

  return (
    <div style={style} className="flex items-center justify-center">
      <div className={` ${shapeClass} ${colorClass} animate-pulse shadow-lg border-2 border-black/20`}></div>
    </div>
  );
};