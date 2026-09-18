import * as Haptics from 'expo-haptics';
import { ComponentProps } from 'react';
import { Pressable } from 'react-native';

// @react-navigation/elements' PlatformPressable can no longer be imported
// directly (blocked at bundle time as of Expo SDK 56+), so this is a trimmed
// local replacement: a plain Pressable with the same haptic-on-press-in
// behavior the tab bar relies on. Typing against Pressable's own props
// (rather than @react-navigation/bottom-tabs' BottomTabBarButtonProps) keeps
// this compatible with expo-router's internal tab bar button type, which no
// longer matches the public react-navigation one exactly.
export function HapticTab(props: Omit<ComponentProps<typeof Pressable>, 'ref'>) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
