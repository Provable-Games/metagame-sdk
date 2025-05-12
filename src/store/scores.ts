import { create } from 'zustand';
import { GameScore } from '../types/games';

interface ScoreState {
  // Store scores by game_id for the basic Score type
  scores: Record<number, GameScore>;

  // Actions for Score type
  setScore: (score: GameScore) => void;
  getScore: (gameId: number) => GameScore | undefined;
  getAllScores: () => GameScore[];
  clearScores: () => void;
}

/**
 * Store for managing game scores
 */
export const useScoreStore = create<ScoreState>((set, get) => ({
  scores: {},

  // Score actions
  setScore: (score: GameScore) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [score.token_id]: score,
      },
    })),

  getScore: (gameId: number) => get().scores[gameId],

  getAllScores: () => Object.values(get().scores),

  clearScores: () => set({ scores: {} }),
}));
