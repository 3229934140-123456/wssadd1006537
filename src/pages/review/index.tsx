import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useAppStore from '@/store/useAppStore';
import { symptoms } from '@/data/symptoms';
import SymptomTrend from '@/components/SymptomTrend';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const {
    getReviewStats,
    startDate,
    currentDay,
    taskRecords,
    checkupRecords,
    sendReviewReport,
  } = useAppStore();

  const stats = useMemo(
    () => getReviewStats(),
    [getReviewStats, taskRecords, checkupRecords]
  );

  const mostCommonSymptomName = useMemo(() => {
    if (!stats.mostCommonSymptom) return null;
    const s = symptoms.find((item) => item.id === stats.mostCommonSymptom);
    return s?.name || null;
  }, [stats.mostCommonSymptom]);

  const trendRecords = useMemo(() => {
    return stats.symptomTrend.map((r) => ({
      date: r.date,
      level: 'normal' as const,
      symptomCount: r.symptomCount,
    }));
  }, [stats.symptomTrend]);

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('MM月DD日');
  };

  const handleSendToDoctor = () => {
    sendReviewReport('conv-1', {
      completionRate: stats.completionRate,
      totalCompleted: stats.totalCompleted,
      totalTasks: stats.totalTasks,
      consecutiveDays: stats.consecutiveDays,
      mostCommonSymptomName,
      symptomTrend: stats.symptomTrend,
      nextAdvice: stats.nextAdvice,
    });

    Taro.showToast({ title: '报告已发送给医生', icon: 'success' });

    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/chat/index?convId=conv-1' });
    }, 800);
  };

  return (
    <View className={styles.container}>
      <View className={styles.navBar}>
        <Text className={styles.navBack} onClick={() => Taro.navigateBack()}>
          ‹
        </Text>
        <Text className={styles.navTitle}>30天护理复盘</Text>
        <View style={{ width: 60 }} />
      </View>

      <View className={styles.scrollArea}>
        <View className={styles.headerCard}>
          <Text className={styles.headerTitle}>护理进度总览</Text>
          <Text className={styles.headerSubtitle}>
            从{formatDate(startDate)}开始，已坚持 {currentDay} 天
          </Text>
        </View>

        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.completionRate}%</Text>
            <Text className={styles.statLabel}>任务完成率</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.totalCompleted}</Text>
            <Text className={styles.statLabel}>累计完成任务</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.consecutiveDays}</Text>
            <Text className={styles.statLabel}>连续全勤天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>
              {stats.totalTasks - stats.totalCompleted}
            </Text>
            <Text className={styles.statLabel}>待完成</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🏥</Text>
            <Text className={styles.sectionTitle}>最常出现的不适</Text>
          </View>
          {mostCommonSymptomName ? (
            <View className={styles.symptomResult}>
              <Text className={styles.symptomName}>{mostCommonSymptomName}</Text>
              <Text className={styles.symptomDesc}>
                这是您这30天内最常出现的症状，建议在复诊时向医生说明。
              </Text>
            </View>
          ) : (
            <View className={styles.noSymptom}>
              <Text className={styles.noSymptomText}>
                🎉 太棒了！这段时间没有明显的不适症状
              </Text>
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📊</Text>
            <Text className={styles.sectionTitle}>近7天症状变化</Text>
          </View>
          <SymptomTrend records={trendRecords} days={7} />
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>💡</Text>
            <Text className={styles.sectionTitle}>下一步建议</Text>
          </View>
          <View className={styles.adviceCard}>
            <Text className={styles.adviceText}>{stats.nextAdvice}</Text>
          </View>
        </View>

        <View className={styles.sendBtn} onClick={handleSendToDoctor}>
          <Text className={styles.sendBtnIcon}>📨</Text>
          <Text className={styles.sendBtnText}>发送护理报告给医生</Text>
        </View>

        <View className={styles.encourageCard}>
          <Text className={styles.encourageText}>
            {stats.completionRate >= 80
              ? '🌟 表现优秀！继续保持良好的口腔护理习惯'
              : stats.completionRate >= 50
                ? '💪 还不错！再坚持一下，胜利就在眼前'
                : '🎯 加油！每天进步一点点，30天后遇见更好的自己'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReviewPage;
