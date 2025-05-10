import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { deleteMedication, getAllStatuses, getMedications, Medication, saveMedication, updateMedication } from '../../storage/medicationStorage';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function MedicationForm() {
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());
  const [foodTiming, setFoodTiming] = useState('Before Food');
  const [quantityType, setQuantityType] = useState('Pills');
  const [quantity, setQuantity] = useState(1); // Default for pills
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notificationId, setNotificationId] = useState('');

  const getCurrentTimeCategory = (): 'Morning' | 'Afternoon' | 'Evening' => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    return 'Evening';
  };
  const [selectedCategory, setSelectedCategory] = useState<'Morning' | 'Afternoon' | 'Evening'>(getCurrentTimeCategory());

  const formatTime = (hour: number, minute: number) => {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fetchMeds = async () => {
    const meds = await getMedications();
    const statuses = await getAllStatuses();
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const mergedMeds = meds.map((med) => {
      const statusEntry = statuses.find(
        (s) => s.medicationId === med.id && s.date === today
      );
      return {
        ...med,
        status: statusEntry ? statusEntry.status : 'not yet',
      };
    });

    setMedications(mergedMeds); // Assume `setMedications` accepts MedicationWithStatus[]
  };

  useEffect(() => {
    fetchMeds();
  }, [notificationId]);

  const handleSaveMedication = async () => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    if (!name) {
      Alert.alert('Please enter all fields correctly');
      return;
    }

    if (isEditing && editingId) {
      // 🔁 Cancel old notification first (you must get it from the med being edited)
      const meds = await getMedications();
      const oldMed = meds.find(m => m.id === editingId);
      if (oldMed?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(oldMed.notificationId);
      }

      // ✅ Schedule a new one
      const newNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `It's time to take your ${name} (${foodTiming})`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      const updatedMed: Medication = {
        id: editingId,
        name,
        hour,
        minute,
        foodTiming,
        quantityType,
        quantity,
        notificationId: newNotificationId,
      };

      await updateMedication(updatedMed);
      Alert.alert('Updated', `${name} updated successfully.`);
    } else {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `It's time to take your ${name} (${foodTiming})`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      const newMed: Medication = {
        id: uuidv4(),
        name,
        hour,
        minute,
        foodTiming,
        quantityType,
        quantity,
        notificationId,
      };
      await saveMedication(newMed);
      Alert.alert('Scheduled!', `Reminder for ${name} set at ${hour}:${minute}`);
    }

    // Reset state
    setName('');
    setTime(new Date());
    setFoodTiming('Before Food');
    setQuantityType('Pills');
    setQuantity(1);
    setIsEditing(false);
    setEditingId(null);
    setInputModalVisible(false);
    fetchMeds();
  };


  const handleEdit = (med: Medication) => {
    setName(med.name);
    setTime(new Date(new Date().setHours(med.hour, med.minute)));
    setFoodTiming(med.foodTiming);
    setQuantityType(med.quantityType);
    setQuantity(med.quantity);
    setEditingId(med.id);
    setIsEditing(true);
    setInputModalVisible(true);
    setNotificationId(med.notificationId);
  };

  const handleDelete = async (medicationId: string) => {
    const meds = await getMedications();
    const medToDelete = meds.find(m => m.id === medicationId);

    if (medToDelete?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(medToDelete.notificationId);
    }

    await deleteMedication(medicationId); // Your custom delete function
    Alert.alert('Deleted', `${medToDelete?.name} has been deleted.`);
    fetchMeds(); // Refresh the list
  };


  const getTimeCategory = (hour: number) => {
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };


  const filteredMeds = medications.filter(
    (med) => getTimeCategory(med.hour) === selectedCategory
  );


  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,  }}>
        {['Morning', 'Afternoon', 'Evening'].map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat as any)} style={{}}>
            <Text style={{ fontWeight: selectedCategory === cat ? 'bold' : 'normal' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{  height: '100%' }}>
        {filteredMeds.length === 0 ? (
          <Text style={styles.emptyText}>No medications in {selectedCategory}</Text>
        ) : (
          <FlatList
            data={filteredMeds}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginRight: 10 }}>
                      <AntDesign name="edit" size={20} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <AntDesign name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cardTime}>
                  Time: {formatTime(item.hour, item.minute)}
                </Text>
                <Text style={styles.cardDetails}>
                  {item.foodTiming} - {item.quantity} {item.quantityType}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      item.status === 'taken'
                        ? 'green'
                        : item.status === 'not taken'
                          ? 'red'
                          : 'orange',
                  }}
                >
                  {item.status}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setInputModalVisible(true)}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>


        <Modal visible={inputModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' ,alignItems:'center',width:'100%',marginBottom: 15,}}>
                <Text style={styles.modalTitle}>Schedule Medication</Text>
                <TouchableOpacity onPress={() => setInputModalVisible(false)}>
                  <AntDesign name="closesquare" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Medicine Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.timePickerButton}
              >
                <Text style={styles.timePickerText}>
                  Select Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>

              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setTime(selectedTime);
                  }}
                />
              )}
              <Text style={styles.label}>Food Timing</Text>
             <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityTypeButton,
                    foodTiming === 'Before Food' && styles.quantityTypeButtonActive,
                  ]}
                  onPress={() => setFoodTiming('Before Food')}
                >
                  <Text
                    style={[
                      styles.quantityTypeText,
                      foodTiming === 'Before Food' && styles.quantityTypeTextActive,
                    ]}
                  >
                    Before Food
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.quantityTypeButton,
                    foodTiming === 'After Food' && styles.quantityTypeButtonActive,
                  ]}
                  onPress={() => setFoodTiming('After Food')}
                >
                  <Text
                    style={[
                      styles.quantityTypeText,
                      foodTiming === 'After Food' && styles.quantityTypeTextActive,
                    ]}
                  >
                    After Food
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityTypeButton,
                    quantityType === 'Pills' && styles.quantityTypeButtonActive,
                  ]}
                  onPress={() => setQuantityType('Pills')}
                >
                  <Text
                    style={[
                      styles.quantityTypeText,
                      quantityType === 'Pills' && styles.quantityTypeTextActive,
                    ]}
                  >
                    Pills
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.quantityTypeButton,
                    quantityType === 'Syrup' && styles.quantityTypeButtonActive,
                  ]}
                  onPress={() => setQuantityType('Syrup')}
                >
                  <Text
                    style={[
                      styles.quantityTypeText,
                      quantityType === 'Syrup' && styles.quantityTypeTextActive,
                    ]}
                  >
                    Syrup
                  </Text>
                </TouchableOpacity>
              </View>
              {quantityType === 'Pills' ? (
                <FlatList
                  horizontal
                  data={Array.from({ length: 20 }, (_, i) => i + 1)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setQuantity(item)}
                      style={[
                        {
                          padding: 10,
                          marginHorizontal: 5,
                          borderRadius: 6,
                          backgroundColor: quantity === item ? '#4CAF50' : '#eee',
                        },
                      ]}
                    >
                      <Text style={{ color: quantity === item ? '#fff' : '#000' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                />

              ) : (
                <>
                  <Text style={styles.mlLabel}>Select Syrup Quantity (ml)</Text>
                  <FlatList
                    data={[...Array(6)].map((_, i) => (i + 1) * 5)} // 5ml to 30ml
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.toString()}
                    contentContainerStyle={styles.mlList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setQuantity(item)}
                        style={[
                          styles.mlItem,
                          quantity === item && styles.mlItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.mlItemText,
                            quantity === item && styles.mlItemTextSelected,
                          ]}
                        >
                          {item} ml
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}

              <TouchableOpacity
                onPress={handleSaveMedication}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  categoryButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#7E8EFF',
  },
  activeText: {
    color: 'white',
  },
  inactiveText: {
    color: 'black',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTime: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  mlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  mlList: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  mlItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  mlItemSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mlItemText: {
    fontSize: 16,
    color: '#333',
  },
  mlItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  medicationDetails: {
    color: '#777',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  timePickerButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  timePickerText: {
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  dropdownText: {
    textAlign: 'center',
    color: '#333',
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
  },
  quantityTypeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});