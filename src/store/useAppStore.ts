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
  dayNotes: Record<string, string>;
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
  updateDayNote: (date: string, note: string) => void;
  getDayNote: (date: string) => string;
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
  sendReviewReport: (convId: string, reportData: {
    completionRate: number;
    totalCompleted: number;
    totalTasks: number;
    consecutiveDays: number;
    mostCommonSymptomName: string | null;
    symptomTrend: { date: string; symptomCount: number }[];
    nextAdvice: string;
  }) => void;
  setActiveConversation: (convId: string | null) => void;
  markConversationRead: (convId: string) => void;
  getTotalUnread: () => number;

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
      dayNotes: state.dayNotes,
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
    dayNotes: saved.dayNotes || {},
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

function generateCheckupReply(cardData: {
  symptoms: string[];
  symptomNames: string[];
  level: SymptomLevel;
}): string {
  const { symptoms, symptomNames, level } = cardData;

  if (level === 'urgent') {
    if (symptoms.includes('brush-bleeding') && symptoms.includes('cold-sensitive')) {
      return '您同时出现了出血和敏感症状，情况需要重视。建议尽快来诊所检查，排除牙周炎加重的可能。近期请避免冷热刺激食物，刷牙用温水。';
    }
    if (symptoms.includes('brush-bleeding')) {
      return '连续出现牙龈出血，建议尽快来诊检查。可能需要调整洁治方案。目前请坚持轻柔刷牙，不要因为出血就减少刷牙次数，每次不少于2分钟。';
    }
    if (symptoms.includes('cold-sensitive')) {
      return '牙齿敏感情况较明显，建议尽快来诊。可以使用脱敏牙膏缓解，避免过冷过热的饮食。我会帮您检查是否有牙本质暴露的情况。';
    }
    return '您的症状比较明显，建议尽快来诊所面诊。我需要进一步检查才能给出准确的建议，请预约最近可用的复诊时间。';
  }

  if (level === 'caution') {
    const parts: string[] = [];
    if (symptoms.includes('brush-bleeding')) {
      parts.push('出血情况在洁治后早期较常见，继续坚持轻柔的巴氏刷牙法，一般1-2周会明显改善');
    }
    if (symptoms.includes('cold-sensitive')) {
      parts.push('冷热敏感可以试试用脱敏牙膏，将牙膏涂抹在敏感部位停留几分钟再刷牙');
    }
    if (symptoms.includes('gum-swelling')) {
      parts.push('牙龈酸胀感通常会逐渐消退，可以用淡盐水漱口帮助缓解');
    }
    if (symptoms.includes('bad-breath')) {
      parts.push('口气变化可能与清洁不彻底有关，注意舌苔清洁和使用牙线');
    }
    if (symptoms.includes('loose-feeling')) {
      parts.push('轻微松动感在洁治后是正常的，牙周恢复后牙齿会重新稳固，避免咬硬物');
    }
    if (parts.length === 0) {
      return `您反馈的${symptomNames.join('、')}情况我会持续关注，如果加重请及时联系我。`;
    }
    return parts.join('。') + '。如症状持续或加重，建议预约复诊。';
  }

  return '很好，目前没有明显不适症状，继续保持良好的口腔护理习惯！记得按时完成每天的护理任务。';
}

function generateReportReply(reportData: {
  completionRate: number;
  mostCommonSymptomName: string | null;
  nextAdvice: string;
}): string {
  const { completionRate, mostCommonSymptomName } = reportData;
  const parts: string[] = [];

  if (completionRate >= 80) {
    parts.push('您的护理完成率很高，坚持得非常好！这是恢复的关键');
  } else if (completionRate >= 50) {
    parts.push('完成率还有提升空间，建议每天定好闹钟提醒自己完成口腔护理任务');
  } else {
    parts.push('完成率偏低，口腔护理的规律性很重要，建议从最基本的早晚刷牙和饭后漱口开始，逐步养成习惯');
  }

  if (mostCommonSymptomName) {
    parts.push(`我注意到您最常出现的症状是「${mostCommonSymptomName}」，下次复诊时我会重点关注这个情况`);
  }

  if (completionRate >= 60) {
    parts.push('继续保持，有问题随时联系我');
  } else {
    parts.push('建议预约一次复诊，我来帮您评估恢复进度并调整护理方案');
  }

  return parts.join('。') + '。';
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

    updateDayNote: (date, note) => {
      set((state) => {
        const newDayNotes = { ...state.dayNotes };
        if (note.trim()) {
          newDayNotes[date] = note.trim();
        } else {
          delete newDayNotes[date];
        }
        const newState = { dayNotes: newDayNotes };
        saveToStorage({ ...state, ...newState });
        return newState;
      });
    },

    getDayNote: (date) => {
      return get().dayNotes[date] || '';
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

      const replyContent = generateCheckupReply(cardData);

      setTimeout(() => {
        const replyTime = dayjs().format('YYYY-MM-DD HH:mm');
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'dentist',
          content: replyContent,
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

    sendReviewReport: (convId, reportData) => {
      const timestamp = dayjs().format('YYYY-MM-DD HH:mm');
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'patient',
        content: '',
        timestamp,
        reviewReport: {
          completionRate: reportData.completionRate,
          totalCompleted: reportData.totalCompleted,
          totalTasks: reportData.totalTasks,
          consecutiveDays: reportData.consecutiveDays,
          mostCommonSymptomName: reportData.mostCommonSymptomName || '无',
          symptomTrend: reportData.symptomTrend,
          nextAdvice: reportData.nextAdvice,
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
          lastMessage: `[护理复盘] 完成率${reportData.completionRate}%，全勤${reportData.consecutiveDays}天`,
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

      const replyContent = generateReportReply(reportData);

      setTimeout(() => {
        const replyTime = dayjs().format('YYYY-MM-DD HH:mm');
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'dentist',
          content: replyContent,
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

      const getRecentCheckups = (days = 7) => {
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
      };

      const getConsecutiveSymptomDays = (symptomId: string) => {
        const recent = getRecentCheckups(14);
        let count = 0;
        for (const record of recent) {
          if (record.symptoms.includes(symptomId)) {
            count++;
          } else if (count > 0) {
            break;
          }
        }
        return count;
      };

      const symptomTrend = getRecentCheckups(7).map((r) => ({
        date: r.date,
        symptomCount: r.symptoms.length,
      }));

      let nextAdvice = '';
      const bleedingDays = getConsecutiveSymptomDays('brush-bleeding');
      const sensitiveDays = getConsecutiveSymptomDays('cold-sensitive');
      const overallCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

      if (bleedingDays >= 3 || sensitiveDays >= 3) {
        nextAdvice = '您已连续多日出现出血或敏感症状，建议尽快联系医生复诊检查。';
      } else if (overallCompletion < 60) {
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
