import { create } from "zustand";
import type { AIAction, AIActionCategory } from "@/types/ai/actions";

interface ActionState {
  actions: AIAction[];
  registerAction: (action: AIAction) => void;
  removeAction: (id: string) => void;
  getActionsByCategory: (category: AIActionCategory) => AIAction[];
  clear: () => void;
}

export const useAIActionsStore = create<ActionState>((set, get) => ({
  actions: [],
  registerAction: (action) => set((state) => ({ actions: [...state.actions, action] })),
  removeAction: (id) => set((state) => ({ actions: state.actions.filter((a) => a.id !== id) })),
  getActionsByCategory: (category) => get().actions.filter((a) => a.category === category),
  clear: () => set({ actions: [] }),
}));
