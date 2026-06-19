import type { SymptomItem } from '@/types';

export const symptoms: SymptomItem[] = [
  {
    id: 'gum-swelling',
    name: '牙龈酸胀',
    icon: '😤',
    description: '牙龈感到酸胀不适，有轻微肿感',
  },
  {
    id: 'cold-sensitive',
    name: '冷热敏感',
    icon: '🥶',
    description: '进食冷热食物时牙齿有敏感酸痛感',
  },
  {
    id: 'brush-bleeding',
    name: '刷牙出血',
    icon: '🩸',
    description: '刷牙时牙龈有出血现象',
  },
  {
    id: 'breath-change',
    name: '口气变化',
    icon: '💨',
    description: '感觉口腔异味加重或口气不清新',
  },
  {
    id: 'gum-redness',
    name: '牙龈发红',
    icon: '🔴',
    description: '牙龈颜色比正常更红或出现局部红肿',
  },
  {
    id: 'tooth-ache',
    name: '牙齿隐痛',
    icon: '😬',
    description: '某颗或某几颗牙齿有持续隐痛感',
  },
  {
    id: 'gum-recession',
    name: '牙龈退缩',
    icon: '📉',
    description: '感觉牙龈位置下降，牙根暴露',
  },
  {
    id: 'loose-feeling',
    name: '牙齿松动',
    icon: '⚠️',
    description: '感觉某颗牙齿有松动感',
  },
];

export function evaluateSymptomLevel(selectedIds: string[]): 'normal' | 'caution' | 'urgent' {
  const urgentSymptoms = ['tooth-ache', 'loose-feeling'];
  const cautionSymptoms = ['gum-swelling', 'cold-sensitive', 'brush-bleeding', 'breath-change', 'gum-redness', 'gum-recession'];

  if (selectedIds.length === 0) return 'normal';

  const hasUrgent = selectedIds.some((id) => urgentSymptoms.includes(id));
  if (hasUrgent) return 'urgent';

  const cautionCount = selectedIds.filter((id) => cautionSymptoms.includes(id)).length;
  if (cautionCount >= 3) return 'urgent';
  if (cautionCount >= 1) return 'caution';

  return 'normal';
}

export function getLevelInfo(level: 'normal' | 'caution' | 'urgent') {
  const map = {
    normal: {
      label: '正常观察',
      color: '#00B42A',
      bgColor: '#E8FFEA',
      description: '当前症状属于洁治后正常恢复反应，请继续按计划护理，保持观察即可。',
    },
    caution: {
      label: '建议咨询',
      color: '#FF7D00',
      bgColor: '#FFF7E8',
      description: '您的症状需要关注，建议通过消息功能咨询您的洁治医生，获取专业建议。',
    },
    urgent: {
      label: '尽快复诊',
      color: '#F53F3F',
      bgColor: '#FFECE8',
      description: '您的症状需要尽快处理，建议立即联系诊所预约复诊，或拨打诊所电话。',
    },
  };
  return map[level];
}
