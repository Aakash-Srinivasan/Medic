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
import { getMedications, Medication, saveMedication } from '../../storage/medicationStorage';
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

  useEffect(() => {
    const fetchMeds = async () => {
      const meds = await getMedications();
      setMedications(meds);
    };
    fetchMeds();
  }, []);

  const scheduleMedicationNotification = async () => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    if (!name) {
      Alert.alert('Please enter all fields correctly');
      return;
    }

    const now = new Date();
    const currentSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const targetSeconds = hour * 3600 + minute * 60;
    let differenceInSeconds = targetSeconds - currentSeconds;

    if (differenceInSeconds < 0) {
      differenceInSeconds += 24 * 3600;
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medication Reminder',
        body: `It's time to take your ${name} (${foodTiming})`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: differenceInSeconds,
      },
    });

    const newMed = {
      id: uuidv4(),
      name,
      hour,
      minute,
      foodTiming,
      quantityType,
      quantity,
    };

    await saveMedication(newMed);

    Alert.alert('Scheduled!', `Reminder for ${name} set at ${hour}:${minute}`);
    setName('');
    setTime(new Date());
    setFoodTiming('Before Food');
    setQuantityType('Pills');
    setQuantity(1);
    setInputModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardTime}>
              Time: {item.hour.toString().padStart(2, '0')}:
              {item.minute.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.cardDetails}>
              {item.foodTiming} - {item.quantity} {item.quantityType}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No medications scheduled yet.</Text>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setInputModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>


      <Modal visible={inputModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Medication</Text>
            <TouchableOpacity onPress={() => setInputModalVisible(false)}>
              <AntDesign name="closesquare" size={24} color="black" />
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                setFoodTiming(foodTiming === 'Before Food' ? 'After Food' : 'Before Food')
              }
            >
              <Text style={styles.dropdownText}>{foodTiming}</Text>
            </TouchableOpacity>
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
              onPress={scheduleMedicationNotification}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  card: {
    flex: 1,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardTime: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: '#777',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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