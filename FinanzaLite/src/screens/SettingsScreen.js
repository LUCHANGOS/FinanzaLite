import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';

export default function SettingsScreen() {
  const { settings, updateSettings, exportToCSV, currentMonth } = useFinance();
  const [exporting, setExporting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const cardColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';

  const handlePinToggle = async (enabled) => {
    if (enabled) {
      // El usuario quiere habilitar el PIN, se manejará en PinLockScreen
      updateSettings({ pinEnabled: true });
    } else {
      // Deshabilitar PIN
      Alert.alert(
        'Deshabilitar PIN',
        '¿Estás seguro de que quieres deshabilitar la protección por PIN?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Deshabilitar',
            style: 'destructive',
            onPress: async () => {
              try {
                await SecureStore.deleteItemAsync('user_pin');
                updateSettings({ pinEnabled: false });
              } catch (error) {
                console.error('Error eliminando PIN:', error);
              }
            }
          },
        ]
      );
    }
  };

  const handleNotificationsToggle = async (enabled) => {
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        updateSettings({ notificationsEnabled: true });
        scheduleReminders();
      } else {
        Alert.alert(
          'Permisos requeridos',
          'Para habilitar recordatorios necesitas permitir las notificaciones en la configuración del dispositivo.'
        );
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const scheduleReminders = async () => {
    try {
      // Recordatorio mensual para revisar finanzas
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FinanzaLite 📊',
          body: '¡Es hora de revisar tus finanzas del mes!',
          sound: true,
        },
        trigger: {
          day: 1,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      // Recordatorio quincenal
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FinanzaLite 💰',
          body: 'Revisa tus gastos de la quincena',
          sound: true,
        },
        trigger: {
          day: 15,
          hour: 18,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error programando notificaciones:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const success = await exportToCSV(currentMonth);
      if (success) {
        Alert.alert('Éxito', 'Movimientos exportados correctamente');
      } else {
        Alert.alert('Error', 'No se pudieron exportar los movimientos');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error durante la exportación');
    } finally {
      setExporting(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Borrar todos los datos',
      '⚠️ Esta acción eliminará TODAS tus transacciones y categorías personalizadas. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación final',
              '¿Estás completamente seguro? Todos tus datos se perderán permanentemente.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'SÍ, BORRAR TODO',
                  style: 'destructive',
                  onPress: () => {
                    // Aquí implementarías la lógica para borrar todo
                    Alert.alert('Info', 'Función de borrado completo no implementada en la demo');
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Seguridad',
      items: [
        {
          icon: '🔒',
          title: 'Protección con PIN',
          subtitle: 'Bloquea la app con un PIN de 4 dígitos',
          type: 'switch',
          value: settings.pinEnabled,
          onPress: handlePinToggle,
        },
      ],
    },
    {
      title: 'Notificaciones',
      items: [
        {
          icon: '🔔',
          title: 'Recordatorios',
          subtitle: 'Recibe recordatorios para revisar tus finanzas',
          type: 'switch',
          value: settings.notificationsEnabled,
          onPress: handleNotificationsToggle,
        },
      ],
    },
    {
      title: 'Datos',
      items: [
        {
          icon: '📤',
          title: 'Exportar movimientos',
          subtitle: `Exportar movimientos de ${dayjs(currentMonth).format('MMMM YYYY')} a CSV`,
          type: 'button',
          onPress: handleExport,
          loading: exporting,
        },
        {
          icon: '🗑️',
          title: 'Borrar todos los datos',
          subtitle: 'Eliminar todas las transacciones y categorías',
          type: 'button',
          danger: true,
          onPress: clearAllData,
        },
      ],
    },
    {
      title: 'Acerca de',
      items: [
        {
          icon: 'ℹ️',
          title: 'FinanzaLite v1.0.0',
          subtitle: 'Tu organizador económico personal',
          type: 'info',
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.settingItem, { backgroundColor: cardColor }]}
        onPress={item.onPress}
        disabled={item.type === 'info' || item.loading}
        activeOpacity={item.type === 'info' ? 1 : 0.7}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              { color: item.danger ? '#F44336' : textColor }
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.settingSubtitle, { color: subtextColor }]}>
              {item.subtitle}
            </Text>
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#767577', true: '#2196F3' }}
              thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
            />
          )}
          {item.type === 'button' && (
            <Text style={[
              styles.buttonText,
              { color: item.danger ? '#F44336' : '#2196F3' }
            ]}>
              {item.loading ? 'Exportando...' : '→'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {settingsSections.map((section) => (
        <View key={section.title} style={[styles.section, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {section.title}
          </Text>
          {section.items.map(renderSettingItem)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
