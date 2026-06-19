export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'uncomfortable';

export type SymptomLevel = 'normal' | 'caution' | 'urgent';

export type MessageSender = 'patient' | 'dentist';

export interface TaskItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  guide: string;
  imageUrl: string;
  dayRange: [number, number];
  category: string;
}

export interface TaskRecord {
  taskId: string;
  status: TaskStatus;
}

export interface SymptomItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface DailyRecord {
  date: string;
  dayNumber: number;
  taskRecords: TaskRecord[];
  selectedSymptoms: string[];
  symptomLevel: SymptomLevel;
}

export interface Conversation {
  id: string;
  dentistId: string;
  dentistName: string;
  dentistAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  imageUrl?: string;
  timestamp: string;
  checkupCard?: {
    date: string;
    symptoms: string[];
    level: SymptomLevel;
    symptomNames: string[];
    trend: { date: string; symptomCount: number }[];
  };
}
