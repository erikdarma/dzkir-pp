import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, isSameDay, subDays } from 'date-fns';

export type DzikirType = 'pagi' | 'petang';

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  pagiCompleted: boolean;
  petangCompleted: boolean;
}

interface AppState {
  currentStreak: number;
  totalDzikir: number;
  history: HistoryEntry[];
  lastCompleted: string | null;
  
  // Current session state
  currentSession: {
    type: DzikirType | null;
    currentIndex: number;
    progress: Record<string, number>; // id -> count
  };

  startSession: (type: DzikirType) => void;
  incrementProgress: (id: string, target: number) => void;
  nextDzikir: () => void;
  prevDzikir: () => void;
  completeSession: () => void;
  resetSession: () => void;
  
  getHistoryForDate: (date: Date) => HistoryEntry;
}

const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      totalDzikir: 0,
      history: [],
      lastCompleted: null,
      
      currentSession: {
        type: null,
        currentIndex: 0,
        progress: {},
      },

      startSession: (type) => set({
        currentSession: {
          type,
          currentIndex: 0,
          progress: {},
        }
      }),

      incrementProgress: (id, target) => set((state) => {
        const currentCount = state.currentSession.progress[id] || 0;
        if (currentCount >= target) return state;
        
        return {
          currentSession: {
            ...state.currentSession,
            progress: {
              ...state.currentSession.progress,
              [id]: currentCount + 1,
            }
          },
          totalDzikir: state.totalDzikir + 1,
        };
      }),

      nextDzikir: () => set((state) => ({
        currentSession: {
          ...state.currentSession,
          currentIndex: state.currentSession.currentIndex + 1,
        }
      })),

      prevDzikir: () => set((state) => ({
        currentSession: {
          ...state.currentSession,
          currentIndex: Math.max(0, state.currentSession.currentIndex - 1),
        }
      })),

      completeSession: () => set((state) => {
        const todayStr = getTodayString();
        const type = state.currentSession.type;
        if (!type) return state;

        const history = [...state.history];
        const todayEntryIndex = history.findIndex(h => h.date === todayStr);
        
        if (todayEntryIndex >= 0) {
          history[todayEntryIndex] = {
            ...history[todayEntryIndex],
            pagiCompleted: type === 'pagi' ? true : history[todayEntryIndex].pagiCompleted,
            petangCompleted: type === 'petang' ? true : history[todayEntryIndex].petangCompleted,
          };
        } else {
          history.push({
            date: todayStr,
            pagiCompleted: type === 'pagi',
            petangCompleted: type === 'petang',
          });
        }

        // Calculate streak
        let streak = 0;
        let currentDate = new Date();
        while (true) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const entry = history.find(h => h.date === dateStr);
          if (entry && (entry.pagiCompleted || entry.petangCompleted)) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else {
            break;
          }
        }

        return {
          history,
          currentStreak: streak,
          lastCompleted: new Date().toISOString(),
          currentSession: {
            type: null,
            currentIndex: 0,
            progress: {},
          }
        };
      }),

      resetSession: () => set({
        currentSession: {
          type: null,
          currentIndex: 0,
          progress: {},
        }
      }),

      getHistoryForDate: (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return get().history.find(h => h.date === dateStr) || {
          date: dateStr,
          pagiCompleted: false,
          petangCompleted: false,
        };
      },
    }),
    {
      name: 'dzikir-storage',
    }
  )
);
