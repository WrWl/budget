import React, { useState } from 'react';
import { StyleSheet, Dimensions, Pressable, Modal, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBudget } from '@/contexts/BudgetContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
export default function AnalyticsScreen() {
  const { transactions, categories } = useBudget();
  const scheme = useColorScheme() ?? 'light';
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });

  const expenseTotals = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const total = filtered
        .filter((t) => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: c.name, total };
    })
    .filter((d) => d.total > 0);

  const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#2196F3', '#009688', '#FF9800', '#795548'];

  const data = expenseTotals.map((d, idx) => ({
    name: d.name,
    population: d.total,
    color: COLORS[idx % COLORS.length],
    legendFontColor: Colors[scheme].text,
    legendFontSize: 15,
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Analytics</ThemedText>
      <Pressable onPress={() => setShowStart(true)} style={styles.dateButton}>
        <ThemedText>From: {startDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      <Modal transparent visible={showStart} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="calendar"
              onChange={(e, d) => {
                setShowStart(false);
                if (d) setStartDate(d);
              }}
            />
          </View>
        </View>
      </Modal>
      <Pressable onPress={() => setShowEnd(true)} style={styles.dateButton}>
        <ThemedText>To: {endDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      <Modal transparent visible={showEnd} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={endDate}
              mode="date"
              display="calendar"
              onChange={(e, d) => {
                setShowEnd(false);
                if (d) setEndDate(d);
              }}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
});
