````markdown
# 💊 HealthMedic – Intelligent Medicine Reminder App

MediPulse is a smart and stylish medicine reminder app built with **React Native** using **Expo**, **AsyncStorage**, and **Expo Notifications**. It helps users schedule medications, set reminders, snooze alerts, and track dosage timing — all while offering a smooth, animated UI experience.

## 🎯 Features

- 🕒 **Schedule Reminders**: Set personalized reminders for different medicines.
- 🔔 **Local Notifications**: Get push alerts even when the app is closed.
- 💤 **Snooze Options**: Can't take your medicine now? Snooze by 5, 10, or 15 minutes.
- 🍽️ **Food Timing Selection**: Choose between "Before Food" or "After Food".
- 💊 **Dosage Input**: Select between pills or syrup with easy sliders and quantity selectors.
- 📦 **Persistent Storage**: Medicines are stored using AsyncStorage for offline reliability.
- 🔄 **Daily Reset Logic**: Missed a dose? Notifications are reset daily to keep you on track.
- ✨ **Animated Modals & UI**: Clean, animated modals enhance user interaction.

## 🚀 Technologies Used

- **React Native + Expo**
- **Expo Notifications**
- **Expo Task Manager**
- **AsyncStorage**
- **FlatList + Modals**
- **React Hooks (useState, useEffect)**

## 📸 Screenshots & Demo

> 🎥 [See the app in action](https://www.canva.com/design/DAGnKDvg1J8/mWBQagFmAau8N8REWYnlVg/edit?utm_content=DAGnKDvg1J8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)


## 🛠️ Setup Instructions

1. Clone the repo  
   ```bash
   git clone https://github.com/Aakash-Srinivasan/Medic.git
   cd medipulse
````

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the Expo server

   ```bash
   npx expo start
   ```

4. Test notifications on a real device (Android recommended).



## 🧠 Behind the Scenes

This project leverages:

* `expo-notifications` to schedule, update, and cancel notifications.
* `expo-task-manager` to handle background tasks and notification triggers.
* `@react-native-async-storage/async-storage` to persist medicine data across sessions.
* FlatList filtering by morning, afternoon, and evening slots based on selected time.

## 🧪 Test Cases Covered

* Notification scheduling with time picker
* Snooze logic and delayed triggers
* Food timing toggles
* Daily cleanup and status reset

## 🧑‍💻 Author

**Aakash Srinivasan**
Full-Stack & Mobile Developer
[🔗 Portfolio](https://aakash-srinivasan.netlify.app/) | [🐙 GitHub](https://github.com/Aakash-Srinivasan)

## 📃 License

MIT License

---

