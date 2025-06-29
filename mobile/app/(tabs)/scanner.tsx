import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScannerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Receipt Scanner</ThemedText>
      <ThemedText>Use your camera to scan receipts and auto-add expenses.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
