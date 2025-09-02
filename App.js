import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Animatable from 'react-native-animatable';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Configurar dayjs en español
dayjs.locale('es');

// Importar sistema de temas
import { getTheme, Colors } from './src/constants/Theme';
import Icon from './src/components/Icon';

import { FinanceProvider, useFinance } from './src/context/FinanceContext';
import { SavingsProvider } from './src/context/SavingsContext';
import { AuthProvider } from './src/context/AuthContext.simple';
import { DocumentsProvider } from './src/context/DocumentsContext.simple';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddEditTransactionScreen from './src/screens/AddEditTransactionScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PinLockScreen from './src/screens/PinLockScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SavingsScreen from './src/screens/SavingsScreen';
import AddSavingsGoalScreen from './src/screens/AddSavingsGoalScreen';
import AddSavingsScreen from './src/screens/AddSavingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

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
  const theme = getTheme(colorScheme === 'dark');

  const tabBarOptions = {
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      height: 70,
      paddingBottom: 12,
      paddingTop: 8,
      borderTopWidth: 0,
      ...theme.shadows.lg,
    },
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: theme.colors.textTertiary,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    headerStyle: {
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
  };

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color, focused }) => (
            <Animatable.View animation={focused ? 'bounceIn' : undefined} duration={300}>
              <Icon name="dashboard" size={24} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Movimientos',
          tabBarIcon: ({ color, focused }) => (
            <Animatable.View animation={focused ? 'bounceIn' : undefined} duration={300}>
              <Icon name="transactions" size={24} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsScreen}
        options={{
          title: 'Ahorros',
          tabBarIcon: ({ color, focused }) => (
            <Animatable.View animation={focused ? 'bounceIn' : undefined} duration={300}>
              <Icon name="chart" size={24} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categorías',
          tabBarIcon: ({ color, focused }) => (
            <Animatable.View animation={focused ? 'bounceIn' : undefined} duration={300}>
              <Icon name="categories" size={24} color={color} />
            </Animatable.View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <Animatable.View animation={focused ? 'bounceIn' : undefined} duration={300}>
              <Icon name="settings" size={24} color={color} />
            </Animatable.View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { settings } = useFinance();
  const [isUnlocked, setIsUnlocked] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Inicializar estados una vez que tenemos settings cargados
  useEffect(() => {
    if (settings && typeof settings.pinEnabled === 'boolean' && typeof settings.firstTimeUser === 'boolean') {
      setIsUnlocked(!settings.pinEnabled);
      setShowOnboarding(settings.firstTimeUser);
      setIsLoading(false);
    }
  }, [settings]);

  // Manejar cambios en pinEnabled después de la inicialización
  useEffect(() => {
    if (!isLoading && settings && typeof settings.pinEnabled === 'boolean') {
      setIsUnlocked(!settings.pinEnabled);
    }
  }, [settings.pinEnabled, isLoading]);

  // Manejar cambios en firstTimeUser después de la inicialización
  useEffect(() => {
    if (!isLoading && settings && typeof settings.firstTimeUser === 'boolean') {
      setShowOnboarding(settings.firstTimeUser);
    }
  }, [settings.firstTimeUser, isLoading]);

  // Mostrar loading mientras cargamos la configuración
  if (isLoading || isUnlocked === null || showOnboarding === null) {
    const theme = getTheme(isDark);
    
    return (
      <LinearGradient
        colors={Colors.gradients.primary}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={1000}
          style={{ alignItems: 'center' }}
        >
          <Animatable.Text 
            animation="pulse" 
            iterationCount="infinite" 
            style={{ 
              color: '#FFFFFF', 
              fontSize: 20, 
              fontWeight: 'bold',
              marginBottom: 16
            }}
          >
            FinanzaLite
          </Animatable.Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }}>by L.A.N.G.</Text>
        </Animatable.View>
      </LinearGradient>
    );
  }

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
      <Stack.Screen
        name="AddSavingsGoal"
        component={AddSavingsGoalScreen}
        options={{
          title: 'Nueva Meta',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AddSavings"
        component={AddSavingsScreen}
        options={{
          title: 'Agregar Ahorro',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Registrarse',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <FinanceProvider>
        <SavingsProvider>
          <DocumentsProvider>
            <NavigationContainer>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <AppContent />
            </NavigationContainer>
          </DocumentsProvider>
        </SavingsProvider>
      </FinanceProvider>
    </AuthProvider>
  );
}
