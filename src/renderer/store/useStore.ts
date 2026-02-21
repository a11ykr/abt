import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ABTItem {
  id: string;
  guideline_id: string;
  elementInfo: {
    selector: string;
    tagName: string;
    src?: string;
  };
  context: {
    smartContext: string;
  };
  result: {
    status: string;
    message: string;
  };
  currentStatus: string;
  finalComment: string;
  history: {
    timestamp: string;
    status: string;
    comment: string;
  }[];
}

interface ABTStore {
  items: ABTItem[];
  projectName: string;
  setItems: (items: ABTItem[]) => void;
  updateItemStatus: (id: string, judge: string) => void;
  clearItems: () => void;
  setProjectName: (name: string) => void;
}

export const useStore = create<ABTStore>()(
  persist(
    (set) => ({
      items: [],
      projectName: 'Default Project',
      setItems: (items) => set({ items }),
      updateItemStatus: (id, judge) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, judge } : item
        )
      })),
      clearItems: () => set({ items: [] }),
      setProjectName: (projectName) => set({ projectName }),
    }),
    {
      name: 'abt-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
