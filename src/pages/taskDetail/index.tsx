import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import useAppStore from '@/store/useAppStore';
import { tasks } from '@/data/tasks';
import type { TaskStatus } from '@/types';
import styles from './index.module.scss';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.taskId || '';
  const { todayRecords, updateTaskStatus } = useAppStore();

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [taskId]);

  const currentStatus = useMemo((): TaskStatus => {
    const record = todayRecords.find((r) => r.taskId === taskId);
    return record?.status || 'pending';
  }, [todayRecords, taskId]);

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
    updateTaskStatus(taskId, status);
    const labels: Record<TaskStatus, string> = {
      completed: '已标记完成',
      skipped: '已标记不会做',
      uncomfortable: '已标记不舒服',
      pending: '',
    };
    Taro.showToast({ title: labels[status], icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
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
        </View>

        <View className={styles.guideCard}>
          <Text className={styles.guideTitle}>📖 详细说明</Text>
          <Text className={styles.guideText}>{task.guide}</Text>
        </View>
      </View>

      {currentStatus === 'pending' && (
        <View className={styles.bottomBar}>
          <View
            className={`${styles.feedbackBtn} ${styles.btnCompleted}`}
            onClick={() => handleFeedback('completed')}
          >
            <Text>✓ 已完成</Text>
          </View>
          <View
            className={`${styles.feedbackBtn} ${styles.btnSkipped}`}
            onClick={() => handleFeedback('skipped')}
          >
            <Text>不会做</Text>
          </View>
          <View
            className={`${styles.feedbackBtn} ${styles.btnUncomfortable}`}
            onClick={() => handleFeedback('uncomfortable')}
          >
            <Text>不舒服</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TaskDetailPage;
