import React, { useMemo, useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import useAppStore from '@/store/useAppStore';
import { tasks } from '@/data/tasks';
import dayjs from 'dayjs';
import classnames from 'classnames';
import type { TaskStatus } from '@/types';
import styles from './index.module.scss';

const statusLabels: Record<TaskStatus, string> = {
  pending: '待完成',
  completed: '已完成',
  skipped: '不会做',
  uncomfortable: '不舒服',
};

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.taskId || '';
  const date = router.params.date || dayjs().format('YYYY-MM-DD');
  const { getTaskStatus, updateTaskStatus, getDayNote, updateDayNote, taskRecords, dayNotes } = useAppStore();

  const [noteInput, setNoteInput] = useState(() => getDayNote(date));

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [taskId]);
  const currentStatus = useMemo(
    () => getTaskStatus(taskId, date),
    [taskId, date, getTaskStatus, taskRecords]
  );

  const isFuture = dayjs(date).isAfter(dayjs(), 'day');
  const isToday = date === dayjs().format('YYYY-MM-DD');

  const handleNoteBlur = () => {
    updateDayNote(date, noteInput);
  };

  const handleNoteChange = (e: any) => {
    setNoteInput(e.detail.value);
  };

  if (!task) {
    return (
      <View className={styles.container}>
        <View className={styles.content}>
          <Text>任务未找到</Text>
        </View>
      </View>
    );
  }

  const handleFeedback = (status: TaskStatus) => {
    if (isFuture) {
      Taro.showToast({ title: '未来日期不能打卡', icon: 'none' });
      return;
    }
    updateTaskStatus(taskId, status, date);
    Taro.showToast({
      title: status === 'completed' ? '已标记完成 ✓' : statusLabels[status],
      icon: 'none',
    });
  };

  return (
    <View className={styles.container}>
      <Image
        className={styles.coverImage}
        src={task.imageUrl}
        mode="aspectFill"
        onError={(e) => console.error('[TaskDetail] image load error', e)}
      />
      <View className={styles.content}>
        <View className={styles.taskHeader}>
          <View className={styles.taskIconRow}>
            <Text className={styles.taskIcon}>{task.icon}</Text>
            <Text className={styles.taskTitle}>{task.title}</Text>
          </View>
          <View className={styles.categoryTag}>
            <Text className={styles.categoryText}>{task.category}</Text>
          </View>
          <Text className={styles.taskDesc}>{task.description}</Text>

          {!isToday && (
            <View className={styles.dateTag}>
              <Text className={styles.dateTagText}>
                {dayjs(date).format('YYYY年MM月DD日')}
              </Text>
            </View>
          )}

          {currentStatus !== 'pending' && (
            <View
              className={classnames(
                styles.currentStatus,
                styles[`status${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`]
              )}
            >
              <Text className={styles.currentStatusText}>
                当前状态：{statusLabels[currentStatus]}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.guideCard}>
          <Text className={styles.guideTitle}>📖 详细说明</Text>
          <Text className={styles.guideText}>{task.guide}</Text>
        </View>

        {!isFuture && (
          <View className={styles.noteCard}>
            <Text className={styles.noteTitle}>📝 今日备注</Text>
            <Text className={styles.noteHint}>
              记录不舒服原因、不会做卡在哪、或其他想备注的内容
            </Text>
            <Input
              className={styles.noteInput}
              value={noteInput}
              placeholder="例如：刷牙时右边牙龈有点痛..."
              placeholderClass={styles.notePlaceholder}
              onInput={handleNoteChange}
              onBlur={handleNoteBlur}
              confirmType="done"
            />
          </View>
        )}
      </View>

      {!isFuture && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(
              styles.feedbackBtn,
              styles.btnCompleted,
              currentStatus === 'completed' && styles.btnActive
            )}
            onClick={() => handleFeedback('completed')}
          >
            <Text>✓ 已完成</Text>
          </View>
          <View
            className={classnames(
              styles.feedbackBtn,
              styles.btnSkipped,
              currentStatus === 'skipped' && styles.btnActive
            )}
            onClick={() => handleFeedback('skipped')}
          >
            <Text>不会做</Text>
          </View>
          <View
            className={classnames(
              styles.feedbackBtn,
              styles.btnUncomfortable,
              currentStatus === 'uncomfortable' && styles.btnActive
            )}
            onClick={() => handleFeedback('uncomfortable')}
          >
            <Text>不舒服</Text>
          </View>
        </View>
      )}

      {isFuture && (
        <View className={styles.bottomBar}>
          <View className={styles.futureTip}>
            <Text className={styles.futureTipText}>
              未来日期暂不可打卡
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TaskDetailPage;
