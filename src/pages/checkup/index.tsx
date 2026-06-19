import React, { useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import SymptomItemComponent from '@/components/SymptomItem';
import AlertCard from '@/components/AlertCard';
import SymptomTrend from '@/components/SymptomTrend';
import useAppStore from '@/store/useAppStore';
import { symptoms, evaluateSymptomLevel, getLevelInfo } from '@/data/symptoms';
import type { SymptomLevel } from '@/types';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const CheckupPage: React.FC = () => {
  const {
    selectedSymptoms,
    toggleSymptom,
    addCheckupRecord,
    getRecentCheckups,
    getConsecutiveSymptomDays,
    getTodayCheckup,
    sendCheckupCard,
    checkupRecords,
  } = useAppStore();

  const [showTrend, setShowTrend] = useState(true);

  const currentLevel = useMemo(
    () => evaluateSymptomLevel(selectedSymptoms),
    [selectedSymptoms]
  );
  const levelInfo = useMemo(
    () => getLevelInfo(currentLevel),
    [currentLevel]
  );

  const todayCheckup = useMemo(
    () => getTodayCheckup(),
    [getTodayCheckup, checkupRecords]
  );

  const recentCheckups = useMemo(
    () =>
      getRecentCheckups(7).map((r) => ({
        date: r.date,
        level: r.level,
        symptomCount: r.symptoms.length,
      })),
    [getRecentCheckups, checkupRecords]
  );

  const bleedingDays = useMemo(
    () => getConsecutiveSymptomDays('brush-bleeding'),
    [getConsecutiveSymptomDays, checkupRecords]
  );
  const sensitiveDays = useMemo(
    () => getConsecutiveSymptomDays('cold-sensitive'),
    [getConsecutiveSymptomDays, checkupRecords]
  );

  const hasConsecutiveWarning = bleedingDays >= 3 || sensitiveDays >= 3;

  const handleSubmit = () => {
    addCheckupRecord(selectedSymptoms, currentLevel);
    Taro.showToast({
      title: '自查结果已记录',
      icon: 'success',
    });
  };

  const handleConsult = () => {
    const symptomNames = selectedSymptoms
      .map((id) => symptoms.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];

    const trend = recentCheckups
      .slice()
      .reverse()
      .map((r) => ({
        date: r.date,
        symptomCount: r.symptomCount,
      }));

    sendCheckupCard('conv-1', {
      date: dayjs().format('YYYY-MM-DD'),
      symptoms: selectedSymptoms,
      symptomNames,
      level: currentLevel,
      trend,
    });

    Taro.navigateTo({ url: `/pages/chat/index?convId=conv-1` });
  };

  const levelClassMap: Record<SymptomLevel, string> = {
    normal: styles.levelNormal,
    caution: styles.levelCaution,
    urgent: styles.levelUrgent,
  };

  const levelLabelMap: Record<SymptomLevel, string> = {
    normal: '正常观察',
    caution: '建议咨询',
    urgent: '尽快复诊',
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>今日症状自查</Text>
        <Text className={styles.subtitle}>请选择您今天出现的症状</Text>
      </View>

      {hasConsecutiveWarning && (
        <View className={styles.warningBanner}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningText}>
            {bleedingDays >= 3
              ? `已连续 ${bleedingDays} 天刷牙出血，建议咨询医生`
              : `已连续 ${sensitiveDays} 天牙齿敏感，建议咨询医生`}
          </Text>
        </View>
      )}

      {showTrend && (
        <View className={styles.trendCard}>
          <View className={styles.trendHeader}>
            <Text className={styles.trendTitle}>📊 近7天趋势</Text>
            <Text
              className={styles.trendToggle}
              onClick={() => setShowTrend(false)}
            >
              收起
            </Text>
          </View>
          <SymptomTrend records={recentCheckups} days={7} />
        </View>
      )}

      {!showTrend && (
        <View className={styles.trendCardMini} onClick={() => setShowTrend(true)}>
          <Text className={styles.trendTitleMini}>📊 查看7天趋势</Text>
          <Text className={styles.trendArrow}>›</Text>
        </View>
      )}

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
                {currentLevel === 'urgent'
                  ? '立即联系医生'
                  : '带着症状去问医生'}
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
          {recentCheckups.slice(0, 5).map((record) => (
            <View className={styles.historyItem} key={record.date}>
              <Text className={styles.historyDate}>{record.date}</Text>
              <Text className={styles.historySymptoms}>
                {record.symptomCount > 0
                  ? `${record.symptomCount} 项症状`
                  : '无不适'}
              </Text>
              <View
                className={classnames(
                  styles.historyLevel,
                  levelClassMap[record.level]
                )}
              >
                <Text>{levelLabelMap[record.level]}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CheckupPage;
