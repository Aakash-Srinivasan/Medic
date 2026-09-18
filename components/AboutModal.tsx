import React, { useState } from 'react';
import { Image, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme, ThemePreference } from '@/context/ThemeContext';
import { aboutModalStyles as styles } from '@/styles/medicationStyles';

const AUTHOR_NAME = 'Aakash Srinivasan';
const AUTHOR_URL = 'https://aakash-srinivasan.netlify.app/';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'Auto' },
];

// Self-contained header button + "About HealTime" modal: shows the live
// app version (from app.json via expo-constants), developer attribution,
// and the light/dark/system theme switch.
export function AboutModal() {
  const [visible, setVisible] = useState(false);
  const { colors, preference, setPreference } = useTheme();
  const appName = Constants.expoConfig?.name ?? 'HealTime';
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setVisible(true)}
        testID="aboutButton"
      >
        <AntDesign name="info-circle" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
            <Text style={[styles.appName, { color: colors.text }]}>{appName}</Text>
            <Text style={[styles.version, { color: colors.textMuted }]}>Version {version}</Text>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.authorLabel, { color: colors.textFaint }]}>Built by</Text>
            <Text style={[styles.authorName, { color: colors.text }]}>{AUTHOR_NAME}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(AUTHOR_URL)}>
              <Text style={[styles.authorLink, { color: colors.accent }]}>Contact Me</Text>
            </TouchableOpacity>

            <View style={styles.themeRow}>
              <Text style={[styles.themeRowLabel, { color: colors.text }]}>Appearance</Text>
              <View style={styles.themeOptionsRow}>
                {THEME_OPTIONS.map((opt) => {
                  const isActive = preference === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.themeOption,
                        { backgroundColor: isActive ? colors.accent : colors.surfaceAlt },
                      ]}
                      onPress={() => setPreference(opt.key)}
                    >
                      <Text
                        style={[
                          styles.themeOptionText,
                          { color: isActive ? '#fff' : colors.textMuted },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
