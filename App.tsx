
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { GameBoard } from './components/GameBoard';
import { MainMenu } from './components/MainMenu';
import { GameOverScreen } from './components/GameOverScreen';
import { InitialEntryScreen } from './components/InitialEntryScreen';
import { Scoreboard } from './components/Scoreboard';
import { PauseScreen } from './components/PauseScreen';
import { VisualEffects } from './components/VisualEffects';
import { useGameLoop } from './hooks/useGameLoop';
import { useSounds } from './hooks/useSounds'; // Import useSounds
import { GameState, Direction, Coordinates, Particle, HighScore, VisualEffect, ParticleType } from './types';
import { 
  GRID_SIZE, 
  INITIAL_SNAKE, 
  INITIAL_SPEED, 
  SPEED_INCREMENT, 
  POINTS_PER_FOOD, 
  BONUS_MULTIPLIER, 
  BONUS_DURATION_MS,
  SLOWDOWN_FACTOR,
  SLOWDOWN_DURATION_MS,
  DANGER_DURATION_MS,
  HIGH_SCORE_COUNT,
  TARGET_DANGER_COUNT,
  TARGET_BONUS_COUNT,
  TARGET_SLOWDOWN_COUNT,
  PARTICLE_STYLES
} from './constants';

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'START_MOVEMENT' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' }
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'TICK' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'DECREMENT_MULTIPLIER_TIMER' }
  | { type: 'DECREMENT_SLOWDOWN_TIMER' }
  | { type: 'SAVE_HIGH_SCORE', payload: string }
  | { type: 'ADD_EFFECT', payload: Omit<VisualEffect, 'id'> }
  | { type: 'REMOVE_EFFECT', payload: number }
  | { type: 'DECREMENT_PARTICLE_TIMERS' };


interface AppState {
  gameState: GameState;
  snake: Coordinates[];
  direction: Direction;
  particles: Particle[];
  speed: number | null;
  preSlowdownSpeed: number | null;
  score: number;
  highScores: HighScore[];
  scoreMultiplier: number;
  multiplierTimer: number;
  slowdownTimer: number;
  visualEffects: VisualEffect[];
}

const generateParticle = (snakeBody: Coordinates[], existingParticles: Particle[], typeToGenerate?: ParticleType): Particle => {
  let position: Coordinates;
  const isOccupied = (pos: Coordinates) => {
    return [...snakeBody, ...existingParticles.map(p => p.position)].some(
      segment => segment.x === pos.x && segment.y === pos.y
    );
  };

  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (isOccupied(position));
  
  let type: ParticleType;
  let timer: number | undefined;

  if (typeToGenerate) {
    type = typeToGenerate;
  } else { // Fallback to random generation if type is not specified (shouldn't happen often now)
    const rand = Math.random();
    if (rand < 0.60) { // food (60%)
      type = 'food';
    } else if (rand < 0.85) { // danger (25%)
      type = 'danger';
    } else if (rand < 0.95) { // bonus (10%)
      type = 'bonus';
    } else { // slowdown (5%)
      type = 'slowdown';
    }
  }

  switch (type) {
    case 'danger':
      timer = DANGER_DURATION_MS;
      break;
    case 'bonus':
      timer = BONUS_DURATION_MS;
      break;
    case 'slowdown':
      timer = SLOWDOWN_DURATION_MS;
      break;
    default:
      timer = undefined;
  }

  return { position, type, id: Date.now() + Math.random(), timer };
};

