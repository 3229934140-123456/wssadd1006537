import type { Conversation, ChatMessage } from '@/types';

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    dentistId: 'dentist-1',
    dentistName: '王医生',
    dentistAvatar: 'https://picsum.photos/id/64/200/200',
    lastMessage: '今天牙龈出血情况有好转吗？记得按时使用牙线哦',
    lastTime: '10:30',
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    dentistId: 'dentist-2',
    dentistName: '李医生',
    dentistAvatar: 'https://picsum.photos/id/91/200/200',
    lastMessage: '复诊时间可以安排在下周三下午',
    lastTime: '昨天',
    unreadCount: 0,
  },
];

export const chatMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      sender: 'dentist',
      content: '您好，洁治后第3天了，感觉怎么样？',
      timestamp: '2024-01-03 09:00',
    },
    {
      id: 'msg-2',
      sender: 'patient',
      content: '刷牙的时候还有点出血，不过比昨天好多了',
      timestamp: '2024-01-03 09:15',
    },
    {
      id: 'msg-3',
      sender: 'dentist',
      content: '出血减少是好现象，说明牙龈在恢复。请继续使用巴氏刷牙法，力度轻柔一些',
      timestamp: '2024-01-03 09:20',
    },
    {
      id: 'msg-4',
      sender: 'patient',
      content: '好的，牙线也每天在用',
      timestamp: '2024-01-03 09:25',
    },
    {
      id: 'msg-5',
      sender: 'dentist',
      content: '非常好！坚持使用牙线对恢复很有帮助。如果出血持续超过2周，及时联系我',
      timestamp: '2024-01-03 09:30',
    },
    {
      id: 'msg-6',
      sender: 'dentist',
      content: '今天牙龈出血情况有好转吗？记得按时使用牙线哦',
      timestamp: '2024-01-04 10:30',
    },
  ],
  'conv-2': [
    {
      id: 'msg-7',
      sender: 'dentist',
      content: '您好，我是负责您后续护理的李医生',
      timestamp: '2024-01-02 14:00',
    },
    {
      id: 'msg-8',
      sender: 'patient',
      content: '李医生您好，我想预约下周的复诊',
      timestamp: '2024-01-02 14:10',
    },
    {
      id: 'msg-9',
      sender: 'dentist',
      content: '复诊时间可以安排在下周三下午',
      timestamp: '2024-01-02 14:15',
    },
  ],
};
