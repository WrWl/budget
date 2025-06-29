import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { PlanningProvider } from '@/contexts/PlanningContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();

  return (
    <BudgetProvider>
      <PlanningProvider>
        <NavigationThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </PlanningProvider>
    </BudgetProvider>
  );
}
