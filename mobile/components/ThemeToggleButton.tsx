import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <Pressable onPress={toggle} style={styles.button} accessibilityLabel="toggle theme">
      <ThemedText>{theme === 'light' ? '🌙' : '☀️'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});
