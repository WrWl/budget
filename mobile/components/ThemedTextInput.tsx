import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, ...rest }: ThemedTextInputProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = theme === 'dark' ? darkColor ?? '#333' : lightColor ?? '#fff';
  const color = Colors[theme].text;
  const borderColor = theme === 'dark' ? '#555' : '#ccc';

  return (
    <TextInput
      style={[{ backgroundColor, color, borderColor, borderWidth: 1, padding: 8, borderRadius: 4 }, style]}
      placeholderTextColor={theme === 'dark' ? '#aaa' : '#999'}
      {...rest}
    />
  );
}
