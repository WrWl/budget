import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
};

interface BudgetState {
  categories: Category[];
  transactions: Transaction[];
}

interface BudgetContextValue extends BudgetState {
  addCategory: (name: string, type: 'income' | 'expense') => void;
  addTransaction: (
    type: 'income' | 'expense',
    amount: number,
    categoryId: string,
    description?: string,
    date?: Date,
  ) => void;
  deleteTransaction: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

const STORAGE_KEY = 'budget-data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'home', name: 'Дім', type: 'expense' },
  { id: 'groceries', name: 'Продукти', type: 'expense' },
  { id: 'clothing', name: 'Одяг', type: 'expense' },
  { id: 'salary', name: 'Зарплата', type: 'income' },
];

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted) return;
        if (json) {
          const data = JSON.parse(json) as BudgetState;
          setCategories(data.categories);
          setTransactions(data.transactions);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (e) {
        console.error('Failed to load budget data', e);
        setCategories(DEFAULT_CATEGORIES);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data: BudgetState = { categories, transactions };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save budget data', e);
      }
    })();
  }, [categories, transactions]);

  const addCategory = (name: string, type: 'income' | 'expense') => {
    setCategories((prev) => [
      ...prev,
      { id: Date.now().toString(), name, type },
    ]);
  };

  const addTransaction = (
    type: 'income' | 'expense',
    amount: number,
    categoryId: string,
    description?: string,
    date: Date = new Date()
  ) => {
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        amount,
        categoryId,
        description,
        date: date.toISOString(),
      },
    ]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <BudgetContext.Provider
      value={{ categories, transactions, addCategory, addTransaction, deleteTransaction }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be inside BudgetProvider');
  return ctx;
}
