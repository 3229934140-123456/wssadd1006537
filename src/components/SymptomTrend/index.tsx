import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import dayjs from 'dayjs';
import type { SymptomLevel } from '@/types';
import styles from './index.module.scss';

interface TrendRecord {
  date: string;
  level: SymptomLevel;
  symptomCount: number;
}

interface SymptomTrendProps {
  records: TrendRecord[];
  days?: number;
}

const SymptomTrend: React.FC<SymptomTrendProps> = ({ records, days = 7 }) => {
  const displayRecords = useMemo(() => {
    const result: TrendRecord[] = [];
    const recordMap = new Map(records.map((r) => [r.date, r]));
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      if (recordMap.has(date)) {
        result.push(recordMap.get(date)!);
      } else {
        result.push({ date, level: 'normal', symptomCount: 0 });
      }
    }
    return result;
  }, [records, days]);

  const maxCount = useMemo(() => {
    const max = Math.max(...displayRecords.map((r) => r.symptomCount), 1);
    return Math.max(max, 3);
  }, [displayRecords]);

  const levelColors: Record<SymptomLevel, string> = {
    normal: '#00B42A',
    caution: '#FF7D00',
    urgent: '#F53F3F',
  };

  return (
    <View className={styles.container}>
      <View className={styles.chart}>
        {displayRecords.map((record) => {
          const heightPercent =
            record.symptomCount > 0
              ? (record.symptomCount / maxCount) * 100
              : 8;
          return (
            <View className={styles.barColumn} key={record.date}>
              <View className={styles.barWrap}>
                <View
                  className={classnames(styles.bar, styles[`level${record.level.charAt(0).toUpperCase() + record.level.slice(1)}`])}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: levelColors[record.level],
                  }}
                />
              </View>
              <Text className={styles.barLabel}>
                {dayjs(record.date).format('MM/DD')}
              </Text>
            </View>
          );
        })}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View
            className={styles.legendDot}
            style={{ background: levelColors.normal }}
          />
          <Text className={styles.legendText}>正常</Text>
        </View>
        <View className={styles.legendItem}>
          <View
            className={styles.legendDot}
            style={{ background: levelColors.caution }}
          />
          <Text className={styles.legendText}>需关注</Text>
        </View>
        <View className={styles.legendItem}>
          <View
            className={styles.legendDot}
            style={{ background: levelColors.urgent }}
          />
          <Text className={styles.legendText}>紧急</Text>
        </View>
      </View>
    </View>
  );
};

export default SymptomTrend;
