import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Configurar dayjs en español
dayjs.locale('es');

import { FinanceProvider, useFinance } from './src/context/FinanceContext';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddEditTransactionScreen from './src/screens/AddEditTransactionScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PinLockScreen from './src/screens/PinLockScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarOptions = {
    tabBarStyle: {
      backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
      borderTopColor: isDark ? '#444' : '#E0E0E0',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarActiveTintColor: '#2196F3',
    tabBarInactiveTintColor: isDark ? '#888' : '#666',
    headerStyle: {
      backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
    },
    headerTintColor: isDark ? '#FFFFFF' : '#000000',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Movimientos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categorías',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏷️</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { settings } = useFinance();
  const [isUnlocked, setIsUnlocked] = useState(!settings.pinEnabled);
  const [showOnboarding, setShowOnboarding] = useState(settings.firstTimeUser);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setIsUnlocked(!settings.pinEnabled);
  }, [settings.pinEnabled]);

  useEffect(() => {
    setShowOnboarding(settings.firstTimeUser);
  }, [settings.firstTimeUser]);

  const screenOptions = {
    headerStyle: {
      backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
    },
    headerTintColor: isDark ? '#FFFFFF' : '#000000',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    contentStyle: {
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
    },
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  if (!isUnlocked) {
    return <PinLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditTransaction"
        component={AddEditTransactionScreen}
        options={{
          title: 'Nueva Transacción',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <FinanceProvider>
      <NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppContent />
      </NavigationContainer>
    </FinanceProvider>
  );
}
