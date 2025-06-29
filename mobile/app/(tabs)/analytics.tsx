import React, { useState } from 'react';
import { StyleSheet, Dimensions, Pressable, Modal, View, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBudget } from '@/contexts/BudgetContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import ThemeToggleButton from '@/components/ThemeToggleButton';
export default function AnalyticsScreen() {
  const { transactions, categories } = useBudget();
  const scheme = useColorScheme() ?? 'light';
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });

  const totals = categories
    .filter((c) => c.type === viewType)
    .map((c) => {
      const total = filtered
        .filter((t) => t.type === viewType && t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: c.name, total };
    })
    .filter((d) => d.total > 0);

  const EXPENSE_COLORS = ['#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336'];
  const INCOME_COLORS = ['#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50'];
  const palette = viewType === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;

  const data = totals.map((d, idx) => ({
    name: d.name,
    population: d.total,
    color: palette[idx % palette.length],
    legendFontColor: Colors[scheme].text,
    legendFontSize: 15,
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemeToggleButton />
      <ThemedText type="title">Analytics</ThemedText>
      <Pressable onPress={() => setShowStart(true)} style={styles.dateButton}>
        <ThemedText>From: {startDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      <Modal transparent visible={showStart} animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => {
                setShowStart(false);
                if (d) setStartDate(d);
              }}
            />
          </ThemedView>
        </View>
      </Modal>
      <Pressable onPress={() => setShowEnd(true)} style={styles.dateButton}>
        <ThemedText>To: {endDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      <Modal transparent visible={showEnd} animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => {
                setShowEnd(false);
                if (d) setEndDate(d);
              }}
            />
          </ThemedView>
        </View>
      </Modal>
      <View style={styles.switchRow}>
        <Button title="Expenses" onPress={() => setViewType('expense')} />
        <Button title="Income" onPress={() => setViewType('income')} />
      </View>
      <PieChart
        data={data}
        width={Dimensions.get('window').width - 32}
        height={220}
        accessor="population"
        backgroundColor={Colors[scheme].background}
        chartConfig={{
          color: () => Colors[scheme].text,
          backgroundColor: Colors[scheme].background,
          backgroundGradientFrom: Colors[scheme].background,
          backgroundGradientTo: Colors[scheme].background,
        }}
        paddingLeft="16"
        absolute
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
    borderRadius: 8,
  },
});
