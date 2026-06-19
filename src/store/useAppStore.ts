import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { TaskStatus, SymptomLevel, TaskRecord, ChatMessage } from '@/types';
import { getTasksForDay } from '@/data/tasks';
import dayjs from 'dayjs';

interface CheckupRecord {
  date: string;
  symptoms: string[];
  level: SymptomLevel;
}

interface ConversationState {
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}

interface AppState {
  startDate: string;
  currentDay: number;
  taskRecords: Record<string, TaskRecord[]>;
  checkupRecords: CheckupRecord[];
  conversations: Record<string, ConversationState>;
  activeView: 'today' | 'calendar';
  selectedSymptoms: string[];
  activeConversation: string | null;

  setStartDate: (date: string) => void;
  setActiveView: (view: 'today' | 'calendar') => void;
  toggleSymptom: (symptomId: string) => void;
  clearSelectedSymptoms: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, date?: string) => void;
  getTaskStatus: (taskId: string, date?: string) => TaskStatus;
  getDayRecords: (date: string) => TaskRecord[];
  addCheckupRecord: (symptoms: string[], level: SymptomLevel, date?: string) => void;
  getTodayCheckup: () => CheckupRecord | undefined;
  getRecentCheckups: (days?: number) => CheckupRecord[];
  getConsecutiveSymptomDays: (symptomId: string) => number;

  sendMessage: (convId: string, content: string, imageUrl?: string) => void;
  sendCheckupCard: (convId: string, cardData: {
    date: string;
    symptoms: string[];
    symptomNames: string[];
    level: SymptomLevel;
    trend: { date: string; symptomCount: number }[];
  }) => void;
  setActiveConversation: (convId: string | null) => void;
  markConversationRead: (convId: string) => void;
  getTotalUnread: () => number;

  // 复盘统计
  getReviewStats: () => {
    completionRate: number;
    totalCompleted: number;
    totalTasks: number;
    consecutiveDays: number;
    mostCommonSymptom: string | null;
    symptomTrend: { date: string; symptomCount: number }[];
    nextAdvice: string;
  };
}

const STORAGE_KEY = 'dental_care_state';

function loadFromStorage(): Partial<AppState> {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Store] load from storage error', e);
  }
  return {};
}

