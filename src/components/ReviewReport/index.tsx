import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import styles from './index.module.scss';

interface ReviewReportProps {
  completionRate: number;
  totalCompleted: number;
  totalTasks: number;
  consecutiveDays: number;
  mostCommonSymptomName: string;
  symptomTrend: { date: string; symptomCount: number }[];
  nextAdvice: string;
  compact?: boolean;
}

const ReviewReport: React.FC<ReviewReportProps> = ({
  completionRate,
  totalCompleted,
  totalTasks,
  consecutiveDays,
  mostCommonSymptomName,
  nextAdvice,
  compact = false,
}) => {
  const maxTrendCount = useMemo(() => {
    return Math.max(3, ...nextAdvice ? [3] : [3]);
  }, []);

  if (compact) {
    return (
      <View className={styles.compactCard}>
        <View className={styles.compactHeader}>
          <Text className={styles.compactLabel}>📈 护理复盘报告</Text>
          <Text className={styles.compactRate}>完成率 {completionRate}%</Text>
        </View>
        <Text className={styles.compactSummary}>
          全勤{consecutiveDays}天 · 完成{totalCompleted}/{totalTasks}项
        </Text>
      </View>
    );
  }

  return (
    <View className={styles.card}>
      <View className={styles.cardHeader}>
        <Text className={styles.cardIcon}>📈</Text>
        <View className={styles.headerInfo}>
          <Text className={styles.cardTitle}>30天护理复盘报告</Text>
          <Text className={styles.cardDate}>
            {dayjs().format('YYYY年MM月DD日')}
          </Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{completionRate}%</Text>
          <Text className={styles.statLabel}>完成率</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{totalCompleted}/{totalTasks}</Text>
          <Text className={styles.statLabel}>完成任务</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{consecutiveDays}</Text>
          <Text className={styles.statLabel}>全勤天数</Text>
        </View>
      </View>

      {mostCommonSymptomName && mostCommonSymptomName !== '无' && (
        <View className={styles.symptomRow}>
          <Text className={styles.symptomLabel}>常见不适：</Text>
          <Text className={styles.symptomValue}>{mostCommonSymptomName}</Text>
        </View>
      )}

      <View className={styles.adviceRow}>
        <Text className={styles.adviceLabel}>💡 建议</Text>
        <Text className={styles.adviceText}>{nextAdvice}</Text>
      </View>
    </View>
  );
};

export default ReviewReport;
