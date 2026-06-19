import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import SymptomItemComponent from '@/components/SymptomItem';
import AlertCard from '@/components/AlertCard';
import useAppStore from '@/store/useAppStore';
import { symptoms, evaluateSymptomLevel, getLevelInfo } from '@/data/symptoms';
import type { SymptomLevel } from '@/types';
import dayjs from 'dayjs';
import styles from './index.module.scss';

interface HistoryRecord {
  date: string;
  level: SymptomLevel;
  symptomCount: number;
}

const MOCK_HISTORY: HistoryRecord[] = [
  { date: dayjs().subtract(1, 'day').format('MM-DD'), level: 'caution', symptomCount: 2 },
  { date: dayjs().subtract(2, 'day').format('MM-DD'), level: 'normal', symptomCount: 0 },
  { date: dayjs().subtract(3, 'day').format('MM-DD'), level: 'caution', symptomCount: 1 },
  { date: dayjs().subtract(4, 'day').format('MM-DD'), level: 'normal', symptomCount: 0 },
];

const CheckupPage: React.FC = () => {
  const { selectedSymptoms, toggleSymptom } = useAppStore();

  const currentLevel = useMemo(() => evaluateSymptomLevel(selectedSymptoms), [selectedSymptoms]);
  const levelInfo = useMemo(() => getLevelInfo(currentLevel), [currentLevel]);

  const handleSubmit = () => {
    Taro.showToast({
      title: '自查结果已记录',
      icon: 'success',
    });
    console.info('[Checkup] symptoms submitted', { selectedSymptoms, level: currentLevel });
  };

  const handleConsult = () => {
    Taro.switchTab({ url: '/pages/messages/index' });
  };

  const levelClassMap: Record<SymptomLevel, string> = {
    normal: styles.levelNormal,
    caution: styles.levelCaution,
    urgent: styles.levelUrgent,
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>今日症状自查</Text>
        <Text className={styles.subtitle}>请选择您今天出现的症状</Text>
      </View>

      <View className={styles.questionCard}>
        <Text className={styles.questionLabel}>您今天有以下哪些不适？</Text>
        <View className={styles.symptomGrid}>
          {symptoms.map((symptom) => (
            <View className={styles.symptomItem} key={symptom.id}>
              <SymptomItemComponent
                icon={symptom.icon}
                name={symptom.name}
                selected={selectedSymptoms.includes(symptom.id)}
                onClick={() => toggleSymptom(symptom.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {selectedSymptoms.length > 0 && (
        <View className={styles.resultSection}>
          <Text className={styles.resultTitle}>评估结果</Text>
          <AlertCard
            level={currentLevel}
            label={levelInfo.label}
            description={levelInfo.description}
          />
          {(currentLevel === 'caution' || currentLevel === 'urgent') && (
            <View className={styles.submitBtn} onClick={handleConsult}>
              <Text className={styles.submitBtnText}>
                {currentLevel === 'urgent' ? '立即联系医生' : '咨询医生'}
              </Text>
            </View>
          )}
        </View>
      )}

      {selectedSymptoms.length === 0 && (
        <View className={styles.emptySymptoms}>
          <Text className={styles.emptyText}>请选择您今天的症状情况</Text>
        </View>
      )}

      <View className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitBtnText}>记录今日自查</Text>
      </View>

      <View className={styles.historyCard}>
        <Text className={styles.historyTitle}>近期自查记录</Text>
        <View className={styles.historyList}>
          {MOCK_HISTORY.map((record) => (
            <View className={styles.historyItem} key={record.date}>
              <Text className={styles.historyDate}>{record.date}</Text>
              <View className={classnames(styles.historyLevel, levelClassMap[record.level])}>
                <Text>
                  {record.level === 'normal'
                    ? '正常观察'
                    : record.level === 'caution'
                    ? '建议咨询'
                    : '尽快复诊'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CheckupPage;
