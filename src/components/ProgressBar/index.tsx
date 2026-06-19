import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  return (
    <View className={styles.container}>
      {label && <Text className={styles.label}>{label}</Text>}
      <View className={styles.track}>
        <View className={styles.fill} style={{ width: `${percentage}%` }} />
      </View>
      <Text className={styles.percent}>{percentage}%</Text>
    </View>
  );
};

export default ProgressBar;
