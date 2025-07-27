import React, { useState, FormEvent, useEffect, useRef } from 'react';

interface InitialEntryScreenProps {
  score: number;
  onSave: (initials: string) => void;
  onSoundClick: () => void;
}

export const InitialEntryScreen: React.FC<InitialEntryScreenProps> = ({ score, onSave, onSoundClick }) => {
  const [initials, setInitials] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (initials.trim().length > 0) {
      onSoundClick();
      onSave(initials.trim().toUpperCase());
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-8 text-center z-10">
      <h2 className="text-5xl font-bold text-yellow-300 mb-2" style={{textShadow: '2px 2px 0 rgba(0,0,0,0.3)'}}>¡Nuevo Récord!</h2>
      <p className="text-2xl mb-6">Tu puntuación: <span className="font-bold">{score}</span></p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <label htmlFor="initials" className="text-xl">Introduce tus iniciales (3 letras)</label>
        <input
          ref={inputRef}
          id="initials"
          type="text"
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
          maxLength={3}
          className="w-32 text-center text-4xl font-bold bg-slate-800/80 border-2 border-cyan-400/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          style={{caretColor: 'transparent'}}
        />
        <button
          type="submit"
          disabled={initials.trim().length === 0}
          className="px-6 py-3 bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          Guardar Puntuación
        </button>
      </form>
    </div>
  );
};