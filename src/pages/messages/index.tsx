import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useAppStore from '@/store/useAppStore';
import styles from './index.module.scss';

const DENTIST_INFO: Record<string, { name: string; avatar: string }> = {
  'conv-1': {
    name: '王医生',
    avatar: 'https://picsum.photos/id/64/200/200',
  },
  'conv-2': {
    name: '李医生',
    avatar: 'https://picsum.photos/id/91/200/200',
  },
};

const MessagesPage: React.FC = () => {
  const { conversations } = useAppStore();

  const convList = useMemo(() => {
    return Object.entries(conversations)
      .map(([id, conv]) => ({
        id,
        dentistName: DENTIST_INFO[id]?.name || '医生',
        dentistAvatar: DENTIST_INFO[id]?.avatar || '',
        lastMessage: conv.lastMessage,
        lastTime: conv.lastTime,
        unreadCount: conv.unreadCount,
      }))
      .sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        return 0;
      });
  }, [conversations]);

  const totalUnread = useMemo(() => {
    return Object.values(conversations).reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    );
  }, [conversations]);

  const handleConvClick = (convId: string) => {
    Taro.navigateTo({ url: `/pages/chat/index?convId=${convId}` });
  };

  const handleAsk = () => {
    Taro.navigateTo({ url: '/pages/chat/index?convId=conv-1' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>消息</Text>
        <View className={styles.askBtn} onClick={handleAsk}>
          <Text className={styles.askBtnText}>一键提问</Text>
        </View>
      </View>

      <View className={styles.convList}>
        {convList.map((conv) => (
          <View
            className={styles.convCard}
            key={conv.id}
            onClick={() => handleConvClick(conv.id)}
          >
            <Image
              className={styles.avatar}
              src={conv.dentistAvatar}
              mode="aspectFill"
              onError={(e) =>
                console.error('[Messages] avatar error', e)
              }
            />
            <View className={styles.convContent}>
              <View className={styles.convHeader}>
                <Text className={styles.convName}>{conv.dentistName}</Text>
                <Text className={styles.convTime}>{conv.lastTime}</Text>
              </View>
              <Text className={styles.convMsg}>{conv.lastMessage}</Text>
            </View>
            {conv.unreadCount > 0 && (
              <View className={styles.unreadBadge}>
                <Text className={styles.unreadText}>
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MessagesPage;
