import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useAppStore from '@/store/useAppStore';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const MENU_ITEMS = [
  { icon: '📋', text: '洁治记录', action: '' },
  { icon: '📅', text: '复诊提醒', action: '' },
  { icon: '📖', text: '护理知识', action: '' },
  { icon: '⚙️', text: '设置', action: '' },
];

const ProfilePage: React.FC = () => {
  const {
    currentDay,
    startDate,
    taskRecords,
    checkupRecords,
    getTotalUnread,
  } = useAppStore();

  const totalCompletedTasks = useMemo(() => {
    let count = 0;
    Object.values(taskRecords).forEach((records) => {
      records.forEach((r) => {
        if (r.status === 'completed') count++;
      });
    });
    return count;
  }, [taskRecords]);

  const totalCheckups = useMemo(() => {
    return checkupRecords.length;
  }, [checkupRecords]);

  const unreadCount = useMemo(() => getTotalUnread(), [getTotalUnread]);

  const handleMenuClick = (text: string) => {
    Taro.showToast({ title: `${text}功能开发中`, icon: 'none' });
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY年MM月DD日');
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileCard}>
        <View className={styles.profileHeader}>
          <Image
            className={styles.profileAvatar}
            src="https://picsum.photos/id/338/200/200"
            mode="aspectFill"
          />
          <View className={styles.profileInfo}>
            <Text className={styles.profileName}>张小美</Text>
            <Text className={styles.profilePhone}>138****6789</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{currentDay}</Text>
            <Text className={styles.statLabel}>护理天数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalCompletedTasks}</Text>
            <Text className={styles.statLabel}>已完成任务</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalCheckups}</Text>
            <Text className={styles.statLabel}>自查记录</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>洁治信息</Text>
      <View className={styles.scalingCard}>
        <View className={styles.scalingHeader}>
          <View>
            <Text className={styles.scalingDoctor}>王医生</Text>
            <Text className={styles.scalingDate}>
              洁治日期：{formatDate(startDate)}
            </Text>
          </View>
        </View>
        <Text className={styles.scalingType}>全口洁治 · 牙周基础治疗</Text>
      </View>

      <Text className={styles.sectionTitle}>消息提醒</Text>
      <View className={styles.menuCard}>
        <View
          className={styles.menuItem}
          onClick={() => Taro.switchTab({ url: '/pages/messages/index' })}
        >
          <View className={styles.menuLeft}>
            <Text className={styles.menuIcon}>💬</Text>
            <Text className={styles.menuText}>医生消息</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <View className={styles.unreadBadge}>
                <Text className={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>更多服务</Text>
      <View className={styles.menuCard}>
        {MENU_ITEMS.map((item) => (
          <View
            className={styles.menuItem}
            key={item.text}
            onClick={() => handleMenuClick(item.text)}
          >
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.text}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfilePage;
