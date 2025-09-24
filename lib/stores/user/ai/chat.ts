import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { AIChatMessage, AIChatThread } from "@/types/ai/chat";

interface AIChatState {
  threads: AIChatThread[];
  currentThreadId?: string;
  createThread: (
    title: string,
    initialMessage?: Omit<AIChatMessage, "id" | "createdAt">
  ) => string;
  appendMessage: (
    threadId: string,
    msg: Omit<AIChatMessage, "id" | "createdAt">
  ) => void;
  renameThread: (threadId: string, title: string) => void;
  deleteThread: (threadId: string) => void;
  setCurrentThread: (threadId?: string) => void;
  clearAll: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: undefined,

      createThread: (title, initial) => {
        const id = uuidv4();
        const createdAt = nowIso();
        const updatedAt = createdAt;
        const thread: AIChatThread = {
          id,
          title,
          messages: initial
            ? [
                {
                  id: uuidv4(),
                  createdAt,
                  role: initial.role,
                  content: initial.content,
                  attachments: initial.attachments,
                },
              ]
            : [],
          createdAt,
          updatedAt,
        };
        set((s) => ({ threads: [thread, ...s.threads], currentThreadId: id }));
        return id;
      },

      appendMessage: (threadId, msg) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: uuidv4(),
                      createdAt: nowIso(),
                      role: msg.role,
                      content: msg.content,
                      attachments: msg.attachments,
                    },
                  ],
                  updatedAt: nowIso(),
                }
              : t,
          ),
        })),

      renameThread: (threadId, title) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, title, updatedAt: nowIso() } : t,
          ),
        })),

      deleteThread: (threadId) =>
        set((s) => ({
          threads: s.threads.filter((t) => t.id !== threadId),
          currentThreadId: s.currentThreadId === threadId ? undefined : s.currentThreadId,
        })),

      setCurrentThread: (threadId) => set({ currentThreadId: threadId }),

      clearAll: () => set({ threads: [], currentThreadId: undefined }),
    }),
    {
      name: "ai-chat-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

