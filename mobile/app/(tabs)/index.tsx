import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, Pressable, Modal, View, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import ThemeToggleButton from '@/components/ThemeToggleButton';

import { useBudget } from '@/contexts/BudgetContext';

export default function HomeScreen() {
  const {
    categories,
    transactions,
    addTransaction,
    addCategory,
    deleteTransaction,
    deleteCategory,
  } = useBudget();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    const first = categories.find((c) => c.type === type);
    setCategoryId(first ? first.id : '');
  }, [type, categories]);

  const submitTransaction = () => {
    const value = parseFloat(amount);
    if (!isNaN(value) && categoryId) {
      addTransaction(type, value, categoryId, description, date);
      setAmount('');
      setDescription('');
      setDate(new Date());
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
      <ThemeToggleButton />
      <ThemedText type="title">Budget</ThemedText>
      <View style={styles.addButtons}>
        <Button
          title="Add Expense"
          onPress={() => {
            setType('expense');
            setShowTransactionModal(true);
          }}
        />
        <Button
          title="Add Income"
          onPress={() => {
            setType('income');
            setShowTransactionModal(true);
          }}
        />
      </View>

      <Modal transparent visible={showTransactionModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ScrollView>
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
              <Pressable onPress={() => setShowCategoryModal(true)} style={styles.manageButton}>
                <ThemedText>Edit Categories</ThemedText>
              </Pressable>
              <ThemedTextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
              />
              <ThemedTextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
              />
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <ThemedText>{date.toLocaleDateString()}</ThemedText>
              </Pressable>
              <Modal transparent visible={showDatePicker} animationType="slide">
                <View style={styles.modalOverlay}>
                  <ThemedView style={styles.modalContent}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(e, d) => {
                        setShowDatePicker(false);
                        if (d) setDate(d);
                      }}
                    />
                  </ThemedView>
                </View>
              </Modal>
              <Button title="Save" onPress={() => { submitTransaction(); setShowTransactionModal(false); }} />
              <Button title="Cancel" onPress={() => setShowTransactionModal(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showCategoryModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle">Manage Categories</ThemedText>
            {categories
              .filter((c) => c.type === type)
              .map((c) => (
                <View key={c.id} style={styles.categoryRow}>
                  <ThemedText>{c.name}</ThemedText>
                  <Pressable onPress={() => deleteCategory(c.id)}>
                    <ThemedText style={styles.deleteText}>Delete</ThemedText>
                  </Pressable>
                </View>
              ))}
            <Picker
              selectedValue={newCategoryType}
              onValueChange={(v) => setNewCategoryType(v)}
              style={styles.picker}
            >
              <Picker.Item label="Expense" value="expense" />
              <Picker.Item label="Income" value="income" />
            </Picker>
            <ThemedTextInput
              placeholder="Category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.input}
            />
            <Button title="Add Category" onPress={submitCategory} />
            <Button title="Close" onPress={() => setShowCategoryModal(false)} />
          </ThemedView>
        </View>
      </Modal>

      <ThemedText type="subtitle" style={styles.section}>Transactions</ThemedText>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        {transactions.map((t) => (
          <ThemedView key={t.id} style={styles.transactionRow}>
            <ThemedText>
              {t.type === 'expense' ? '-' : '+'}
              {t.amount} ({categories.find((c) => c.id === t.categoryId)?.name}) -{' '}
              {new Date(t.date).toLocaleDateString()}
            </ThemedText>
            <ThemedText>{t.description}</ThemedText>
            <Pressable onPress={() => deleteTransaction(t.id)}>
              <ThemedText style={styles.deleteText}>Delete</ThemedText>
            </Pressable>
          </ThemedView>
        ))}
      </ScrollView>
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
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  deleteText: {
    color: 'red',
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  manageButton: {
    padding: 8,
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scroll: {
    flex: 1,
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

