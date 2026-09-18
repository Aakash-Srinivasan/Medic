import React from 'react';
import { View, TextInput, Text, Modal, TouchableOpacity, FlatList, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, EvilIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DraftTime } from '@/hooks/useMedicationForm';
import { formatTime } from '@/utils/time';
import { useTheme } from '@/context/ThemeContext';
import { formModalStyles as styles } from '@/styles/medicationStyles';

interface AddMedicationModalProps {
  visible: boolean;
  isEditing: boolean;
  name: string;
  onChangeName: (value: string) => void;
  times: DraftTime[];
  onAddTime: (time: Date) => void;
  onRemoveTime: (index: number) => void;
  foodTiming: string;
  onChangeFoodTiming: (value: string) => void;
  quantityType: string;
  onChangeQuantityType: (value: string) => void;
  quantity: number;
  onChangeQuantity: (value: number) => void;
  notes: string;
  onChangeNotes: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddMedicationModal({
  visible,
  isEditing,
  name,
  onChangeName,
  times,
  onAddTime,
  onRemoveTime,
  foodTiming,
  onChangeFoodTiming,
  quantityType,
  onChangeQuantityType,
  quantity,
  onChangeQuantity,
  notes,
  onChangeNotes,
  onClose,
  onSubmit,
}: AddMedicationModalProps) {
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const quantityOptions =
    quantityType === 'Pills' ? Array.from({ length: 20 }, (_, i) => i + 1) : [...Array(6)].map((_, i) => (i + 1) * 5);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.surface }]}>
        <ScrollView>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{isEditing ? 'Edit Medication' : 'Schedule Medication'}</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close-square" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Medicine Name"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={onChangeName}
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Dose Times</Text>
            <View style={styles.timesWrapRow}>
              {times.map((t, index) => (
                <View key={`${t.hour}:${t.minute}`} style={[styles.timeTag, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.timeTagText, { color: colors.text }]}>{formatTime(t.hour, t.minute)}</Text>
                  <TouchableOpacity onPress={() => onRemoveTime(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <AntDesign name="close" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.addTimeButton, { borderColor: colors.accent }]}>
                <EvilIcons name="clock" size={20} color={colors.accent} />
                <Text style={[styles.addTimeButtonText, { color: colors.accent }]}>Add Time</Text>
              </TouchableOpacity>
            </View>
            {times.length === 0 && (
              <Text style={[styles.helperText, { color: colors.textFaint }]}>Add at least one dose time.</Text>
            )}
            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) onAddTime(selectedTime);
                }}
              />
            )}

            <Text style={[styles.label, { color: colors.text }]}>Food Timing</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityTypeButton,
                  { borderColor: colors.border },
                  foodTiming === 'Before Food' && [styles.quantityTypeButtonActive, { backgroundColor: colors.accent, borderColor: colors.accent }],
                ]}
                onPress={() => onChangeFoodTiming('Before Food')}
              >
                <FontAwesome6 name="bowl-rice" size={24} color={foodTiming === 'Before Food' ? '#FFF' : colors.textMuted} />
                <Text style={[styles.quantityTypeText, { color: colors.textMuted }, foodTiming === 'Before Food' && styles.quantityTypeTextActive]}>
                  Before Food
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quantityTypeButton,
                  { borderColor: colors.border },
                  foodTiming === 'After Food' && [styles.quantityTypeButtonActive, { backgroundColor: colors.accent, borderColor: colors.accent }],
                ]}
                onPress={() => onChangeFoodTiming('After Food')}
              >
                <MaterialCommunityIcons name="bowl" size={24} color={foodTiming === 'After Food' ? '#fff' : colors.textMuted} />
                <Text style={[styles.quantityTypeText, { color: colors.textMuted }, foodTiming === 'After Food' && styles.quantityTypeTextActive]}>
                  After Food
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityTypeButton,
                  { borderColor: colors.border },
                  quantityType === 'Pills' && [styles.quantityTypeButtonActive, { backgroundColor: colors.accent, borderColor: colors.accent }],
                ]}
                onPress={() => onChangeQuantityType('Pills')}
              >
                <FontAwesome6 name="capsules" size={24} color={quantityType === 'Pills' ? '#fff' : colors.textMuted} />
                <Text style={[styles.quantityTypeText, { color: colors.textMuted }, quantityType === 'Pills' && styles.quantityTypeTextActive]}>
                  Pills
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quantityTypeButton,
                  { borderColor: colors.border },
                  quantityType === 'Syrup' && [styles.quantityTypeButtonActive, { backgroundColor: colors.accent, borderColor: colors.accent }],
                ]}
                onPress={() => onChangeQuantityType('Syrup')}
              >
                <MaterialCommunityIcons
                  name="bottle-tonic-plus"
                  size={24}
                  color={quantityType === 'Syrup' ? '#fff' : colors.textMuted}
                />
                <Text style={[styles.quantityTypeText, { color: colors.textMuted }, quantityType === 'Syrup' && styles.quantityTypeTextActive]}>
                  Syrup
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={quantityOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onChangeQuantity(item)}
                  style={[
                    styles.quantityChip,
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    quantity === item && [styles.quantityChipActive, { backgroundColor: colors.accent, borderWidth: 0 }],
                  ]}
                >
                  <Text style={[styles.quantityChipText, { color: colors.textMuted }, quantity === item && styles.quantityChipTextActive]}>
                    {quantityType === 'Pills' ? `${item}` : `${item} ml`}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />

            <Text style={[styles.label, { marginTop: 15, color: colors.text }]}>Notes (optional)</Text>
            <TextInput
              placeholder="e.g. take with water, avoid grapefruit"
              placeholderTextColor={colors.textFaint}
              value={notes}
              onChangeText={onChangeNotes}
              multiline
              style={[styles.notesInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            />

            <TouchableOpacity
              onPress={onSubmit}
              disabled={times.length === 0 || !name.trim()}
              style={[styles.modalButton, { backgroundColor: colors.accent }, (times.length === 0 || !name.trim()) && styles.modalButtonDisabled]}
            >
              <Text style={styles.modalButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
