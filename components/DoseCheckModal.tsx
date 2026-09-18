import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { doseModalStyles as styles } from '@/styles/medicationStyles';

interface DoseCheckModalProps {
  visible: boolean;
  medicationName: string;
  activeTimeLabel: string | null;
  showSnoozeOptions: boolean;
  onYes: () => void;
  onNo: () => void;
  onOpenSnooze: () => void;
  onSnooze: (minutes: number) => void;
}

const SNOOZE_OPTIONS = [1, 5, 10];

export function DoseCheckModal({
  visible,
  medicationName,
  activeTimeLabel,
  showSnoozeOptions,
  onYes,
  onNo,
  onOpenSnooze,
  onSnooze,
}: DoseCheckModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Did you take {medicationName}?</Text>
          {activeTimeLabel ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{activeTimeLabel} dose</Text>
          ) : null}

          {!showSnoozeOptions ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={onYes} style={styles.yesButton}>
                <Text style={styles.actionButtonText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onNo} style={styles.noButton}>
                <Text style={styles.actionButtonText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onOpenSnooze} style={styles.snoozeButton}>
                <Text style={styles.actionButtonText}>Snooze</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.snoozeLabel, { color: colors.text }]}>Snooze for how many minutes?</Text>
              <View style={styles.snoozeOptionsRow}>
                {SNOOZE_OPTIONS.map((min) => (
                  <TouchableOpacity key={min} style={styles.snoozeOption} onPress={() => onSnooze(min)}>
                    <Text style={styles.snoozeOptionText}>{min} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
