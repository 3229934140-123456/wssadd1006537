import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface SymptomItemProps {
  icon: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

const SymptomItemComponent: React.FC<SymptomItemProps> = ({ icon, name, selected, onClick }) => {
  return (
    <View
      className={classnames(styles.item, selected && styles.itemSelected)}
      onClick={onClick}
    >
      <Text className={styles.icon}>{icon}</Text>
      <Text className={classnames(styles.name, selected && styles.nameSelected)}>{name}</Text>
    </View>
  );
};

export default SymptomItemComponent;
