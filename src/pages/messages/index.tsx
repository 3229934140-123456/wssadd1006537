import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { conversations } from '@/data/messages';
import styles from './index.module.scss';

const MessagesPage: React.FC = () => {
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
        {conversations.map((conv) => (
          <View
            className={styles.convCard}
            key={conv.id}
            onClick={() => handleConvClick(conv.id)}
          >
            <Image
              className={styles.avatar}
              src={conv.dentistAvatar}
              mode="aspectFill"
              onError={(e) => console.error('[Messages] avatar error', e)}
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
                <Text className={styles.unreadText}>{conv.unreadCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MessagesPage;
