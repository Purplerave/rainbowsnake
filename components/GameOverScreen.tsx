import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
  onSoundClick: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onMenu, onSoundClick }) => {
  
  const handleRestart = () => {
    onSoundClick();
    onRestart();
  };

  const handleMenu = () => {
    onSoundClick();
    onMenu();
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-8 text-center z-10">
      <h2 className="text-5xl font-bold text-red-500 mb-2" style={{textShadow: '2px 2px 0 rgba(0,0,0,0.3)'}}>Fin de la Partida</h2>
      <p className="text-2xl mb-6">Puntuación Final: <span className="font-bold text-yellow-300">{score}</span></p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
        >
          Jugar de Nuevo
        </button>
        <button
          onClick={handleMenu}
          className="px-6 py-3 bg-gradient-to-br from-gray-500 to-gray-700 text-white text-xl font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
        >
          Volver al Menú
        </button>
      </div>
    </div>
  );
};