const getInitialState = (): AppState => {
  const savedScoresRaw = localStorage.getItem('highScores') || '[]'
  const savedScores = JSON.parse(savedScoresRaw) as any[];
  const highScores = savedScores.map(score => ({
    score: score.score || 0,
    date: score.date || new Date().toISOString(),
    initials: score.initials || '???'
  })).sort((a,b) => b.score - a.score).slice(0, HIGH_SCORE_COUNT);


  return {
    gameState: GameState.MainMenu,
    snake: INITIAL_SNAKE,
    direction: Direction.Right,
    particles: [
      generateParticle(INITIAL_SNAKE, [], 'food'), // Always one food particle
      ...Array.from({ length: TARGET_DANGER_COUNT }, () => generateParticle(INITIAL_SNAKE, [], 'danger')),
      ...Array.from({ length: TARGET_BONUS_COUNT }, () => generateParticle(INITIAL_SNAKE, [], 'bonus')),
      ...Array.from({ length: TARGET_SLOWDOWN_COUNT }, () => generateParticle(INITIAL_SNAKE, [], 'slowdown')),
    ],
    speed: null,
    preSlowdownSpeed: null,
    score: 0,
    highScores: highScores,
    scoreMultiplier: 1,
    multiplierTimer: 0,
    slowdownTimer: 0,
    visualEffects: [],
  }
};


