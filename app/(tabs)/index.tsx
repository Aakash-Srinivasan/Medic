import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMedications, MedicationFormValues } from '@/hooks/useMedications';
import { useMedicationForm } from '@/hooks/useMedicationForm';
import { useDoseReminder } from '@/hooks/useDoseReminder';
import { useAdherence } from '@/hooks/useAdherence';
import { useTheme } from '@/context/ThemeContext';
import { MedicationCard } from '@/components/MedicationCard';
import { AddMedicationModal } from '@/components/AddMedicationModal';
import { DoseCheckModal } from '@/components/DoseCheckModal';
import { getCurrentTimeCategory, getTimeCategory, formatTime, TimeCategory } from '@/utils/time';
import { screenStyles as styles } from '@/styles/medicationStyles';

const CATEGORIES: TimeCategory[] = ['Morning', 'Afternoon', 'Evening'];

export default function MedicationScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { medications, fetchMedications, addMedication, editMedication, removeMedication } = useMedications();
  const adherence = useAdherence();
  const form = useMedicationForm();
  const handleStatusRecorded = () => {
    fetchMedications();
    adherence.refresh();
  };
  const doseReminder = useDoseReminder(medications, handleStatusRecorded);
  const [selectedCategory, setSelectedCategory] = useState<TimeCategory>(getCurrentTimeCategory());

  const handleSubmit = async () => {
    if (!form.name || form.times.length === 0) {
      Alert.alert('Please enter a name and at least one dose time.');
      return;
    }

    const values: MedicationFormValues = {
      name: form.name,
      times: form.times,
      foodTiming: form.foodTiming,
      quantityType: form.quantityType,
      quantity: form.quantity,
      notes: form.notes || undefined,
    };

    const timesSummary = form.times.map((t) => formatTime(t.hour, t.minute)).join(', ');

    if (form.isEditing && form.editingId) {
      await editMedication(form.editingId, values);
      Alert.alert('Updated', `${values.name} updated successfully.`);
    } else {
      await addMedication(values);
      Alert.alert('Scheduled!', `Reminder${form.times.length > 1 ? 's' : ''} for ${values.name} set at ${timesSummary}`);
    }

    form.reset();
  };

  const handleDelete = (medicationId: string) => {
    const medToDelete = medications.find((m) => m.id === medicationId);
    if (!medToDelete) return;

    Alert.alert('Delete Medication', `Do you really want to delete "${medToDelete.name}" schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeMedication(medicationId);
          Alert.alert('Deleted', `${medToDelete.name} has been deleted.`);
        },
      },
    ]);
  };

  // A medication shows up under a category tab if ANY of its dose times
  // falls in that part of the day (a twice-daily med can appear under both
  // Morning and Evening).
  const filteredMeds = medications.filter((med) =>
    med.times.some((t) => getTimeCategory(t.hour) === selectedCategory)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {adherence.streak > 0 && (
        <View style={[styles.streakBanner, { backgroundColor: colors.surfaceAlt }]}>
          <MaterialCommunityIcons name="fire" size={18} color="#FF7755" />
          <Text style={[styles.streakBannerText, { color: colors.text }]}>
            {adherence.streak}-day streak - keep it going!
          </Text>
        </View>
      )}

      <View style={[styles.categoryTabs, { backgroundColor: colors.surface }]}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryButton, isSelected && { backgroundColor: colors.accent }]}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: colors.textMuted },
                  isSelected && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredMeds.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('@/assets/images/emptyMed.png')} style={styles.emptyImage} />
          <Text style={[styles.emptyText, { color: colors.textFaint }]}>No medications in {selectedCategory}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicationCard medication={item} onEdit={() => form.openForEdit(item)} onDelete={() => handleDelete(item.id)} />
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { bottom: 24 + insets.bottom, backgroundColor: colors.accent }]}
        onPress={form.openForAdd}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <AddMedicationModal
        visible={form.visible}
        isEditing={form.isEditing}
        name={form.name}
        onChangeName={form.setName}
        times={form.times}
        onAddTime={form.addTime}
        onRemoveTime={form.removeTime}
        foodTiming={form.foodTiming}
        onChangeFoodTiming={form.setFoodTiming}
        quantityType={form.quantityType}
        onChangeQuantityType={form.setQuantityType}
        quantity={form.quantity}
        onChangeQuantity={form.setQuantity}
        notes={form.notes}
        onChangeNotes={form.setNotes}
        onClose={form.close}
        onSubmit={handleSubmit}
      />

      <DoseCheckModal
        visible={doseReminder.visible}
        medicationName={doseReminder.activeMedicationName}
        activeTimeLabel={doseReminder.activeTimeLabel}
        showSnoozeOptions={doseReminder.showSnoozeOptions}
        onYes={() => doseReminder.recordStatus('taken')}
        onNo={() => doseReminder.recordStatus('not taken')}
        onOpenSnooze={doseReminder.openSnoozeOptions}
        onSnooze={doseReminder.snooze}
      />
    </View>
  );
}
