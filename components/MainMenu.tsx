import React from 'react';
import { HighScore } from '../types';
import { PARTICLE_STYLES, HIGH_SCORE_COUNT } from '../constants';

interface MainMenuProps {
  onStart: () => void;
  highScores: HighScore[];
  onSoundClick: () => void;
}

const ParticleLegend = () => (
    <div className="mt-6 text-left w-full max-w-xs">
        <h3 className="font-bold text-lg mb-2">Leyenda de Partículas</h3>
        <ul className="space-y-2">
            <li className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${PARTICLE_STYLES.food} flex-shrink-0 border-2 border-black/20`}></div>
                <span>Crece y aumenta la velocidad</span>
            </li>
            <li className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${PARTICLE_STYLES.danger} flex-shrink-0 border-2 border-black/20`}></div>
                <span>Fin del juego. ¡Evítalas!</span>
            </li>
            <li className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${PARTICLE_STYLES.bonus} flex-shrink-0 border-2 border-black/20`}></div>
                <span>Puntuación x2 (temporal)</span>
            </li>
            <li className="flex items-center justify-start gap-3">
                <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center`}>
                    <div className={`skew-y-[30deg] w-[80%] h-[80%] rotate-45 ${PARTICLE_STYLES.slowdown} border-2 border-black/20`}></div>
                </div>
                <span>Ralentiza el tiempo</span>
            </li>
        </ul>
    </div>
);

const ControlsLegend = () => (
    <div className="mt-6 text-left w-full max-w-xs">
        <h3 className="font-bold text-lg mb-2">Controles del Juego</h3>
        <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
                <span className="font-mono bg-slate-700/80 px-2 py-1 rounded">↑↓←→ / WASD</span>
                <span>Moverse</span>
            </li>
            <li className="flex items-center gap-3">
                <span className="font-mono bg-slate-700/80 px-2 py-1 rounded">P / ESC</span>
                <span>Pausar el juego</span>
            </li>
        </ul>
    </div>
);

const HighScoreTable: React.FC<{scores: HighScore[]}> = ({ scores }) => (
    <div className="mt-6 text-left w-full max-w-xs">
        <h3 className="font-bold text-lg mb-2">Mejores {HIGH_SCORE_COUNT} Puntuaciones</h3>
        {scores.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-1">#</th>
                  <th className="pb-1">Iniciales</th>
                  <th className="pb-1 text-right">Puntos</th>
                  <th className="pb-1 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                    <tr key={index} className="border-t border-white/10">
                        <td className="py-1">{index + 1}</td>
                        <td className="py-1 font-bold">{score.initials}</td>
                        <td className="py-1 text-right">{score.score.toLocaleString()}</td>
                        <td className="py-1 text-white/60 text-sm text-right">{new Date(score.date).toLocaleDateString()}</td>
                    </tr>
                ))}
              </tbody>
            </table>
        ) : (
            <p className="text-white/70">Sin puntuaciones. ¡Sé el primero!</p>
        )}
    </div>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScores, onSoundClick }) => {
  
  const handleStartClick = () => {
    onSoundClick();
    onStart();
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full">
      <button
        onClick={handleStartClick}
        className="px-8 py-4 bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl font-bold rounded-lg shadow-xl hover:scale-105 transform transition-transform duration-200 mb-8"
      >
        Iniciar Juego
      </button>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 w-full max-w-5xl justify-center md:justify-between items-center md:items-start">
         <div className="flex flex-col items-center md:items-start">
            <ParticleLegend />
            <ControlsLegend />
         </div>
         <HighScoreTable scores={highScores} />
      </div>
    </div>
  );
};