function saveToStorage(state: Partial<AppState>) {
  try {
    const toSave = {
      startDate: state.startDate,
      taskRecords: state.taskRecords,
      checkupRecords: state.checkupRecords,
      conversations: state.conversations,
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('[Store] save to storage error', e);
  }
}

const DEFAULT_START_DATE = dayjs().subtract(4, 'day').format('YYYY-MM-DD');

function getInitialState(): AppState {
  const saved = loadFromStorage();
  const startDate = saved.startDate || DEFAULT_START_DATE;
  const currentDay = dayjs().diff(dayjs(startDate), 'day') + 1;

  return {
    startDate,
    currentDay: Math.min(Math.max(currentDay, 1), 30),
    taskRecords: saved.taskRecords || {},
    checkupRecords: saved.checkupRecords || [],
    conversations: saved.conversations || {
      'conv-1': {
        unreadCount: 2,
        lastMessage: '今天牙龈出血情况有好转吗？记得按时使用牙线哦',
        lastTime: '10:30',
        messages: [
          { id: 'msg-1', sender: 'dentist', content: '您好，洁治后第3天了，感觉怎么样？', timestamp: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-2', sender: 'patient', content: '刷牙的时候还有点出血，不过比昨天好多了', timestamp: dayjs().subtract(1, 'day').add(15, 'minute').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-3', sender: 'dentist', content: '出血减少是好现象，说明牙龈在恢复。请继续使用巴氏刷牙法，力度轻柔一些', timestamp: dayjs().subtract(1, 'day').add(20, 'minute').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-4', sender: 'patient', content: '好的，牙线也每天在用', timestamp: dayjs().subtract(1, 'day').add(25, 'minute').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-5', sender: 'dentist', content: '非常好！坚持使用牙线对恢复很有帮助。如果出血持续超过2周，及时联系我', timestamp: dayjs().subtract(1, 'day').add(30, 'minute').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-6', sender: 'dentist', content: '今天牙龈出血情况有好转吗？记得按时使用牙线哦', timestamp: dayjs().hour(10).minute(30).format('YYYY-MM-DD HH:mm') },
        ],
      },
      'conv-2': {
        unreadCount: 0,
        lastMessage: '复诊时间可以安排在下周三下午',
        lastTime: '昨天',
        messages: [
          { id: 'msg-7', sender: 'dentist', content: '您好，我是负责您后续护理的李医生', timestamp: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-8', sender: 'patient', content: '李医生您好，我想预约下周的复诊', timestamp: dayjs().subtract(2, 'day').add(10, 'minute').format('YYYY-MM-DD HH:mm') },
          { id: 'msg-9', sender: 'dentist', content: '复诊时间可以安排在下周三下午', timestamp: dayjs().subtract(2, 'day').add(15, 'minute').format('YYYY-MM-DD HH:mm') },
        ],
      },
    },
    activeView: 'today',
    selectedSymptoms: [],
    activeConversation: null,
  };
}

const useAppStore = create<AppState>((set, get) => {
  const initial = getInitialState();

  return {
    ...initial,

    setStartDate: (date) => {
      const day = dayjs().diff(dayjs(date), 'day') + 1;
      const newState = { startDate: date, currentDay: Math.min(Math.max(day, 1), 30) };
      set(newState);
      saveToStorage({ ...get(), ...newState });
    },

    setActiveView: (view) => {
      set({ activeView: view });
    },

    toggleSymptom: (symptomId) => {
      set((state) => {
        const has = state.selectedSymptoms.includes(symptomId);
        return {
          selectedSymptoms: has
            ? state.selectedSymptoms.filter((id) => id !== symptomId)
            : [...state.selectedSymptoms, symptomId],
        };
      });
    },

    clearSelectedSymptoms: () => {
      set({ selectedSymptoms: [] });
    },

    updateTaskStatus: (taskId, status, date) => {
      const targetDate = date || dayjs().format('YYYY-MM-DD');
      set((state) => {
        const dayRecords = state.taskRecords[targetDate] || [];
        const existing = dayRecords.find((r) => r.taskId === taskId);
        let newRecords: TaskRecord[];
        if (existing) {
          newRecords = dayRecords.map((r) =>
            r.taskId === taskId ? { ...r, status } : r
          );
        } else {
          newRecords = [...dayRecords, { taskId, status }];
        }
        const newTaskRecords = {
          ...state.taskRecords,
          [targetDate]: newRecords,
        };
        const newState = { taskRecords: newTaskRecords };
        saveToStorage({ ...state, ...newState });
        return newState;
      });
    },

    getTaskStatus: (taskId, date) => {
      const targetDate = date || dayjs().format('YYYY-MM-DD');
      const records = get().taskRecords[targetDate] || [];
      const record = records.find((r) => r.taskId === taskId);
      return record?.status || 'pending';
    },

    getDayRecords: (date) => {
      return get().taskRecords[date] || [];
    },

    addCheckupRecord: (symptoms, level, date) => {
      const targetDate = date || dayjs().format('YYYY-MM-DD');
      set((state) => {
        const filtered = state.checkupRecords.filter((r) => r.date !== targetDate);
        const newRecord = { date: targetDate, symptoms, level };
        const newCheckups = [newRecord, ...filtered].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        const newState = { checkupRecords: newCheckups, selectedSymptoms: [] };
        saveToStorage({ ...state, ...newState });
        return newState;
      });
    },

    getTodayCheckup: () => {
      const today = dayjs().format('YYYY-MM-DD');
      return get().checkupRecords.find((r) => r.date === today);
    },

    getRecentCheckups: (days = 7) => {
      const result: CheckupRecord[] = [];
      const recordMap = new Map(
        get().checkupRecords.map((r) => [r.date, r])
      );
      for (let i = 0; i < days; i++) {
        const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        if (recordMap.has(date)) {
          result.push(recordMap.get(date)!);
        } else {
          result.push({ date, symptoms: [], level: 'normal' });
        }
      }
      return result;
    },

    getConsecutiveSymptomDays: (symptomId) => {
      const recent = get().getRecentCheckups(14);
      let count = 0;
      for (const record of recent) {
        if (record.symptoms.includes(symptomId)) {
          count++;
        } else if (count > 0) {
          break;
        }
      }
      return count;
    },

    setActiveConversation: (convId) => {
      set({ activeConversation: convId });
    },

    sendMessage: (convId, content, imageUrl) => {
      const timestamp = dayjs().format('YYYY-MM-DD HH:mm');
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'patient',
        content,
        imageUrl,
        timestamp,
      };

      set((state) => {
        const conv = state.conversations[convId] || {
          unreadCount: 0,
          lastMessage: '',
          lastTime: '',
          messages: [],
        };
        const newConv = {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: content || '[图片]',
          lastTime: dayjs(timestamp).format('HH:mm'),
        };
        const newConversations = {
          ...state.conversations,
          [convId]: newConv,
        };
        const newState = { conversations: newConversations };
        saveToStorage({ ...state, ...newState });
        return newState;
      });

      setTimeout(() => {
        const replyTime = dayjs().format('YYYY-MM-DD HH:mm');
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'dentist',
          content: '收到您的消息，我查看后会尽快回复您。',
          timestamp: replyTime,
        };

        set((state) => {
          const conv = state.conversations[convId];
          if (!conv) return state;
          const isActive = state.activeConversation === convId;
          const newConv = {
            ...conv,
            messages: [...conv.messages, replyMsg],
            lastMessage: replyMsg.content,
            lastTime: dayjs(replyTime).format('HH:mm'),
            unreadCount: isActive ? 0 : conv.unreadCount + 1,
          };
          const newConversations = {
            ...state.conversations,
            [convId]: newConv,
          };
          const newState = { conversations: newConversations };
          saveToStorage({ ...state, ...newState });
          return newState;
        });
      }, 2000);
    },

    sendCheckupCard: (convId, cardData) => {
      const timestamp = dayjs().format('YYYY-MM-DD HH:mm');
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'patient',
        content: '',
        timestamp,
        checkupCard: {
          date: cardData.date,
          symptoms: cardData.symptoms,
          symptomNames: cardData.symptomNames,
          level: cardData.level,
          trend: cardData.trend,
        },
      };

      set((state) => {
        const conv = state.conversations[convId] || {
          unreadCount: 0,
          lastMessage: '',
          lastTime: '',
          messages: [],
        };
        const newConv = {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: `[自查报告] ${cardData.symptomNames.join('、') || '无不适'}`,
          lastTime: dayjs(timestamp).format('HH:mm'),
        };
        const newConversations = {
          ...state.conversations,
          [convId]: newConv,
        };
        const newState = { conversations: newConversations };
        saveToStorage({ ...state, ...newState });
        return newState;
      });

      setTimeout(() => {
        const replyTime = dayjs().format('YYYY-MM-DD HH:mm');
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'dentist',
          content: '收到您的自查报告，我仔细看一下您的症状情况，稍后给您回复。',
          timestamp: replyTime,
        };

        set((state) => {
          const conv = state.conversations[convId];
          if (!conv) return state;
          const isActive = state.activeConversation === convId;
          const newConv = {
            ...conv,
            messages: [...conv.messages, replyMsg],
            lastMessage: replyMsg.content,
            lastTime: dayjs(replyTime).format('HH:mm'),
            unreadCount: isActive ? 0 : conv.unreadCount + 1,
          };
          const newConversations = {
            ...state.conversations,
            [convId]: newConv,
          };
          const newState = { conversations: newConversations };
          saveToStorage({ ...state, ...newState });
          return newState;
        });
      }, 2000);
    },

    markConversationRead: (convId) => {
      set((state) => {
        const conv = state.conversations[convId];
        if (!conv || conv.unreadCount === 0) return state;
        const newConv = { ...conv, unreadCount: 0 };
        const newConversations = {
          ...state.conversations,
          [convId]: newConv,
        };
        const newState = { conversations: newConversations };
        saveToStorage({ ...state, ...newState });
        return newState;
      });
    },

    getTotalUnread: () => {
      const convs = get().conversations;
      return Object.values(convs).reduce((sum, conv) => sum + conv.unreadCount, 0);
    },

    getReviewStats: () => {
      const { startDate, taskRecords, checkupRecords, currentDay } = get();
      const daysPassed = Math.min(currentDay, 30);

      let totalCompleted = 0;
      let totalTasks = 0;
      let consecutiveDays = 0;

      const symptomCountMap = new Map<string, number>();

      for (let i = 1; i <= daysPassed; i++) {
        const date = dayjs(startDate).add(i - 1, 'day').format('YYYY-MM-DD');
        const dayTasks = getTasksForDay(i);
        const records = taskRecords[date] || [];
        const completed = records.filter((r) => r.status === 'completed').length;

        totalTasks += dayTasks.length;
        totalCompleted += completed;

        if (completed === dayTasks.length && dayTasks.length > 0) {
          consecutiveDays++;
        } else if (consecutiveDays > 0) {
          consecutiveDays = 0;
        }
      }

      checkupRecords.forEach((record) => {
        record.symptoms.forEach((symptomId) => {
          symptomCountMap.set(symptomId, (symptomCountMap.get(symptomId) || 0) + 1);
        });
      });

      let mostCommonSymptom: string | null = null;
      let maxCount = 0;
      symptomCountMap.forEach((count, id) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonSymptom = id;
        }
      });

      const symptomTrend = getRecentCheckups(7).map((r) => ({
        date: r.date,
        symptomCount: r.symptoms.length,
      }));

      let nextAdvice = '';
      const bleedingDays = getConsecutiveSymptomDays('brush-bleeding');
      const sensitiveDays = getConsecutiveSymptomDays('cold-sensitive');
      const overallComplection = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

      if (bleedingDays >= 3 || sensitiveDays >= 3) {
        nextAdvice = '您已连续多日出现出血或敏感症状，建议尽快联系医生复诊检查。';
      } else if (overallComplection < 60) {
        nextAdvice = '护理任务完成率较低，建议每天按时完成口腔清洁任务，坚持就是胜利！';
      } else if (currentDay <= 7) {
        nextAdvice = '继续保持基础清洁，饭后漱口、巴氏刷牙要坚持，注意观察牙龈出血情况。';
      } else if (currentDay <= 14) {
        nextAdvice = '进入深度护理期，记得每天使用牙线，可开始尝试牙间刷清洁较大牙缝。';
      } else if (currentDay <= 21) {
        nextAdvice = '习惯正在巩固，可加入舌苔清洁和牙龈按摩，全面提升口腔健康。';
      } else {
        nextAdvice = '恭喜您即将完成30天护理！建议保持现有习惯，定期复诊检查牙周健康。';
      }

      return {
        completionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
        totalCompleted,
        totalTasks,
        consecutiveDays,
        mostCommonSymptom,
        symptomTrend,
        nextAdvice,
      };
    },
  };
});

export default useAppStore;