function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'START_GAME':
      const freshState = getInitialState();
      return {
        ...freshState,
        highScores: state.highScores,
        gameState: GameState.GetReady,
      };
    case 'START_MOVEMENT':
        return {
            ...state,
            gameState: GameState.Playing,
            speed: INITIAL_SPEED,
        };
    case 'TOGGLE_PAUSE':
      if (state.gameState === GameState.Playing) {
        return { ...state, gameState: GameState.Paused, speed: null };
      }
      if (state.gameState === GameState.Paused) {
        return { ...state, gameState: GameState.Playing, speed: state.preSlowdownSpeed || state.speed || INITIAL_SPEED };
      }
      return state;
    case 'GAME_OVER': {
      const isNewHighScore = state.score > 0 && (state.highScores.length < HIGH_SCORE_COUNT || state.score > state.highScores[state.highScores.length - 1].score);
      if (isNewHighScore) {
        return { ...state, gameState: GameState.EnteringInitials, speed: null, visualEffects: [] };
      }
      return { ...state, gameState: GameState.GameOver, speed: null, visualEffects: [] };
    }
    case 'SAVE_HIGH_SCORE': {
        const newHighScore: HighScore = {
            initials: action.payload,
            score: state.score,
            date: new Date().toISOString(),
        };
        const newHighScores = [...state.highScores, newHighScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, HIGH_SCORE_COUNT);
        localStorage.setItem('highScores', JSON.stringify(newHighScores));
        const resetState = getInitialState();
        return { ...resetState, highScores: newHighScores };
    }
    case 'RESET':
        const resetState = getInitialState();
        return { ...resetState, highScores: state.highScores };
    case 'CHANGE_DIRECTION':
      const newDirection = action.payload;
      const { direction, snake } = state;
      if (snake.length > 1) {
        if (newDirection === Direction.Up && direction === Direction.Down) return state;
        if (newDirection === Direction.Down && direction === Direction.Up) return state;
        if (newDirection === Direction.Left && direction === Direction.Right) return state;
        if (newDirection === Direction.Right && direction === Direction.Left) return state;
      }
      return { ...state, direction: newDirection };
    case 'TICK': {
      let nextState = {...state};
      const newSnake = [...nextState.snake];
      const head = { ...newSnake[0] };

      switch (nextState.direction) {
        case Direction.Up: head.y -= 1; break;
        case Direction.Down: head.y += 1; break;
        case Direction.Left: head.x -= 1; break;
        case Direction.Right: head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return gameReducer(nextState, { type: 'GAME_OVER' });
      }

      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          return gameReducer(nextState, { type: 'GAME_OVER' });
        }
      }

      newSnake.unshift(head);
      
      let ateParticle = false;
      let newParticles = [...nextState.particles];
      let newScore = nextState.score;
      let newSpeed = nextState.speed;
      let newScoreMultiplier = nextState.scoreMultiplier;
      let newMultiplierTimer = nextState.multiplierTimer;
      let newSlowdownTimer = nextState.slowdownTimer;
      let newPreSlowdownSpeed = nextState.preSlowdownSpeed;

      const particleIndex = newParticles.findIndex(p => p.position.x === head.x && p.position.y === head.y);

      if (particleIndex > -1) {
        const particle = newParticles[particleIndex];
        ateParticle = true;
        
        const pointsGained = POINTS_PER_FOOD * nextState.scoreMultiplier;
        
        const baseColor = PARTICLE_STYLES[particle.type].replace('bg-', 'border-');
        
        nextState = gameReducer(nextState, { type: 'ADD_EFFECT', payload: { type: 'particle-burst', position: particle.position, color: baseColor } });
        
        switch (particle.type) {
            case 'food':
                newScore += pointsGained;
                newSpeed = Math.max(50, (nextState.speed || INITIAL_SPEED) - SPEED_INCREMENT);
                nextState = gameReducer(nextState, { type: 'ADD_EFFECT', payload: { type: 'score-text', text: `+${pointsGained}`, position: particle.position }});
                // Generate a new food particle immediately
                newParticles.push(generateParticle(newSnake, newParticles, 'food'));
                break;
            case 'danger':
                return gameReducer(nextState, { type: 'GAME_OVER' });
            case 'bonus':
                newScoreMultiplier = BONUS_MULTIPLIER;
                newMultiplierTimer = BONUS_DURATION_MS / 1000;
                nextState = gameReducer(nextState, { type: 'ADD_EFFECT', payload: { type: 'score-text', text: `x${BONUS_MULTIPLIER}!`, position: particle.position }});
                break;
            case 'slowdown':
                if (newSlowdownTimer <= 0) { // Only apply if not already slowed
                    newPreSlowdownSpeed = newSpeed;
                    newSpeed = (newSpeed || INITIAL_SPEED) * SLOWDOWN_FACTOR;
                }
                newSlowdownTimer = SLOWDOWN_DURATION_MS / 1000;
                nextState = gameReducer(nextState, { type: 'ADD_EFFECT', payload: { type: 'score-text', text: `LENTO!`, position: particle.position }});
                break;
        }
        
        newParticles.splice(particleIndex, 1);
        
        // After eating, check and replenish other particle types if needed
        const currentDangerCount = newParticles.filter(p => p.type === 'danger').length;
        for (let i = currentDangerCount; i < TARGET_DANGER_COUNT; i++) {
            newParticles.push(generateParticle(newSnake, newParticles, 'danger'));
        }

        const currentBonusCount = newParticles.filter(p => p.type === 'bonus').length;
        for (let i = currentBonusCount; i < TARGET_BONUS_COUNT; i++) {
            newParticles.push(generateParticle(newSnake, newParticles, 'bonus'));
        }

        const currentSlowdownCount = newParticles.filter(p => p.type === 'slowdown').length;
        for (let i = currentSlowdownCount; i < TARGET_SLOWDOWN_COUNT; i++) {
            newParticles.push(generateParticle(newSnake, newParticles, 'slowdown'));
        }
      }

      if (!ateParticle) {
        newSnake.pop();
      }

      return {
        ...nextState,
        snake: newSnake,
        particles: newParticles,
        score: newScore,
        speed: newSpeed,
        scoreMultiplier: newScoreMultiplier,
        multiplierTimer: newMultiplierTimer,
        slowdownTimer: newSlowdownTimer,
        preSlowdownSpeed: newPreSlowdownSpeed
      };
    }
    case 'DECREMENT_MULTIPLIER_TIMER': {
        if (state.multiplierTimer > 0) {
            const newTimer = state.multiplierTimer - 1;
            if (newTimer <= 0) {
                return { ...state, multiplierTimer: 0, scoreMultiplier: 1 };
            }
            return { ...state, multiplierTimer: newTimer };
        }
        return state;
    }
    case 'DECREMENT_SLOWDOWN_TIMER': {
        if (state.slowdownTimer > 0) {
            const newTimer = state.slowdownTimer - 1;
            if (newTimer <= 0) {
                return { ...state, slowdownTimer: 0, speed: state.preSlowdownSpeed, preSlowdownSpeed: null };
            }
            return { ...state, slowdownTimer: newTimer };
        }
        return state;
    }
    case 'ADD_EFFECT':
        const newEffect: VisualEffect = { ...action.payload, id: Date.now() + Math.random() };
        return {
            ...state,
            visualEffects: [...state.visualEffects, newEffect]
        };
    case 'REMOVE_EFFECT':
        return {
            ...state,
            visualEffects: state.visualEffects.filter(e => e.id !== action.payload)
        };
    case 'DECREMENT_PARTICLE_TIMERS': {
        let updatedParticles = state.particles.map(p => {
            if (p.timer !== undefined) {
                return { ...p, timer: p.timer - 1000 }; // Decrement by 1 second
            }
            return p;
        }).filter(p => p.timer === undefined || p.timer > 0);

        // Replenish timed particles if their count is below target
        const currentDangerCount = updatedParticles.filter(p => p.type === 'danger').length;
        for (let i = currentDangerCount; i < TARGET_DANGER_COUNT; i++) {
            updatedParticles.push(generateParticle(state.snake, updatedParticles, 'danger'));
        }

        const currentBonusCount = updatedParticles.filter(p => p.type === 'bonus').length;
        for (let i = currentBonusCount; i < TARGET_BONUS_COUNT; i++) {
            updatedParticles.push(generateParticle(state.snake, updatedParticles, 'bonus'));
        }

        const currentSlowdownCount = updatedParticles.filter(p => p.type === 'slowdown').length;
        for (let i = currentSlowdownCount; i < TARGET_SLOWDOWN_COUNT; i++) {
            updatedParticles.push(generateParticle(state.snake, updatedParticles, 'slowdown'));
        }

        return { ...state, particles: updatedParticles };
    }
    default:
      return state;
  }
}


