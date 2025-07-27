import React from 'react';
import { Coordinates } from '../types';

interface SnakeSegmentProps {
  position: Coordinates;
  isHead: boolean;
  color: string;
  isBonusActive: boolean;
  isSlowedDown: boolean;
}

export const SnakeSegment: React.FC<SnakeSegmentProps> = ({ position, isHead, color, isBonusActive, isSlowedDown }) => {
  const style = {
    gridColumnStart: position.x + 1,
    gridRowStart: position.y + 1,
  };

  const bonusClasses = isBonusActive ? 'shadow-fuchsia-400/80 shadow-[0_0_10px] animate-pulse' : '';
  const slowdownClasses = isSlowedDown ? 'shadow-sky-400/80 shadow-[0_0_10px] animate-pulse' : '';

  return (
    <div
      style={style}
      className={`relative ${color} rounded-sm shadow-lg ${bonusClasses} ${slowdownClasses} transition-shadow duration-300`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
        <div className="absolute inset-0 border-2 border-t-white/40 border-l-white/40 border-b-black/40 border-r-black/40 rounded-sm"></div>
      {isHead && (
        <div className="absolute inset-0 flex items-center justify-evenly">
          <div className="w-1/4 h-1/4 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-1/2 h-1/2 bg-black rounded-full"></div>
          </div>
          <div className="w-1/4 h-1/4 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-1/2 h-1/2 bg-black rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};