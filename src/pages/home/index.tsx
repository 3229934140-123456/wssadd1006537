import React, { useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import TaskCard from '@/components/TaskCard';
import CalendarView from '@/components/CalendarView';
import useAppStore from '@/store/useAppStore';
import { getTasksForDay } from '@/data/tasks';
import { getDayLabel } from '@/utils';
import dayjs from 'dayjs';
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
  const {
    currentDay,
    startDate,
    activeView,
    setActiveView,
    getTaskStatus,
    getDayRecords,
    getDayNote,
    taskRecords,
    dayNotes,
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [, setRefreshKey] = useState(0);

  useDidShow(() => {
    setRefreshKey((k) => k + 1);
  });

  const selectedDayNumber = useMemo(() => {
    const day = dayjs(selectedDate).diff(dayjs(startDate), 'day') + 1;
    return Math.min(Math.max(day, 1), 30);
  }, [selectedDate, startDate]);

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

  const dayTasks = useMemo(
    () => getTasksForDay(selectedDayNumber),
    [selectedDayNumber]
  );

  const dayRecords = useMemo(
    () => getDayRecords(selectedDate),
    [selectedDate, getDayRecords, taskRecords]
  );

  const completedCount = useMemo(
    () => dayRecords.filter((r) => r.status === 'completed').length,
    [dayRecords, taskRecords]
  );

  const totalCount = dayTasks.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getStatus = (taskId: string): TaskStatus => {
    return getTaskStatus(taskId, selectedDate);
  };

  const handleTaskClick = (taskId: string) => {
    if (dayjs(selectedDate).isAfter(dayjs(), 'day')) {
      Taro.showToast({ title: '未来日期不能打卡', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/taskDetail/index?taskId=${taskId}&date=${selectedDate}`,
    });
  };

  const handleTabChange = (view: 'today' | 'calendar') => {
    if (view === 'today') {
      setSelectedDate(dayjs().format('YYYY-MM-DD'));
    }
    setActiveView(view);
  };

  const handleDayClick = (date: string, dayNumber: number) => {
    setSelectedDate(date);
  };

  const tip = getTipForDay(selectedDayNumber);
  const dayLabel = getDayLabel(selectedDayNumber);
  const today = dayjs().format('YYYY-MM-DD');
  const selectedDayNote = useMemo(
    () => getDayNote(selectedDate),
    [selectedDate, getDayNote, dayNotes]
  );
  const todayRecords = useMemo(
    () => getDayRecords(today),
    [today, getDayRecords, taskRecords]
  );
  const todayCompleted = useMemo(
    () => todayRecords.filter((r) => r.status === 'completed').length,
    [todayRecords, taskRecords]
  );
  const todayTotal = getTasksForDay(currentDay).length;
  const todayPercent = useMemo(
    () =>
      todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
    [todayCompleted, todayTotal]
  );

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
          <View className={styles.phaseTag}>
            <Text className={styles.phaseTagText}>{dayLabel}</Text>
          </View>
        </View>
        <View className={styles.progressTrack}>
          <View
            className={styles.progressFill}
            style={{ width: `${todayPercent}%` }}
          />
        </View>
        <View className={styles.progressInfo}>
          <Text className={styles.progressPercent}>今日完成 {todayPercent}%</Text>
          <Text className={styles.completedInfo}>
            {todayCompleted}/{todayTotal} 项已完成
          </Text>
        </View>
      </View>

      <View className={styles.viewTabs}>
        <View
            className={classnames(
              styles.tabItem,
              activeView === 'today' && styles.tabActive
            )}
            onClick={() => handleTabChange('today')}
          >
          <Text
            className={classnames(
              styles.tabText,
              activeView === 'today' && styles.tabTextActive
            )}
          >
            今日任务
          </Text>
        </View>
        <View
            className={classnames(
              styles.tabItem,
              activeView === 'calendar' && styles.tabActive
            )}
            onClick={() => handleTabChange('calendar')}
          >
          <Text
            className={classnames(
              styles.tabText,
              activeView === 'calendar' && styles.tabTextActive
            )}
          >
            日历视图
          </Text>
        </View>
      </View>

      {activeView === 'today' && (
        <View>
          <Text className={styles.sectionTitle}>今日任务</Text>
          <View className={styles.taskList}>
            {dayTasks.map((task) => (
              <TaskCard
                key={task.id}
                icon={task.icon}
                title={task.title}
                description={task.description}
                category={task.category}
                status={getStatus(task.id)}
                onClick={() => handleTaskClick(task.id)}
              />
            ))}
          </View>
          <View className={styles.tipCard}>
            <Text className={styles.tipTitle}>💡 今日护理提示</Text>
            <Text className={styles.tipText}>{tip}</Text>
          </View>
        </View>
      )}

      {activeView === 'calendar' && (
        <View>
          <CalendarView
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />

          <View className={styles.dayDetail}>
            <View className={styles.dayDetailHeader}>
              <Text className={styles.dayDetailTitle}>
                {dayjs(selectedDate).format('MM月DD日')} · 第{selectedDayNumber}天
                {isToday && <Text className={styles.todayTag}>今天</Text>}
              </Text>
              <Text className={styles.dayDetailCount}>
                {completedCount}/{totalCount} 已完成
              </Text>
            </View>

            {dayTasks.length > 0 ? (
              <View className={styles.taskList}>
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    icon={task.icon}
                    title={task.title}
                    description={task.description}
                    category={task.category}
                    status={getStatus(task.id)}
                    onClick={() => handleTaskClick(task.id)}
                  />
                ))}
              </View>
            ) : (
              <View className={styles.emptyTip}>
                <Text className={styles.emptyText}>
                  {dayjs(selectedDate).isAfter(dayjs(), 'day')
                    ? '这一天还没到哦'
                    : '这一天没有护理任务'}
                </Text>
              </View>
            )}

            {selectedDayNote && (
              <View className={styles.notePreview}>
                <Text className={styles.notePreviewIcon}>📝</Text>
                <Text className={styles.notePreviewText}>{selectedDayNote}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default HomePage;
