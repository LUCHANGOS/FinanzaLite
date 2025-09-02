import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser, loginWithBiometric, biometricAvailable, users } = useAuth();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await loginUser(username.trim(), password);
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // La navegación se manejará automáticamente por el AuthContext
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error de login', result.error);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Ocurrió un error durante el login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await loginWithBiometric();
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error biométrico', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error en autenticación biométrica');
    }
  };

  const hasBiometricUsers = users.some(user => user.preferences?.biometricLogin);

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header con logo */}
        <Animatable.View 
          animation="bounceIn" 
          delay={200}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Icon name="chart" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>FinanzaLite</Text>
          <Text style={styles.appSubtitle}>by L.A.N.G.</Text>
        </Animatable.View>

        {/* Formulario de login */}
        <Animatable.View 
          animation="slideInUp" 
          delay={400}
          style={styles.formContainer}
        >
          <Card style={styles.loginCard} shadowLevel="xl">
            <Text style={[styles.loginTitle, { color: theme.colors.text }]}>
              Iniciar Sesión
            </Text>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="income" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Usuario o email"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="settings" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Contraseña"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              size="lg"
            />

            {/* Autenticación biométrica */}
            {biometricAvailable && hasBiometricUsers && (
              <View style={styles.biometricContainer}>
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                    O
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                </View>

                <Button
                  title="Usar Biometría"
                  onPress={handleBiometricLogin}
                  variant="ghost"
                  icon={<Text style={{ fontSize: 20, marginRight: 8 }}>🔐</Text>}
                />
              </View>
            )}

            {/* Enlace a registro */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                ¿No tienes cuenta?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: Colors.primary }]}>
                  Crear cuenta
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animatable.View>

        {/* Footer */}
        <Animatable.View 
          animation="fadeIn" 
          delay={800}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Gestiona tus finanzas de forma segura
          </Text>
        </Animatable.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
  },
  loginCard: {
    padding: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    marginBottom: 20,
  },
  biometricContainer: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});
