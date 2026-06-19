import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { TaskStatus } from '@/types';
import styles from './index.module.scss';

interface TaskCardProps {
  icon: string;
  title: string;
  description: string;
  category: string;
  status: TaskStatus;
  onClick: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: '待完成', className: styles.statusPending },
  completed: { label: '已完成', className: styles.statusCompleted },
  skipped: { label: '不会做', className: styles.statusSkipped },
  uncomfortable: { label: '不舒服', className: styles.statusUncomfortable },
};

const TaskCard: React.FC<TaskCardProps> = ({ icon, title, description, category, status, onClick }) => {
  const config = statusConfig[status];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.left}>
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>{icon}</Text>
        </View>
      </View>
      <View className={styles.content}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{title}</Text>
          <View className={classnames(styles.statusBadge, config.className)}>
            <Text className={styles.statusText}>{config.label}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{description}</Text>
        <View className={styles.categoryTag}>
          <Text className={styles.categoryText}>{category}</Text>
        </View>
      </View>
      <View className={styles.arrow}>
        <Text className={styles.arrowIcon}>›</Text>
      </View>
    </View>
  );
};

export default TaskCard;
