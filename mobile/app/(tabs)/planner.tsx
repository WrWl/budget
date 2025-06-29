import { StyleSheet } from 'react-native';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PlannerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemeToggleButton />
      <ThemedText type="title">Plan</ThemedText>
      <ThemedText>Create budgets for day, month or custom periods.</ThemedText>
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
