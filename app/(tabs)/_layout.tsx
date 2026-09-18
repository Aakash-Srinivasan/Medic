import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { AboutModal } from '@/components/AboutModal';
import { HistoryModal } from '@/components/HistoryModal';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarStyle: { display: "none" },
          headerShown: true,
          headerTitle: '💊✨ HealTime',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: 'bold',
            fontSize: RFValue(18),
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HistoryModal />
              <AboutModal />
            </View>
          ),
        }}

      />
    </Tabs>
  );
}
