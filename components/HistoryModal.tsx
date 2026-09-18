import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdherence } from '@/hooks/useAdherence';
import { getWeekdayLabel, summarizeDay, DaySummary } from '@/utils/adherence';
import { useTheme } from '@/context/ThemeContext';
import { historyModalStyles as styles } from '@/styles/medicationStyles';

function dotColor(day: DaySummary, colors: ReturnType<typeof useTheme>['colors']) {
  if (day.total === 0) return colors.pending;
  if (day.notTaken > 0) return '#E25356';
  if (day.taken === day.total) return '#43D6A8';
  return colors.pending;
}

// Self-contained header button + "Adherence History" modal: last-7-days
// percentage, current streak, and a day-by-day strip. Shares its data
// source (useAdherence) with the streak banner on the home screen.
export function HistoryModal() {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const { statuses, streak, adherencePercent, last7Days, refresh } = useAdherence();

  return (
    <>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => {
          refresh();
          setVisible(true);
        }}
        testID="historyButton"
      >
        <MaterialCommunityIcons name="chart-line" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>Adherence History</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={[styles.statValue, { color: colors.text }]}>{adherencePercent}%</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Last 7 days</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.statBlock}>
                <View style={styles.streakRow}>
                  <MaterialCommunityIcons name="fire" size={20} color="#FF7755" />
                  <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day streak</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.daysRow}>
              {[...last7Days].reverse().map((date) => {
                const day = summarizeDay(statuses, date);
                return (
                  <View key={date} style={styles.dayCell}>
                    <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{getWeekdayLabel(date)}</Text>
                    <View style={[styles.dayDot, { backgroundColor: dotColor(day, colors) }]} />
                    <Text style={[styles.dayFraction, { color: colors.textFaint }]}>
                      {day.total === 0 ? '–' : `${day.taken}/${day.total}`}
                    </Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.accent }]} onPress={() => setVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
