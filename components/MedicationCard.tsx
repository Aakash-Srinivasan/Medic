import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons';
import { MedicationWithStatus, DoseStatus } from '@/hooks/useMedications';
import { formatTime } from '@/utils/time';
import { useTheme } from '@/context/ThemeContext';
import { cardStyles } from '@/styles/medicationStyles';

interface MedicationCardProps {
  medication: MedicationWithStatus;
  onEdit: () => void;
  onDelete: () => void;
}

const getStatusColor = (status: DoseStatus, pendingColor: string) => {
  if (status === 'taken') return '#43D6A8';
  if (status === 'not taken') return '#E25356';
  return pendingColor;
};

export function MedicationCard({ medication, onEdit, onDelete }: MedicationCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[cardStyles.card, { backgroundColor: colors.surface }]}>
      <View style={[cardStyles.actionBadge, { backgroundColor: colors.badgeBlue }]}>
        <TouchableOpacity onPress={onEdit} style={{ marginRight: 10 }}>
          <Entypo name="edit" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <MaterialIcons name="delete" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={cardStyles.row}>
        <View style={cardStyles.iconAndInfo}>
          {medication.quantityType === 'Syrup' ? (
            <View style={[cardStyles.iconWrapperSyrup, { backgroundColor: colors.badgeBlue }]}>
              <Image source={require('@/assets/images/cough-syrup.png')} style={cardStyles.icon} />
            </View>
          ) : (
            <View style={[cardStyles.iconWrapperPills, { backgroundColor: colors.badgeOrange }]}>
              <Image source={require('@/assets/images/medicine.png')} style={cardStyles.icon} />
            </View>
          )}

          <View style={{ flexDirection: 'column', flexShrink: 1 }}>
            <Text style={[cardStyles.cardTitle, { color: colors.text }]}>{medication.name}</Text>
            <Text style={[cardStyles.cardDetails, { color: colors.textMuted }]}>
              {medication.quantity}
              {medication.quantityType === 'Syrup' ? ' ml' : ` ${medication.quantityType}`}
              {' • '}
              {medication.foodTiming}
            </Text>
            {medication.notes ? (
              <Text style={[cardStyles.cardNotes, { color: colors.textFaint }]} numberOfLines={2}>
                {medication.notes}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={cardStyles.timesRow}>
        {medication.times.map((t) => {
          const status = medication.statusByTime[`${t.hour}:${t.minute}`] ?? 'not yet';
          return (
            <View key={`${t.hour}:${t.minute}`} style={[cardStyles.timeChip, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[cardStyles.timeChipText, { color: colors.text }]}>{formatTime(t.hour, t.minute)}</Text>
              <AntDesign name="check-circle" size={16} color={getStatusColor(status, colors.pending)} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
