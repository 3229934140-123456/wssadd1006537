import dayjs from 'dayjs';

export function formatTime(time: string): string {
  const t = dayjs(time);
  const now = dayjs();
  if (t.isSame(now, 'day')) return t.format('HH:mm');
  if (t.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
  if (now.diff(t, 'day') < 7) return `${now.diff(t, 'day')}天前`;
  return t.format('MM/DD');
}

export function getDayLabel(day: number): string {
  if (day <= 7) return '第1周 · 基础清洁期';
  if (day <= 14) return '第2周 · 深度护理期';
  if (day <= 21) return '第3周 · 习惯巩固期';
  return '第4周+ · 长期维护期';
}

export function getDayPhaseColor(day: number): string {
  if (day <= 7) return '#2BA471';
  if (day <= 14) return '#3491FA';
  if (day <= 21) return '#7B61FF';
  return '#FF7D00';
}
