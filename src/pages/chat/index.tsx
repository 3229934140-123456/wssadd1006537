import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import ChatBubble from '@/components/ChatBubble';
import { chatMessages, conversations } from '@/data/messages';
import type { ChatMessage } from '@/types';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ChatPage: React.FC = () => {
  const router = useRouter();
  const convId = router.params.convId || 'conv-1';
  const [messages, setMessages] = useState<ChatMessage[]>(
    chatMessages[convId] || []
  );
  const [inputValue, setInputValue] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');

  const conversation = useMemo(
    () => conversations.find((c) => c.id === convId),
    [convId]
  );

  const handleChoosePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths[0];
        setSelectedPhoto(path);
        console.info('[Chat] photo selected', path);
      },
      fail: (err) => {
        console.error('[Chat] choose image error', err);
      },
    });
  };

  const handleSend = () => {
    if (!inputValue && !selectedPhoto) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      content: inputValue,
      imageUrl: selectedPhoto || undefined,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setSelectedPhoto('');

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'dentist',
        content: '收到您的消息，我会尽快回复您。',
        timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <ScrollView className={styles.messageList} scrollY scrollIntoView="">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            dentistAvatar={conversation?.dentistAvatar}
          />
        ))}
      </ScrollView>

      <View className={styles.inputBar}>
        <View className={styles.photoBtn} onClick={handleChoosePhoto}>
          <Text className={styles.photoIcon}>📷</Text>
        </View>
        <View className={styles.inputWrap}>
          <Text className={styles.inputText}>
            {inputValue || '输入消息...'}
          </Text>
        </View>
        <View className={styles.sendBtn} onClick={handleSend}>
          <Text className={styles.sendBtnText}>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
