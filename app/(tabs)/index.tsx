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
  ScrollView,
  Image,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { deleteMedication, getAllStatuses, getMedications, Medication, saveMedication, updateMedication,saveStatus } from '../../storage/medicationStorage';
import { AntDesign, Entypo, MaterialIcons, EvilIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function MedicationForm() {
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());
  const [foodTiming, setFoodTiming] = useState('Before Food');
  const [quantityType, setQuantityType] = useState('Pills');
  const [quantity, setQuantity] = useState(1);
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
 const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snozzedTab, setSnozzedTab] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [medicationName, setMedicationName] = useState<string | null>(null);


  const handleSnooze = async (minutes: number) => {
    console.log(`Snoozed for ${minutes} minutes`);

    // Schedule a new notification after `minutes` delay
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Medication Reminder',
        body: `Reminder after snooze: It’s time to take your ${medicationName}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
        repeats: false,
      },
    });

    setShowSnoozeOptions(false);
    setModalVisible(false);
  };


  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const name = notification.request.content.body?.split(' ')[5]; // crude extraction
      setMedicationName(name || 'this medication');
      setModalVisible(true); // show modal when opened from notification
    });

    return () => subscription.remove();
  }, []);
  const formatTime = (hour: number, minute: number) => {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fetchMeds = async () => {
    try {
      const meds = await getMedications();
      const statuses = await getAllStatuses();
      const mergedMeds = meds.map((med) => {
        const status = statuses.find(
          (s) => String(s.medicationId) === String(med.id) 
        );
        return {
          ...med,
          status: status ? status.status : 'not yet',
        };
      });

      setMedications(mergedMeds);

    } catch (error) {
      console.error('Error fetching medications or statuses:', error);
    }
  };


  useEffect(() => {
    fetchMeds();
  }, [notificationId]);

  useEffect(() => {
    setQuantity(quantityType === 'Syrup' ? 10 : 1);
  }, [quantityType]);


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
      Alert.alert('Scheduled!', `Reminder for ${name} set at ${hour - 12}:${minute}`);
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

    if (!medToDelete) return;

    Alert.alert(
      'Delete Medication',
      `Do you really want to delete "${medToDelete.name}" schedule?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (medToDelete.notificationId) {
              await Notifications.cancelScheduledNotificationAsync(medToDelete.notificationId);
            }

            await deleteMedication(medicationId);
            Alert.alert('Deleted', `${medToDelete.name} has been deleted.`);
            fetchMeds(); // Refresh the list
          },
        },
      ]
    );
  };


  const getTimeCategory = (hour: number) => {
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };


  const filteredMeds = medications.filter(
    (med) => getTimeCategory(med.hour) === selectedCategory
  );

  const renders = ({ item }: { item: Medication }) => {
    const getStatusColor = (status: 'taken' | 'not taken' | 'not yet') => {
      if (status === 'taken') return '#43D6A8';
      if (status === 'not taken') return '#E25356';
      return '#D7D7D7';
    };

    return (
      <View style={styles.card}>
        <View style={{
          position: 'absolute',
          top: -15,
          left: 10,
          backgroundColor: '#DCEDFE',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          width: 60,
          paddingVertical: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#0077B6',
            textAlign: 'center',
            fontFamily: 'bold'
          }}>
            {formatTime(item.hour, item.minute)}
          </Text>
        </View>
        <View style={{
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
        }}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginRight: 10 }}>
            <Entypo name="edit" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <MaterialIcons name="delete" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10 }}>
            {item.quantityType === "Syrup" ? (
              <View style={{ width: 70, height: 70, backgroundColor: '#DCEDFE', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>

                <Image source={require('@/assets/images/cough-syrup.png')} style={{ width: 50, height: 50 }} />
              </View>
            ) : (
              <View style={{ width: 70, height: 70, backgroundColor: '#FDEBDD', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>

                <Image source={require('@/assets/images/medicine.png')} style={{ width: 50, height: 50 }} />
              </View>
            )}

            <View style={{ flexDirection: 'column' }}>

              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDetails}>
                {item.quantity}
                {item.quantityType === "Syrup" ? " ml" : ` ${item.quantityType}`}
                {' • '}
                {item.foodTiming}
              </Text>

            </View>
          </View>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
            <AntDesign
              name="checkcircle"
              size={40}
              color={getStatusColor(item.status ?? "not yet")}
            />
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 10,
          backgroundColor: '#fff',
          borderRadius: 12,
          marginVertical: 10,
        }}
      >
        {['Morning', 'Afternoon', 'Evening'].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat as any)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 20,
                backgroundColor: isSelected ? '#007AFF' : undefined,
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#FFFFFF' : '#333333',
                  fontFamily: isSelected ? 'bold' : ' medium',
                  fontSize: 14,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredMeds.length === 0 ? (
        <View style={{ justifyContent: 'center', alignItems: "center" }}>
          <Image source={require('@/assets/images/emptyMed.png')} style={{ width: 300, height: 300, resizeMode: 'contain' }} />
          <Text style={styles.emptyText}>No medications in {selectedCategory}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeds}
          keyExtractor={(item) => item.id}
          renderItem={renders}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setInputModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={inputModalVisible} transparent animationType='slide'>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <View style={{ width: 50, height: 10, backgroundColor: '#ddd', borderRadius: 20, marginBottom: 20 }}>

              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15, }}>
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
                <EvilIcons name="clock" size={24} color="black" />
                <Text style={styles.timePickerText}>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                  <FontAwesome6 name="bowl-rice" size={24} color={foodTiming === 'Before Food' ? '#FFF' : '#777'} />
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
                  <MaterialCommunityIcons name="bowl" size={24} color={foodTiming === 'After Food' ? '#fff' : '#777'} />
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
                  <FontAwesome6 name="capsules" size={24} color={quantityType === 'Pills' ? '#fff' : '#777'} />
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
                  <MaterialCommunityIcons name="bottle-tonic-plus" size={24} color={quantityType === 'Syrup' ? '#fff' : '#777'} />
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
              <FlatList
                horizontal
                data={
                  quantityType === 'Pills'
                    ? Array.from({ length: 20 }, (_, i) => i + 1)
                    : [...Array(6)].map((_, i) => (i + 1) * 5)
                }
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setQuantity(item)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      marginHorizontal: 6,
                      borderRadius: 20,
                      backgroundColor: quantity === item ? '#4CAF50' : '#F1F1F1',
                      elevation: quantity === item ? 3 : 0,
                      borderWidth: quantity === item ? 0 : 1,
                      borderColor: '#ccc',
                    }}
                  >
                    <Text
                      style={{
                        color: quantity === item ? '#fff' : '#333',
                        fontWeight: '600',
                        fontSize: 14,
                      }}
                    >
                      {quantityType === 'Pills' ? `${item}` : `${item} ml`}
                    </Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
              />
              <TouchableOpacity
                onPress={handleSaveMedication}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </View>
      </Modal>
              <Modal visible={modalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
              padding: 30,
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 15, fontFamily: 'bold' }}>
                Did you take {medicationName}?
              </Text>

              {!showSnoozeOptions ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, gap: 20 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const today = new Date().toISOString().split('T')[0];
                      const meds = await getMedications();
                      const matchedMed = meds.find((med) =>
                        medicationName?.toLowerCase().includes(med.name.toLowerCase())
                      );

                      if (matchedMed) {
                        await saveStatus({
                          medicationId: matchedMed.id,
                          date: today,
                          status: 'taken',
                        });
                      }

                      setModalVisible(false);
                    }}
                    style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'green', borderRadius: 10 }}
                  >
                    <Text style={{ color: 'white', fontFamily: 'bold' }}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      const today = new Date().toISOString().split('T')[0];
                      const meds = await getMedications();
                      const matchedMed = meds.find((med) =>
                        medicationName?.toLowerCase().includes(med.name.toLowerCase())
                      );

                      if (matchedMed) {
                        await saveStatus({
                          medicationId: matchedMed.id,
                          date: today,
                          status: 'not taken',
                        });
                      }

                      setModalVisible(false);
                    }}
                    style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#FF7755', borderRadius: 10 }}
                  >
                    <Text style={{ color: 'white', fontFamily: 'bold' }}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowSnoozeOptions(true)}
                    style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#7E8EFF', borderRadius: 10 }}
                  >
                    <Text style={{ color: 'white', fontFamily: 'bold' }}>Snooze</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={{ marginBottom: 10, fontFamily: 'bold' }}>Snooze for how many minutes?</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[1, 5, 10].map((min) => (
                      <TouchableOpacity
                        key={min}
                        style={{
                          backgroundColor: '#4CAF50',
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          borderRadius: 5,
                        }}
                        onPress={() => handleSnooze(min)}
                      >
                        <Text style={{ color: 'white', fontFamily: 'medium' }}>{min} min</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'medium',

  },

  cardDetails: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'medium',
  },
  emptyText: {
    fontFamily: 'bold',
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 110,
    right: 10,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    // justifyContent: 'center',
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
  modalTitle: {
    fontSize: 18,
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
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 5,
    width: '100%',
  },
  timePickerText: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'regular'
  },
  label: {
    fontSize: 16,
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
    fontFamily: 'medium'
  },
  quantityTypeTextActive: {
    color: '#fff',
    fontFamily: 'bold',
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
    fontFamily: 'bold',
  },
});
