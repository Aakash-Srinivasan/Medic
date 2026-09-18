import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

// @react-navigation/bottom-tabs' useBottomTabBarHeight can no longer be
// imported directly (blocked at bundle time as of Expo SDK 56+). The
// standard iOS tab bar is 49pt tall, so use that constant instead.
const TAB_BAR_HEIGHT = 49;

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return TAB_BAR_HEIGHT;
}
