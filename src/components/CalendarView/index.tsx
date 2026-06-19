import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import dayjs from 'dayjs';
import useAppStore from '@/store/useAppStore';
import { getTasksForDay } from '@/data/tasks';
import type { TaskStatus } from '@/types';
import styles from './index.module.scss';

interface CalendarViewProps {
  onDayClick: (date: string, dayNumber: number) => void;
  selectedDate?: string;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarView: React.FC<CalendarViewProps> = ({ onDayClick, selectedDate }) => {
  const { startDate, taskRecords } = useAppStore();

  const days = useMemo(() => {
    const result: Array<{
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isFuture: boolean;
      completedCount: number;
      totalCount: number;
      hasIssue: boolean;
    }> = [];

    const start = dayjs(startDate);
    const today = dayjs().format('YYYY-MM-DD');
    const selected = selectedDate || today;

    for (let i = 0; i < 30; i++) {
      const date = start.add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const dayNumber = i + 1;
      const isFuture = date.isAfter(dayjs(), 'day');
      const isSelected = dateStr === selected;
      const isToday = dateStr === today;

      const dayTasks = getTasksForDay(dayNumber);
      const records = taskRecords[dateStr] || [];
      const completedCount = records.filter(
        (r) => r.status === 'completed'
      ).length;
      const hasIssue = records.some(
        (r) => r.status === 'uncomfortable' || r.status === 'skipped'
      );

      result.push({
        date: dateStr,
        dayNumber,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isFuture,
        completedCount,
        totalCount: dayTasks.length,
        hasIssue,
      });
    }

    return result;
  }, [startDate, taskRecords, selectedDate]);

  const weekRows = useMemo(() => {
    const rows: typeof days[] = [];
    const firstDay = dayjs(startDate).day();
    const prefix: typeof days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = dayjs(startDate).subtract(i + 1, 'day');
      prefix.push({
        date: d.format('YYYY-MM-DD'),
        dayNumber: 0,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isFuture: false,
        completedCount: 0,
        totalCount: 0,
        hasIssue: false,
      });
    }
    const all = [...prefix, ...days];
    for (let i = 0; i < all.length; i += 7) {
      rows.push(all.slice(i, i + 7));
    }
    return rows;
  }, [days, startDate]);

  return (
    <View className={styles.calendar}>
      <View className={styles.weekHeader}>
        {WEEKDAYS.map((day) => (
          <View className={styles.weekDay} key={day}>
            <Text className={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {weekRows.map((row, rowIdx) => (
          <View className={styles.weekRow} key={rowIdx}>
            {row.map((cell) => {
              const isDisabled = cell.isFuture || !cell.isCurrentMonth;
              const progress =
                cell.totalCount > 0
                  ? Math.round((cell.completedCount / cell.totalCount) * 100)
                  : 0;

              return (
                <View
                  className={classnames(
                    styles.dayCell,
                    !cell.isCurrentMonth && styles.dayDisabled,
                    cell.isFuture && styles.dayFuture,
                    cell.isSelected && styles.daySelected,
                    cell.isToday && styles.dayToday
                  )}
                  key={cell.date}
                  onClick={() =>
                    !isDisabled && onDayClick(cell.date, cell.dayNumber)
                  }
                >
                  <Text
                    className={classnames(
                      styles.dayNumber,
                      cell.isSelected && styles.dayNumberSelected,
                      cell.isToday && !cell.isSelected && styles.dayNumberToday
                    )}
                  >
                    {cell.dayNumber || ''}
                  </Text>
                  {cell.isCurrentMonth && !cell.isFuture && (
                    <View className={styles.dayProgress}>
                      <View
                        className={classnames(
                          styles.progressFill,
                          cell.hasIssue && progress < 100 && styles.progressIssue
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.legendDone)} />
          <Text className={styles.legendText}>已完成</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.legendPartial)} />
          <Text className={styles.legendText}>部分完成</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.legendIssue)} />
          <Text className={styles.legendText}>有不适</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.legendFuture)} />
          <Text className={styles.legendText}>未开始</Text>
        </View>
      </View>
    </View>
  );
};

export default CalendarView;
