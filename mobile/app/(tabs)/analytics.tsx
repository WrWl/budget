import React, { useState } from 'react';
import { StyleSheet, Dimensions, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBudget } from '@/contexts/BudgetContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function AnalyticsScreen() {
  const { transactions } = useBudget();
  const scheme = useColorScheme() ?? 'light';
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });
  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const data = [
    {
      name: 'Income',
      population: income,
      color: '#4CAF50',
      legendFontColor: Colors[scheme].text,
      legendFontSize: 15,
    },
    {
      name: 'Expense',
      population: expense,
      color: '#F44336',
      legendFontColor: Colors[scheme].text,
      legendFontSize: 15,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Analytics</ThemedText>
      <Pressable onPress={() => setShowStart(true)} style={styles.dateButton}>
        <ThemedText>From: {startDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowStart(false);
            if (d) setStartDate(d);
          }}
        />
      )}
      <Pressable onPress={() => setShowEnd(true)} style={styles.dateButton}>
        <ThemedText>To: {endDate.toLocaleDateString()}</ThemedText>
      </Pressable>
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowEnd(false);
            if (d) setEndDate(d);
          }}
        />
      )}
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
});
