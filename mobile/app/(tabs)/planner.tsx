import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBudget } from '@/contexts/BudgetContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { Collapsible } from '@/components/Collapsible';

interface Row {
  id: string;
  name: string;
  amount: string;
}


function sumRows(rows: Row[]) {
  return rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
}

export default function PlannerScreen() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [netIncome, setNetIncome] = useState('');
  const [prevOver, setPrevOver] = useState('');
  const [debts, setDebts] = useState<Row[]>([]);
  const [savings, setSavings] = useState<Row[]>([]);

  const [regDebts, setRegDebts] = useState<Row[]>([]);
  const [regSavings, setRegSavings] = useState<Row[]>([]);
  const [regOther, setRegOther] = useState<Row[]>([]);

  const [predicted, setPredicted] = useState<Row[]>([]);
  const [cash, setCash] = useState<Row[]>([]);

  const { transactions } = useBudget();
  const theme = useColorScheme() ?? 'light';
  const headerBg = theme === 'dark' ? '#333' : '#eee';

  const loadData = async () => {
    const key = `planner-${year}-${month}`;
    const json = await AsyncStorage.getItem(key);
    if (json) {
      const data = JSON.parse(json);
      setPrevOver(data.prevOver || '');
      setDebts(data.debts || []);
      setSavings(data.savings || []);
      setRegDebts(data.regDebts || []);
      setRegSavings(data.regSavings || []);
      setRegOther(data.regOther || []);
      setPredicted(data.predicted || []);
      setCash(data.cash || []);
    } else {
      const prevDate = new Date(year, month - 1, 1);
      const prevKey = `planner-${prevDate.getFullYear()}-${prevDate.getMonth()}`;
      const prevJson = await AsyncStorage.getItem(prevKey);
      if (prevJson) {
        const p = JSON.parse(prevJson);
        setDebts(p.debts?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setSavings(p.savings?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setRegDebts(p.regDebts?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setRegSavings(p.regSavings?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setRegOther(p.regOther?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setPredicted(p.predicted?.map((d: Row) => ({ ...d, amount: '' })) || []);
        setCash(p.cash?.map((d: Row) => ({ ...d, amount: '' })) || []);
      } else {
        setDebts([]);
        setSavings([]);
        setRegDebts([]);
        setRegSavings([]);
        setRegOther([]);
        setPredicted([]);
        setCash([]);
      }
      setPrevOver('');
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  useEffect(() => {
    const key = `planner-${year}-${month}`;
    const data = {
      prevOver,
      debts,
      savings,
      regDebts,
      regSavings,
      regOther,
      predicted,
      cash,
    };
    AsyncStorage.setItem(key, JSON.stringify(data));
  }, [prevOver, debts, savings, regDebts, regSavings, regOther, predicted, cash, month, year]);

  useEffect(() => {
    const income = transactions.reduce((s, t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        return s + (t.type === 'income' ? t.amount : -t.amount);
      }
      return s;
    }, 0);
    setNetIncome(income.toFixed(2));
  }, [transactions, month, year]);

  const debtTotal = sumRows(debts);
  const savingTotal = sumRows(savings);
  const liquidTotal =
    (parseFloat(netIncome) || 0) - debtTotal - savingTotal - (parseFloat(prevOver) || 0);

  const regTotal = sumRows(regDebts) + sumRows(regSavings) + sumRows(regOther);
  const billsTotal = liquidTotal - regTotal;

  const predictedTotal = sumRows(predicted) + sumRows(cash);
  const remaining = billsTotal - predictedTotal;

  const weeklyData = predicted.map(p => {
    const weeks = [0, 0, 0, 0];
    transactions.forEach(t => {
      if (
        t.type === 'expense' &&
        t.categoryId === p.id
      ) {
        const d = new Date(t.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const idx = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          weeks[idx] += t.amount;
        }
      }
    });
    return { id: p.id, name: p.name, weeks };
  });

  const weekTotals = [0, 1, 2, 3].map(i =>
    weeklyData.reduce((s, w) => s + w.weeks[i], 0)
  );

  const progress = predicted.map(p => {
    const spentRow = weeklyData.find(w => w.id === p.id);
    const spent = spentRow ? spentRow.weeks.reduce((s, v) => s + v, 0) : 0;
    const planned = parseFloat(p.amount) || 0;
    const diff = planned - spent;
    const percent = planned ? ((spent / planned) - 1) * 100 : 0;
    return { id: p.id, name: p.name, planned, spent, diff, percent };
  });

  const addRow = (setFn: React.Dispatch<React.SetStateAction<Row[]>>) => {
    setFn(prev => [...prev, { id: Date.now().toString(), name: '', amount: '' }]);
  };
  const updateRow = (
    setFn: React.Dispatch<React.SetStateAction<Row[]>>,
    id: string,
    field: 'name' | 'amount',
    value: string
  ) => {
    setFn(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const deleteRow = (setFn: React.Dispatch<React.SetStateAction<Row[]>>, id: string) => {
    setFn(prev => prev.filter(r => r.id !== id));
  };


  return (
    <ThemedView style={styles.container}>
      <ThemeToggleButton />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <ThemedText type="title">Plan</ThemedText>
        <View style={styles.dateRow}>
          <Picker
            selectedValue={month}
            onValueChange={setMonth}
            style={styles.picker}
          >
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, idx) => (
              <Picker.Item key={idx} label={m} value={idx} />
            ))}
          </Picker>
          <Picker
            selectedValue={year}
            onValueChange={setYear}
            style={styles.picker}
          >
            {[2023,2024,2025,2026].map(y => (
              <Picker.Item key={y} label={String(y)} value={y} />
            ))}
          </Picker>
        </View>

        {/* Section 1 */}
        <Collapsible title="Початкове положення">
          <ThemedText>Чистий дохід</ThemedText>
          <ThemedText style={styles.input}>{netIncome}</ThemedText>
          <ThemedText>Перевитрати минулого місяця</ThemedText>
          <ThemedTextInput
            keyboardType="numeric"
            value={prevOver}
            onChangeText={setPrevOver}
            style={styles.input}
          />

          <ThemedText type="subtitle" style={styles.section}>Борги</ThemedText>
          {debts.map(d => (
            <View key={d.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={d.name}
                onChangeText={v => updateRow(setDebts, d.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={d.amount}
                onChangeText={v => updateRow(setDebts, d.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setDebts, d.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setDebts)} />
          <ThemedText>Total: {debtTotal.toFixed(2)}</ThemedText>

          <ThemedText type="subtitle" style={styles.section}>Збереження</ThemedText>
          {savings.map(s => (
            <View key={s.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={s.name}
                onChangeText={v => updateRow(setSavings, s.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={s.amount}
                onChangeText={v => updateRow(setSavings, s.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setSavings, s.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setSavings)} />
          <ThemedText>Total: {savingTotal.toFixed(2)}</ThemedText>

          <ThemedText style={styles.highlight}>Ліквідний total: {liquidTotal.toFixed(2)}</ThemedText>
        </Collapsible>

        {/* Section 2 */}
        <Collapsible title="Постійні платежі">
          <ThemedText type="subtitle" style={styles.section}>Борг</ThemedText>
          {regDebts.map(d => (
            <View key={d.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={d.name}
                onChangeText={v => updateRow(setRegDebts, d.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={d.amount}
                onChangeText={v => updateRow(setRegDebts, d.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setRegDebts, d.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setRegDebts)} />

          <ThemedText type="subtitle" style={styles.section}>Заощадження</ThemedText>
          {regSavings.map(s => (
            <View key={s.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={s.name}
                onChangeText={v => updateRow(setRegSavings, s.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={s.amount}
                onChangeText={v => updateRow(setRegSavings, s.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setRegSavings, s.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setRegSavings)} />

          <ThemedText type="subtitle" style={styles.section}>Інші</ThemedText>
          {regOther.map(o => (
            <View key={o.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={o.name}
                onChangeText={v => updateRow(setRegOther, o.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={o.amount}
                onChangeText={v => updateRow(setRegOther, o.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setRegOther, o.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setRegOther)} />

          <ThemedText style={styles.highlight}>Bills Total: {billsTotal.toFixed(2)}</ThemedText>
        </Collapsible>

        {/* Section 3 */}
        <Collapsible title="Прогнозовані витрати">
          {predicted.map(p => (
            <View key={p.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Категорія"
                value={p.name}
                onChangeText={v => updateRow(setPredicted, p.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={p.amount}
                onChangeText={v => updateRow(setPredicted, p.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setPredicted, p.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setPredicted)} />

          <ThemedText type="subtitle" style={styles.section}>Вивід готівки</ThemedText>
          {cash.map(c => (
            <View key={c.id} style={styles.row}>
              <ThemedTextInput
                placeholder="Назва"
                value={c.name}
                onChangeText={v => updateRow(setCash, c.id, 'name', v)}
                style={[styles.input, styles.flex]}
              />
              <ThemedTextInput
                placeholder="Сума"
                keyboardType="numeric"
                value={c.amount}
                onChangeText={v => updateRow(setCash, c.id, 'amount', v)}
                style={[styles.input, styles.amount]}
              />
              <Pressable onPress={() => deleteRow(setCash, c.id)}>
                <ThemedText style={styles.delete}>✕</ThemedText>
              </Pressable>
            </View>
          ))}
          <Button title="Add" onPress={() => addRow(setCash)} />

          <ThemedText style={styles.highlight}>Залишок до розподілу: {remaining.toFixed(2)}</ThemedText>
        </Collapsible>

        {/* Section 4 */}
        <Collapsible title="Тижневий звіт">
          <ScrollView horizontal>
            <View>
              <View style={[styles.row, styles.tableHeader, { backgroundColor: headerBg }]}>
                <ThemedText style={[styles.cellName, styles.headerCell]}>Категорія</ThemedText>
                {[1, 2, 3, 4].map(n => (
                  <ThemedText key={n} style={[styles.cell, styles.headerCell]}>W{n}</ThemedText>
                ))}
              </View>
              {weeklyData.map(r => (
                <View key={r.id} style={styles.row}>
                  <ThemedText style={styles.cellName}>{r.name}</ThemedText>
                  {r.weeks.map((w, i) => (
                    <ThemedText key={i} style={styles.cell}>{w.toFixed(2)}</ThemedText>
                  ))}
                </View>
              ))}
              <View style={[styles.row, styles.tableHeader, { backgroundColor: headerBg }]}>
                <ThemedText style={styles.cellName}>Total</ThemedText>
                {weekTotals.map((t, idx) => (
                  <ThemedText key={idx} style={styles.cell}>{t.toFixed(2)}</ThemedText>
                ))}
              </View>
            </View>
          </ScrollView>
        </Collapsible>

        {/* Section 5 */}
        <Collapsible title="Прогрес">
          {progress.map(p => (
            <View key={p.id} style={styles.progressRow}>
              <ThemedText style={styles.progressName}>{p.name}</ThemedText>
              <ThemedText>{p.spent.toFixed(2)}</ThemedText>
              <ThemedText style={{ color: p.diff < 0 ? 'green' : p.diff > 0 ? 'red' : undefined }}>
                {p.diff.toFixed(2)}
              </ThemedText>
              <ThemedText style={{ color: p.percent < 0 ? 'green' : p.percent > 0 ? 'red' : undefined }}>
                {p.percent.toFixed(0)}%
              </ThemedText>
            </View>
          ))}
        </Collapsible>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  section: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  flex: {
    flex: 1,
  },
  amount: {
    width: 80,
  },
  delete: {
    color: 'red',
    paddingHorizontal: 4,
  },
  highlight: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  tableHeader: {
    paddingVertical: 4,
  },
  cell: {
    width: 60,
    textAlign: 'center',
  },
  cellName: {
    width: 100,
  },
  headerCell: {
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
  },
  progressName: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  picker: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
