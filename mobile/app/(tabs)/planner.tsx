import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, Button } from 'react-native';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { ThemedText } from '@/components/ThemedText';
import { useBudget } from '@/contexts/BudgetContext';
import { usePlanning } from '@/contexts/PlanningContext';

export default function PlannerScreen() {
  const { transactions, categories } = useBudget();
  const {
    accounts,
    debt,
    overspend,
    categories: planCats,
    setAccount,
    setDebt,
    setOverspend,
    setPercent,
    setPredicted,
    autofill,
  } = usePlanning();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const data = expenseCategories.map((c) => {
    const plan = planCats.find((p) => p.id === c.id) || { percent: 0, predicted: 0 };
    const current = transactions
      .filter((t) => t.categoryId === c.id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const week = plan.predicted / 4;
    const progress = plan.predicted > 0 ? current / plan.predicted : 0;
    return { ...c, ...plan, current, week, progress };
  });

  const totalBudget = data.reduce((s, d) => s + d.predicted, 0);
  const totalSpent = data.reduce((s, d) => s + d.current, 0);
  const remaining = totalBudget - totalSpent;

  const balance =
    (parseFloat(accounts.privat) || 0) +
    (parseFloat(accounts.mono) || 0) +
    (parseFloat(accounts.cash) || 0) +
    (parseFloat(accounts.currency) || 0);

  const predictedEnd = balance - (parseFloat(debt) || 0) - totalSpent + totalBudget;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
      <ThemeToggleButton />
      <ThemedText type="title">Планування</ThemedText>

      <ThemedText type="subtitle">Початкове положення</ThemedText>
      <View style={styles.row}>
        <ThemedText>Приват</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={accounts.privat}
          onChangeText={(v) => setAccount('privat', v)}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Моно</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={accounts.mono}
          onChangeText={(v) => setAccount('mono', v)}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Готівка</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={accounts.cash}
          onChangeText={(v) => setAccount('cash', v)}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Валюта</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={accounts.currency}
          onChangeText={(v) => setAccount('currency', v)}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Борг</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={debt}
          onChangeText={setDebt}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Перевитрати минулого місяця</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={overspend}
          onChangeText={setOverspend}
        />
      </View>
      <Button title="Автозаповнення" onPress={autofill} />

      <ThemedText type="subtitle" style={{ marginTop: 16 }}>
        Категорії
      </ThemedText>
      {data.map((d) => (
        <View key={d.id} style={styles.tableRow}>
          <ThemedText style={{ flex: 1 }}>{d.name}</ThemedText>
          <TextInput
            style={[styles.input, { width: 70 }]}
            keyboardType="numeric"
            value={String(d.predicted)}
            onChangeText={(v) => setPredicted(d.id, parseFloat(v) || 0)}
          />
          <TextInput
            style={[styles.input, { width: 60 }]}
            keyboardType="numeric"
            value={String(d.percent)}
            onChangeText={(v) => setPercent(d.id, parseFloat(v) || 0)}
          />
          <ThemedText style={{ width: 70 }}>{d.current}</ThemedText>
          <ThemedText style={{ width: 60 }}>{d.week.toFixed(0)}</ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${Math.min(d.progress * 100, 100)}%`,
                  backgroundColor:
                    d.progress > 1 ? 'red' : d.progress > 0.9 ? 'yellow' : 'green',
                },
              ]}
            />
          </View>
        </View>
      ))}

      <ThemedText type="subtitle" style={{ marginTop: 16 }}>
        Підсумки
      </ThemedText>
      <ThemedText>Загальний бюджет: {totalBudget.toFixed(2)}</ThemedText>
      <ThemedText>Витрачено: {totalSpent.toFixed(2)}</ThemedText>
      <ThemedText>Залишок: {remaining.toFixed(2)}</ThemedText>
      <ThemedText>
        Прогнозований залишок на кінець місяця: {predictedEnd.toFixed(2)}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    borderRadius: 4,
    minWidth: 80,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: { height: '100%' },
});
