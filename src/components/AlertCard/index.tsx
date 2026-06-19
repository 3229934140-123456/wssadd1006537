import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface AlertCardProps {
  level: 'normal' | 'caution' | 'urgent';
  label: string;
  description: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ level, label, description }) => {
  return (
    <View className={classnames(styles.card, styles[`level${level.charAt(0).toUpperCase() + level.slice(1)}`])}>
      <View className={styles.header}>
        <View className={styles.indicator} />
        <Text className={styles.label}>{label}</Text>
      </View>
      <Text className={styles.description}>{description}</Text>
    </View>
  );
};

export default AlertCard;
