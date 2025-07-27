import React from 'react';

interface PauseScreenProps {
  onResume: () => void;
  onMenu: () => void;
  onSoundClick: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onMenu, onSoundClick }) => {
  
  const handleResume = () => {
    onSoundClick();
    onResume();
  };

  const handleMenu = () => {
    onSoundClick();
    onMenu();
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-8 text-center z-10">
      <h2 className="text-5xl font-bold text-cyan-300 mb-6" style={{textShadow: '2px 2px 0 rgba(0,0,0,0.3)'}}>Juego Pausado</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleResume}
          className="px-6 py-3 bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
        >
          Reanudar
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
