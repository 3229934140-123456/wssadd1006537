import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidHide, useDidShow } from '@tarojs/taro';
import ChatBubble from '@/components/ChatBubble';
import useAppStore from '@/store/useAppStore';
import dayjs from 'dayjs';
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

const ChatPage: React.FC = () => {
  const router = useRouter();
  const convId = router.params.convId || 'conv-1';
  const prefill = router.params.prefill || '';

  const {
    conversations,
    sendMessage,
    markConversationRead,
    setActiveConversation,
  } = useAppStore();

  const [inputValue, setInputValue] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');

  const conversation = useMemo(
    () => conversations[convId],
    [conversations, convId]
  );

  const messages = conversation?.messages || [];
  const dentistAvatar = DENTIST_INFO[convId]?.avatar || '';
  const dentistName = DENTIST_INFO[convId]?.name || '医生';

  useEffect(() => {
    if (prefill) {
      try {
        setInputValue(decodeURIComponent(prefill));
      } catch (e) {
        setInputValue(prefill);
      }
    }
  }, [prefill]);

  useDidShow(() => {
    setActiveConversation(convId);
    markConversationRead(convId);
  });

  useDidHide(() => {
    setActiveConversation(null);
  });

  useEffect(() => {
    markConversationRead(convId);
    setActiveConversation(convId);
    return () => {
      setActiveConversation(null);
    };
  }, [convId, markConversationRead, setActiveConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        Taro.createSelectorQuery()
          .select('#msg-bottom')
          .boundingClientRect((rect: any) => {
            if (rect) {
              Taro.pageScrollTo({
                scrollTop: rect.bottom,
                duration: 300,
              });
            }
          })
          .exec();
      }, 200);
    }
  }, [messages.length]);

  const handleChoosePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths[0];
        setSelectedPhoto(path);
      },
      fail: (err) => {
        console.error('[Chat] choose image error', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto('');
  };

  const handleSend = () => {
    if (!inputValue.trim() && !selectedPhoto) return;

    sendMessage(convId, inputValue.trim(), selectedPhoto || undefined);
    setInputValue('');
    setSelectedPhoto('');
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.detail.value);
  };

  const handleInputConfirm = () => {
    handleSend();
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const prevDate = dayjs(messages[index - 1].timestamp).format('YYYY-MM-DD');
    const currDate = dayjs(messages[index].timestamp).format('YYYY-MM-DD');
    return prevDate !== currDate;
  };

  const formatDateLabel = (timestamp: string) => {
    const d = dayjs(timestamp);
    const now = dayjs();
    if (d.isSame(now, 'day')) return '今天';
    if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
    return d.format('YYYY年MM月DD日');
  };

  return (
    <View className={styles.container}>
      <View className={styles.navBar}>
        <Text className={styles.navBack} onClick={() => Taro.navigateBack()}>
          ‹
        </Text>
        <Text className={styles.navTitle}>{dentistName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className={styles.messageList} scrollY scrollIntoView="msg-bottom" scrollWithAnimation>
        {messages.map((msg, idx) => (
          <View key={msg.id}>
            {shouldShowDate(idx) && (
              <View className={styles.dateDivider}>
                <Text className={styles.dateText}>
                  {formatDateLabel(msg.timestamp)}
                </Text>
              </View>
            )}
            <ChatBubble message={msg} dentistAvatar={dentistAvatar} />
          </View>
        ))}
        <View id="msg-bottom" style={{ height: '1rpx' }} />
      </ScrollView>

      {selectedPhoto && (
        <View className={styles.photoPreviewBar}>
          <View className={styles.photoPreviewWrap}>
            <Image
              className={styles.photoPreview}
              src={selectedPhoto}
              mode="aspectFill"
            />
            <View
              className={styles.removePhotoBtn}
              onClick={handleRemovePhoto}
            >
              <Text className={styles.removePhotoText}>×</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.inputBar}>
        <View className={styles.photoBtn} onClick={handleChoosePhoto}>
          <Text className={styles.photoIcon}>📷</Text>
        </View>
        <View className={styles.inputWrap}>
          <Input
            className={styles.input}
            value={inputValue}
            placeholder="输入消息..."
            placeholderClass={styles.inputPlaceholder}
            onInput={handleInputChange}
            onConfirm={handleInputConfirm}
            confirmType="send"
            adjustPosition
          />
        </View>
        <View
          className={`${styles.sendBtn} ${
            inputValue.trim() || selectedPhoto ? styles.sendBtnActive : ''
          }`}
          onClick={handleSend}
        >
          <Text className={styles.sendBtnText}>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;
