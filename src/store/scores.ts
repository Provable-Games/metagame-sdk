import { create } from 'zustand';
import { Score } from '../types/games';

interface ScoreState {
  // Store scores by game_id for the basic Score type
  scores: Record<number, Score>;

  // Actions for Score type
  setScore: (score: Score) => void;
  getScore: (gameId: number) => Score | undefined;
  getAllScores: () => Score[];
  clearScores: () => void;
}

/**
 * Store for managing game scores
 */
export const useScoreStore = create<ScoreState>((set, get) => ({
  scores: {},

  // Score actions
  setScore: (score: Score) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [score.game_id]: score,
      },
    })),

  getScore: (gameId: number) => get().scores[gameId],

  getAllScores: () => Object.values(get().scores),

  clearScores: () => set({ scores: {} }),
}));
