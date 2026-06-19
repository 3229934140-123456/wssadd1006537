import { create } from 'zustand';
import type { TaskStatus, SymptomLevel, DailyRecord, TaskRecord } from '@/types';
import dayjs from 'dayjs';

interface AppState {
  startDate: string;
  currentDay: number;
  todayRecords: TaskRecord[];
  selectedSymptoms: string[];
  symptomLevel: SymptomLevel;
  setStartDate: (date: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  toggleSymptom: (symptomId: string) => void;
  setSymptomLevel: (level: SymptomLevel) => void;
  getCompletedCount: () => number;
  getTotalTasksForDay: () => number;
}

const DEFAULT_START_DATE = dayjs().subtract(4, 'day').format('YYYY-MM-DD');

const useAppStore = create<AppState>((set, get) => ({
  startDate: DEFAULT_START_DATE,
  currentDay: dayjs().diff(dayjs(DEFAULT_START_DATE), 'day') + 1,
  todayRecords: [],
  selectedSymptoms: [],
  symptomLevel: 'normal',

  setStartDate: (date) => {
    const day = dayjs().diff(dayjs(date), 'day') + 1;
    set({ startDate: date, currentDay: Math.min(Math.max(day, 1), 30) });
  },

  updateTaskStatus: (taskId, status) => {
    set((state) => {
      const existing = state.todayRecords.find((r) => r.taskId === taskId);
      if (existing) {
        return {
          todayRecords: state.todayRecords.map((r) =>
            r.taskId === taskId ? { ...r, status } : r
          ),
        };
      }
      return {
        todayRecords: [...state.todayRecords, { taskId, status }],
      };
    });
  },

  toggleSymptom: (symptomId) => {
    set((state) => {
      const exists = state.selectedSymptoms.includes(symptomId);
      const next = exists
        ? state.selectedSymptoms.filter((id) => id !== symptomId)
        : [...state.selectedSymptoms, symptomId];
      return { selectedSymptoms: next };
    });
  },

  setSymptomLevel: (level) => set({ symptomLevel: level }),

  getCompletedCount: () => {
    return get().todayRecords.filter((r) => r.status === 'completed').length;
  },

  getTotalTasksForDay: () => {
    return get().todayRecords.length || 4;
  },
}));

export default useAppStore;
