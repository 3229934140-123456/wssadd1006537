import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import TaskCard from '@/components/TaskCard';
import useAppStore from '@/store/useAppStore';
import { getTasksForDay } from '@/data/tasks';
import { getDayLabel } from '@/utils';
import type { TaskStatus } from '@/types';
import styles from './index.module.scss';

const DAILY_TIPS: Record<string, string> = {
  '1-3': '洁治后前3天，牙龈可能有些敏感，请用温水漱口，刷牙力度要轻柔。少量出血属正常现象，不必紧张。',
  '4-7': '从第4天开始，可以加入牙线清洁。出血情况应该逐渐减少，如果持续出血请及时联系医生。',
  '8-14': '第二周了！牙龈应该明显恢复，可以开始使用牙间刷。继续坚持巴氏刷牙法，养成早晚刷牙的好习惯。',
  '15-21': '第三周，您的口腔护理习惯正在巩固。可以加入舌苔清洁和牙龈按摩，全面呵护口腔健康。',
  '22-30': '最后一周！坚持就是胜利。继续保持所有护理习惯，为长期口腔健康打下基础。',
};

function getTipForDay(day: number): string {
  if (day <= 3) return DAILY_TIPS['1-3'];
  if (day <= 7) return DAILY_TIPS['4-7'];
  if (day <= 14) return DAILY_TIPS['8-14'];
  if (day <= 21) return DAILY_TIPS['15-21'];
  return DAILY_TIPS['22-30'];
}

const HomePage: React.FC = () => {
  const { currentDay, todayRecords, updateTaskStatus } = useAppStore();

  const todayTasks = useMemo(() => getTasksForDay(currentDay), [currentDay]);
  const completedCount = useMemo(
    () => todayRecords.filter((r) => r.status === 'completed').length,
    [todayRecords]
  );
  const totalCount = todayTasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getTaskStatus = (taskId: string): TaskStatus => {
    const record = todayRecords.find((r) => r.taskId === taskId);
    return record?.status || 'pending';
  };

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/taskDetail/index?taskId=${taskId}` });
  };

  const tip = getTipForDay(currentDay);
  const dayLabel = getDayLabel(currentDay);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>今天要做的维护任务</Text>
        <Text className={styles.subtitle}>坚持30天，养成口腔护理好习惯</Text>
      </View>

      <View className={styles.progressCard}>
        <View className={styles.progressHeader}>
          <View>
            <Text className={styles.dayLabel}>洁治后第</Text>
            <Text className={styles.dayNumber}>{currentDay} 天</Text>
          </View>
          <View className={styles.phaseTag} style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Text className={styles.phaseTagText}>{dayLabel}</Text>
          </View>
        </View>
        <View className={styles.progressTrack}>
          <View className={styles.progressFill} style={{ width: `${percentage}%` }} />
        </View>
        <View className={styles.progressInfo}>
          <Text className={styles.progressPercent}>今日完成 {percentage}%</Text>
          <Text className={styles.completedInfo}>
            {completedCount}/{totalCount} 项已完成
          </Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>今日任务</Text>

      <View className={styles.taskList}>
        {todayTasks.map((task) => (
          <TaskCard
            key={task.id}
            icon={task.icon}
            title={task.title}
            description={task.description}
            category={task.category}
            status={getTaskStatus(task.id)}
            onClick={() => handleTaskClick(task.id)}
          />
        ))}
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 今日护理提示</Text>
        <Text className={styles.tipText}>{tip}</Text>
      </View>
    </View>
  );
};

export default HomePage;