export default function App() {
  const [state, dispatch] = useReducer(gameReducer, getInitialState());
  const { playSound, initAudio } = useSounds(); // Destructure initAudio
  const [isShaking, setShaking] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let newDirection: Direction | null = null;
    
    if (e.key === 'p' || e.key === 'Escape') {
      e.preventDefault();
      dispatch({ type: 'TOGGLE_PAUSE' });
      return;
    }
    
    switch (e.key) {
      case 'ArrowUp': case 'w': newDirection = Direction.Up; break;
      case 'ArrowDown': case 's': newDirection = Direction.Down; break;
      case 'ArrowLeft': case 'a': newDirection = Direction.Left; break;
      case 'ArrowRight': case 'd': newDirection = Direction.Right; break;
    }
    if (newDirection !== null) {
      e.preventDefault();
      // Call initAudio on first key press interaction
      initAudio(); 
      if (state.gameState === GameState.GetReady) {
        dispatch({ type: 'START_MOVEMENT' });
      }
      dispatch({ type: 'CHANGE_DIRECTION', payload: newDirection });
    }
  }, [state.gameState, initAudio]); // Add initAudio to dependencies

  useEffect(() => {
    if ([GameState.Playing, GameState.GetReady, GameState.Paused].includes(state.gameState)) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [state.gameState, handleKeyDown]);

  useEffect(() => {
    if (state.multiplierTimer > 0) {
      const timer = setInterval(() => {
        dispatch({ type: 'DECREMENT_MULTIPLIER_TIMER' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.multiplierTimer]);
  
  useEffect(() => {
    if (state.slowdownTimer > 0) {
      const timer = setInterval(() => {
        dispatch({ type: 'DECREMENT_SLOWDOWN_TIMER' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.slowdownTimer]);
  
  useEffect(() => {
      if (state.gameState === GameState.GameOver) {
          playSound('gameover_mp3');
          setShaking(true);
          const timer = setTimeout(() => setShaking(false), 500);
          return () => clearTimeout(timer);
      }
  }, [state.gameState, playSound]);

  useEffect(() => {
    const particleTimerInterval = setInterval(() => {
      dispatch({ type: 'DECREMENT_PARTICLE_TIMERS' });
    }, 1000); // Decrement every second
    return () => clearInterval(particleTimerInterval);
  }, []);

  const gameTick = useCallback(() => {
    if (state.particles.findIndex(p => p.position.x === state.snake[0].x && p.position.y === state.snake[0].y) > -1) {
        const particle = state.particles.find(p => p.position.x === state.snake[0].x && p.position.y === state.snake[0].y);
        if (particle?.type === 'food') playSound('eat_mp3');
        if (particle?.type === 'bonus') playSound('bonus');
        if (particle?.type === 'slowdown') playSound('slowdown');
    }
    dispatch({ type: 'TICK' });
  }, [state.particles, state.snake, playSound]);

  useGameLoop(gameTick, state.speed);

  const highestScore = state.highScores.length > 0 ? state.highScores[0].score : 0;
  
  const handleRemoveEffect = (id: number) => {
    dispatch({ type: 'REMOVE_EFFECT', payload: id });
  };
  
  const renderContent = () => {
    switch (state.gameState) {
      case GameState.MainMenu:
        return (
          <MainMenu 
            onStart={() => { dispatch({ type: 'START_GAME' }); initAudio(); }} // Call initAudio on start
            highScores={state.highScores}
            onSoundClick={() => { playSound('click'); initAudio(); }} // Call initAudio on click
          />
        );
      case GameState.EnteringInitials:
        return (
            <InitialEntryScreen 
                score={state.score}
                onSave={(initials) => dispatch({ type: 'SAVE_HIGH_SCORE', payload: initials })}
                onSoundClick={() => { playSound('click'); initAudio(); }} // Call initAudio on click
            />
        );
      default: // Covers GetReady, Playing, Paused, GameOver
        return (
          <>
            <Scoreboard 
              score={state.score} 
              highScore={highestScore} 
              multiplier={state.scoreMultiplier}
              multiplierTimer={state.multiplierTimer}
              slowdownTimer={state.slowdownTimer}
            />
            <div className="relative w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] md:w-[540px] md:h-[540px]">
              {state.gameState === GameState.GetReady && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-8 text-center z-10">
                  <h2 className="text-3xl font-bold text-white animate-pulse">Pulsa una tecla de dirección para empezar</h2>
                </div>
              )}
              {state.gameState === GameState.Paused && (
                  <PauseScreen 
                    onResume={() => dispatch({type: 'TOGGLE_PAUSE'})}
                    onMenu={() => dispatch({ type: 'RESET' })}
                    onSoundClick={() => { playSound('click'); initAudio(); }} // Call initAudio on click
                  />
              )}
              {state.gameState === GameState.GameOver && (
                <GameOverScreen 
                  score={state.score} 
                  onRestart={() => dispatch({ type: 'START_GAME' })}
                  onMenu={() => dispatch({ type: 'RESET' })}
                  onSoundClick={() => { playSound('click'); initAudio(); }} // Call initAudio on click
                />
              )}
              <GameBoard 
                snake={state.snake} 
                particles={state.particles}
                isBonusActive={state.scoreMultiplier > 1}
                isSlowedDown={state.slowdownTimer > 0}
              />
              <VisualEffects effects={state.visualEffects} onRemove={handleRemoveEffect} />
            </div>
          </>
        );
    }
  }

  return (
    <div className={`min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 ${isShaking ? 'screen-shake' : ''}`}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center" style={{textShadow: '3px 3px 0 rgba(0,0,0,0.2)'}}>
            Serpiente Multicolor
        </h1>
        {renderContent()}
      </div>
    </div>
  );
}
