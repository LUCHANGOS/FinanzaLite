import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export default function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const keypadColor = isDark ? '#2C2C2C' : '#F5F5F5';

  useEffect(() => {
    initializePinScreen();
  }, []);

  const initializePinScreen = async () => {
    try {
      await checkExistingPin();
      await checkBiometrics();
      setIsLoading(false);
    } catch (error) {
      console.error('Error inicializando PIN screen:', error);
      setIsSettingPin(true);
      setIsLoading(false);
    }
  };

  const checkExistingPin = async () => {
    try {
      const savedPin = await SecureStore.getItemAsync('user_pin');
      if (savedPin) {
        setStoredPin(savedPin);
        setIsSettingPin(false);
      } else {
        setIsSettingPin(true);
      }
    } catch (error) {
      console.error('Error verificando PIN:', error);
      // En caso de error, asumir que no hay PIN y permitir configurar uno nuevo
      setIsSettingPin(true);
    }
  };

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Desbloquear FinanzaLite',
          fallbackLabel: 'Usar PIN',
          disableDeviceFallback: true,
        });
        
        if (result.success) {
          onUnlock();
        }
      }
    } catch (error) {
      console.error('Error con autenticación biométrica:', error);
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'delete') {
      if (isSettingPin) {
        if (confirmPin.length > 0) {
          setConfirmPin(confirmPin.slice(0, -1));
        } else {
          setPin(pin.slice(0, -1));
        }
      } else {
        setPin(pin.slice(0, -1));
      }
      return;
    }

    if (isSettingPin) {
      if (pin.length < 4) {
        setPin(pin + key);
      } else if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + key;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 4) {
          if (pin === newConfirmPin) {
            savePin(pin);
          } else {
            Alert.alert('Error', 'Los PINs no coinciden. Inténtalo de nuevo.');
            setPin('');
            setConfirmPin('');
          }
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);
        
        if (newPin.length === 4) {
          if (newPin === storedPin) {
            onUnlock();
          } else {
            Alert.alert('Error', 'PIN incorrecto');
            setPin('');
          }
        }
      }
    }
  };

  const savePin = async (pinToSave) => {
    try {
      await SecureStore.setItemAsync('user_pin', pinToSave);
      setStoredPin(pinToSave);
      setIsSettingPin(false);
      onUnlock();
    } catch (error) {
      console.error('Error guardando PIN:', error);
      Alert.alert('Error', 'No se pudo guardar el PIN');
    }
  };

  const renderPinDots = () => {
    const currentPin = isSettingPin ? (confirmPin.length > 0 ? confirmPin : pin) : pin;
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < currentPin.length ? '#2196F3' : 'transparent',
                borderColor: isDark ? '#555' : '#DDD',
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => (
              <TouchableOpacity
                key={keyIndex}
                style={[
                  styles.keypadButton,
                  { backgroundColor: key ? keypadColor : 'transparent' }
                ]}
                onPress={() => key && handleKeyPress(key)}
                disabled={!key}
              >
                <Text style={[styles.keypadText, { color: textColor }]}>
                  {key === 'delete' ? '⌫' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          {isSettingPin 
            ? (pin.length === 4 ? 'Confirma tu PIN' : 'Crea un PIN de 4 dígitos')
            : 'Ingresa tu PIN'
          }
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#666' }]}>
          {isSettingPin 
            ? 'Este PIN protegerá tus datos financieros'
            : 'Desbloquea para acceder a tus finanzas'
          }
        </Text>
      </View>

      {renderPinDots()}
      {renderKeypad()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 10,
  },
  keypad: {
    width: '80%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  keypadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '500',
  },
});
