import { create } from "zustand";

export interface PeriodProgress {
  completed: boolean;
  quizScore: number | null;
}

interface RoadmapState {
  skillId: number | null;
  activePeriod: number;
  progress: Record<number, PeriodProgress>;

  setSkill(id: number): void;
  completePeriod(id: number): void;
  setQuizScore(id: number, score: number): void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  skillId: null,
  activePeriod: 0,
  progress: {},

  setSkill: (id) => set({ skillId: id }),

  completePeriod: (id) =>
    set((s) => ({
      progress: {
        ...s.progress,
        [id]: { completed: true, quizScore: s.progress[id]?.quizScore || null },
      },
      activePeriod: id + 1,
    })),

  setQuizScore: (id, score) =>
    set((s) => ({
      progress: {
        ...s.progress,
        [id]: { completed: true, quizScore: score },
      },
    })),
}));
