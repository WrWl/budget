import React, { useState } from 'react';
import { StyleSheet, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBudget } from '@/contexts/BudgetContext';

export default function HomeScreen() {
  const { categories, transactions, addTransaction, addCategory } = useBudget();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  const submitTransaction = () => {
    const value = parseFloat(amount);
    if (!isNaN(value) && categoryId) {
      addTransaction(type, value, categoryId, description);
      setAmount('');
      setDescription('');
    }
  };

  const submitCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryType);
      setNewCategoryName('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Budget</ThemedText>
      <ThemedText type="subtitle">Add Transaction</ThemedText>
      <Picker selectedValue={type} onValueChange={(v) => setType(v)} style={styles.picker}>
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Income" value="income" />
      </Picker>
      <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(v)} style={styles.picker}>
        {categories
          .filter((c) => c.type === type)
          .map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
      </Picker>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button title="Add" onPress={submitTransaction} />

      <ThemedText type="subtitle" style={styles.section}>Add Category</ThemedText>
      <Picker selectedValue={newCategoryType} onValueChange={(v) => setNewCategoryType(v)} style={styles.picker}>
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Income" value="income" />
      </Picker>
      <TextInput
        placeholder="Category name"
        value={newCategoryName}
        onChangeText={setNewCategoryName}
        style={styles.input}
      />
      <Button title="Add Category" onPress={submitCategory} />

      <ThemedText type="subtitle" style={styles.section}>Transactions</ThemedText>
      {transactions.map((t) => (
        <ThemedText key={t.id}>
          {t.type === 'expense' ? '-' : '+'}{t.amount} ({categories.find(c => c.id === t.categoryId)?.name})
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  picker: {
    backgroundColor: '#f0f0f0',
  },
  section: {
    marginTop: 16,
  },
});

