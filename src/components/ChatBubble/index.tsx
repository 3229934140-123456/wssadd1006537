import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { ChatMessage } from '@/types';
import CheckupCard from '@/components/CheckupCard';
import styles from './index.module.scss';

interface ChatBubbleProps {
  message: ChatMessage;
  dentistAvatar?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, dentistAvatar }) => {
  const isDentist = message.sender === 'dentist';

  return (
    <View className={classnames(styles.row, isDentist ? styles.rowLeft : styles.rowRight)}>
      {isDentist && (
        <Image
          className={styles.avatar}
          src={dentistAvatar || ''}
          mode="aspectFill"
          onError={(e) => console.error('[ChatBubble] avatar load error', e)}
        />
      )}
      <View className={classnames(styles.bubble, isDentist ? styles.bubbleLeft : styles.bubbleRight)}>
        {message.checkupCard && (
          <CheckupCard
            date={message.checkupCard.date}
            symptomNames={message.checkupCard.symptomNames}
            level={message.checkupCard.level}
            trend={message.checkupCard.trend}
          />
        )}
        {message.imageUrl && !message.checkupCard && (
          <Image
            className={styles.msgImage}
            src={message.imageUrl}
            mode="aspectFill"
            onError={(e) => console.error('[ChatBubble] image load error', e)}
          />
        )}
        {message.content && !message.checkupCard && (
          <Text className={styles.msgText}>{message.content}</Text>
        )}
      </View>
    </View>
  );
};

export default ChatBubble;
