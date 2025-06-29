import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBudget } from './BudgetContext';

export type AccountBalances = {
  privat: string;
  mono: string;
  cash: string;
  currency: string;
};

export type PlanCategory = {
  id: string;
  percent: number;
  predicted: number;
};

export type PlanState = {
  accounts: AccountBalances;
  debt: string;
  overspend: string;
  categories: PlanCategory[];
};

interface PlanningContextValue extends PlanState {
  setAccount: (name: keyof AccountBalances, value: string) => void;
  setDebt: (value: string) => void;
  setOverspend: (value: string) => void;
  setPercent: (id: string, percent: number) => void;
  setPredicted: (id: string, value: number) => void;
  autofill: () => void;
}

const PlanningContext = createContext<PlanningContextValue | undefined>(undefined);

const STORAGE_KEY = 'planning-data';

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const { categories: budgetCategories, transactions } = useBudget();
  const expenseCategories = budgetCategories.filter((c) => c.type === 'expense');

  const [state, setState] = useState<PlanState>({
    accounts: { privat: '', mono: '', cash: '', currency: '' },
    debt: '',
    overspend: '',
    categories: expenseCategories.map((c) => ({ id: c.id, percent: 0, predicted: 0 })),
  });

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        try {
          const data = JSON.parse(json) as PlanState;
          setState({
            ...data,
            categories: expenseCategories.map((c) =>
              data.categories.find((d) => d.id === c.id) || { id: c.id, percent: 0, predicted: 0 },
            ),
          });
        } catch (e) {
          console.error('Failed to load planning data', e);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save planning data', e);
      }
    })();
  }, [state]);

  // Update categories when budget categories change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      categories: expenseCategories.map((c) =>
        prev.categories.find((d) => d.id === c.id) || { id: c.id, percent: 0, predicted: 0 },
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetCategories.length]);

  const setAccount = (name: keyof AccountBalances, value: string) => {
    setState((prev) => ({ ...prev, accounts: { ...prev.accounts, [name]: value } }));
  };

  const setDebt = (value: string) => setState((prev) => ({ ...prev, debt: value }));
  const setOverspend = (value: string) => setState((prev) => ({ ...prev, overspend: value }));

  const setPercent = (id: string, percent: number) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, percent } : c)),
    }));
  };

  const setPredicted = (id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, predicted: value } : c)),
    }));
  };

  const autofill = () => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;
    const debt = parseFloat(state.debt) || 0;
    const overs = parseFloat(state.overspend) || 0;
    const available = net - debt - overs;
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => ({
        ...c,
        predicted: parseFloat(((available * c.percent) / 100).toFixed(2)),
      })),
    }));
  };

  return (
    <PlanningContext.Provider
      value={{
        ...state,
        setAccount,
        setDebt,
        setOverspend,
        setPercent,
        setPredicted,
        autofill,
      }}
    >
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanning must be inside PlanningProvider');
  return ctx;
}
