import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

// Styles for the main medication list screen (app/(tabs)/index.tsx).
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  streakBannerText: {
    fontFamily: 'medium',
    fontSize: RFValue(13),
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  categoryButtonText: {
    color: '#333333',
    fontFamily: 'medium',
    fontSize: RFValue(14),
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: 'bold',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  emptyText: {
    fontFamily: 'bold',
    fontSize: RFValue(16),
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    // `bottom` is completed with the device's safe-area inset at the call
    // site (app/(tabs)/index.tsx) so the button clears the home indicator /
    // gesture bar instead of relying on a fixed guess.
    right: 10,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

// Styles for a single medication row (components/MedicationCard.tsx).
export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
    elevation: 2,
  },
  actionBadge: {
    flexDirection: 'row',
    position: 'absolute',
    top: -15,
    right: 10,
    backgroundColor: '#DCEDFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 70,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  iconAndInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  iconWrapperSyrup: {
    width: 70,
    height: 70,
    backgroundColor: '#DCEDFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconWrapperPills: {
    width: 70,
    height: 70,
    backgroundColor: '#FDEBDD',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontFamily: 'medium',
  },
  cardDetails: {
    fontSize: RFValue(14),
    color: '#777',
    fontFamily: 'medium',
  },
  cardNotes: {
    fontSize: RFValue(12),
    fontFamily: 'regular',
    fontStyle: 'italic',
    marginTop: 2,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  timeChipText: {
    fontSize: RFValue(12),
    fontFamily: 'bold',
  },
});

// Styles for the add/edit medication form modal (components/AddMedicationModal.tsx).
export const formModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  dragHandle: {
    width: 50,
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontFamily: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  timesWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  timeTagText: {
    fontFamily: 'medium',
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTimeButtonText: {
    fontFamily: 'medium',
    fontSize: RFValue(13),
  },
  helperText: {
    fontSize: RFValue(12),
    fontFamily: 'regular',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
    minHeight: 60,
    textAlignVertical: 'top',
    fontFamily: 'regular',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: RFValue(16),
    fontFamily: 'medium',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  quantityTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quantityTypeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  quantityTypeText: {
    color: '#333',
    fontFamily: 'medium',
  },
  quantityTypeTextActive: {
    color: '#fff',
    fontFamily: 'bold',
  },
  quantityChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  quantityChipActive: {
    backgroundColor: '#4CAF50',
    elevation: 3,
    borderWidth: 0,
  },
  quantityChipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: RFValue(14),
  },
  quantityChipTextActive: {
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontFamily: 'bold',
  },
});

// Styles for the "did you take it?" / snooze modal (components/DoseCheckModal.tsx).
export const doseModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 30,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(18),
    marginBottom: 4,
    fontFamily: 'bold',
  },
  subtitle: {
    fontSize: RFValue(13),
    fontFamily: 'medium',
    marginBottom: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 20,
  },
  yesButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  noButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF7755',
    borderRadius: 10,
  },
  snoozeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7E8EFF',
    borderRadius: 10,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'bold',
  },
  snoozeLabel: {
    marginBottom: 10,
    fontFamily: 'bold',
  },
  snoozeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  snoozeOption: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  snoozeOptionText: {
    color: 'white',
    fontFamily: 'medium',
  },
});

// Styles for the "About HealTime" modal (components/AboutModal.tsx).
export const aboutModalStyles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 30,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 12,
  },
  appName: {
    fontSize: RFValue(20),
    fontFamily: 'bold',
    color: '#0C1824',
  },
  version: {
    fontSize: RFValue(13),
    color: '#777',
    fontFamily: 'medium',
    marginTop: 2,
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  authorLabel: {
    fontSize: RFValue(12),
    color: '#999',
    fontFamily: 'medium',
  },
  authorName: {
    fontSize: RFValue(15),
    fontFamily: 'bold',
    color: '#333333',
    marginTop: 2,
  },
  authorLink: {
    fontSize: RFValue(13),
    color: '#007AFF',
    fontFamily: 'medium',
    marginTop: 6,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'bold',
  },
  themeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  themeRowLabel: {
    fontSize: RFValue(14),
    fontFamily: 'medium',
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  themeOptionText: {
    fontSize: RFValue(12),
    fontFamily: 'medium',
  },
});

// Styles for the "Adherence History" modal (components/HistoryModal.tsx).
export const historyModalStyles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  box: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  statBlock: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: RFValue(24),
    fontFamily: 'bold',
  },
  statLabel: {
    fontSize: RFValue(12),
    fontFamily: 'medium',
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 20,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayCell: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: RFValue(11),
    fontFamily: 'medium',
  },
  dayDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dayFraction: {
    fontSize: RFValue(10),
    fontFamily: 'medium',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'bold',
  },
});
