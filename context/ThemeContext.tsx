import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'healtime:theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

const lightColors = {
  background: '#f9f9f9',
  surface: '#ffffff',
  surfaceAlt: '#f1f1f1',
  text: '#0C1824',
  textMuted: '#777777',
  textFaint: '#999999',
  border: '#dddddd',
  divider: '#eeeeee',
  accent: '#007AFF',
  badgeBlue: '#DCEDFE',
  badgeOrange: '#FDEBDD',
  overlay: 'rgba(0,0,0,0.4)',
  pending: '#D7D7D7',
  white: '#ffffff',
};

const darkColors = {
  background: '#0B0F17',
  surface: '#151A24',
  surfaceAlt: '#1D2330',
  text: '#F2F4F7',
  textMuted: '#9AA3B2',
  textFaint: '#7A8393',
  border: '#2A3040',
  divider: '#232936',
  accent: '#4EA1FF',
  badgeBlue: '#17324A',
  badgeOrange: '#3A2A1E',
  overlay: 'rgba(0,0,0,0.6)',
  pending: '#4A5160',
  white: '#ffffff',
};

export type ThemeColors = typeof lightColors;

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      })
      .catch(() => {
        // Fall back to 'system' - already the default.
      });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(THEME_STORAGE_KEY, pref).catch(() => {
      // Non-fatal: the choice just won't survive an app restart.
    });
  };

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, isDark, preference, setPreference }),
    [colors, isDark, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
