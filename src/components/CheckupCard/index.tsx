import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import dayjs from 'dayjs';
import type { SymptomLevel } from '@/types';
import { getLevelInfo } from '@/data/symptoms';
import styles from './index.module.scss';

interface CheckupCardProps {
  date: string;
  symptomNames: string[];
  level: SymptomLevel;
  trend?: { date: string; symptomCount: number }[];
  compact?: boolean;
}

const CheckupCard: React.FC<CheckupCardProps> = ({
  date,
  symptomNames,
  level,
  trend,
  compact = false,
}) => {
  const levelInfo = useMemo(() => getLevelInfo(level), [level]);

  const formattedDate = useMemo(() => {
    return dayjs(date).format('MM月DD日');
  }, [date]);

  const symptomText = useMemo(() => {
    if (symptomNames.length === 0) return '无不适';
    return symptomNames.join('、');
  }, [symptomNames]);

  const maxTrendCount = useMemo(() => {
    if (!trend || trend.length === 0) return 1;
    const max = Math.max(...trend.map((t) => t.symptomCount), 1);
    return Math.max(max, 3);
  }, [trend]);

  if (compact) {
    return (
      <View className={styles.compactCard}>
        <View className={styles.compactHeader}>
          <Text className={styles.compactDate}>📋 {formattedDate}自查结果</Text>
          <View
            className={classnames(styles.compactLevel, styles[`level${level.charAt(0).toUpperCase() + level.slice(1)}`])}
          >
            <Text className={styles.compactLevelText}>{levelInfo.label}</Text>
          </View>
        </View>
        <Text className={styles.compactSymptoms}>症状：{symptomText}</Text>
      </View>
    );
  }

  return (
    <View className={styles.card}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <Text className={styles.cardIcon}>📋</Text>
          <View>
            <Text className={styles.cardTitle}>症状自查报告</Text>
            <Text className={styles.cardDate}>{formattedDate}</Text>
          </View>
        </View>
        <View
          className={classnames(styles.levelBadge, styles[`level${level.charAt(0).toUpperCase() + level.slice(1)}`])}
        >
          <Text className={styles.levelText}>{levelInfo.label}</Text>
        </View>
      </View>

      <View className={styles.cardContent}>
        <View className={styles.symptomSection}>
          <Text className={styles.sectionLabel}>今日症状</Text>
          <Text className={styles.symptomText}>{symptomText}</Text>
        </View>

        {trend && trend.length > 0 && (
          <View className={styles.trendSection}>
            <Text className={styles.sectionLabel}>近7天趋势</Text>
            <View className={styles.trendChart}>
              {trend.map((item) => {
                const heightPercent =
                  item.symptomCount > 0
                    ? (item.symptomCount / maxTrendCount) * 100
                    : 10;
                return (
                  <View className={styles.trendBarWrap} key={item.date}>
                    <View className={styles.trendBarContainer}>
                      <View
                        className={styles.trendBar}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </View>
                    <Text className={styles.trendLabel}>
                      {dayjs(item.date).format('MM/DD')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className={styles.adviceSection}>
          <Text className={styles.adviceText}>{levelInfo.description}</Text>
        </View>
      </View>
    </View>
  );
};

export default CheckupCard;
