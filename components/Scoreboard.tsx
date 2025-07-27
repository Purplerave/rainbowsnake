

import React from 'react';

interface ScoreboardProps {
  score: number;
  highScore: number;
  multiplier: number;
  multiplierTimer: number;
  slowdownTimer: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ score, highScore, multiplier, multiplierTimer, slowdownTimer }) => {
  return (
    <div className="w-full max-w-md bg-black/20 p-3 rounded-lg shadow-lg mb-4 text-center">
      <div className="flex justify-around items-center">
        <div>
          <span className="text-lg opacity-80">Puntuación</span>
          <p className="text-3xl font-bold">{score}</p>
        </div>
        <div>
          <span className="text-lg opacity-80">Récord</span>
          <p className="text-3xl font-bold">{highScore}</p>
        </div>
      </div>
       <div className="mt-2 text-xl font-bold h-7 flex items-center justify-center gap-4">
        {multiplier > 1 && (
            <span className="text-fuchsia-300 animate-pulse">
                x{multiplier} ¡BONUS! ({multiplierTimer.toFixed(0)}s)
            </span>
        )}
        {slowdownTimer > 0 && (
            <span className="text-sky-300 animate-pulse">
                ¡LENTO! ({slowdownTimer.toFixed(0)}s)
            </span>
        )}
       </div>
    </div>
  );
};