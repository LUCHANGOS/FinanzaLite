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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createUser, users } = useAuth();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const validateForm = () => {
    const { name, username, email, password, confirmPassword } = formData;
    
    if (!name.trim()) {
      return { isValid: false, error: 'El nombre es requerido' };
    }
    
    if (!username.trim()) {
      return { isValid: false, error: 'El usuario es requerido' };
    }
    
    if (username.length < 3) {
      return { isValid: false, error: 'El usuario debe tener al menos 3 caracteres' };
    }
    
    if (!email.trim()) {
      return { isValid: false, error: 'El email es requerido' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' };
    }
    
    if (!password) {
      return { isValid: false, error: 'La contraseña es requerida' };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Las contraseñas no coinciden' };
    }
    
    // Verificar que el usuario no exista
    const existingUser = users.find(u => 
      u.username === username.trim() || u.email === email.trim()
    );
    
    if (existingUser) {
      return { isValid: false, error: 'El usuario o email ya existe' };
    }
    
    return { isValid: true };
  };

  const handleRegister = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error de validación', validation.error);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createUser(formData);
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '¡Cuenta creada!', 
          'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Ocurrió un error durante el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '#E0E0E0' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    let text = 'Muy débil';
    let color = Colors.error;
    
    if (strength >= 75) {
      text = 'Fuerte';
      color = Colors.success;
    } else if (strength >= 50) {
      text = 'Media';
      color = Colors.warning;
    } else if (strength >= 25) {
      text = 'Débil';
      color = Colors.warning;
    }
    
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <LinearGradient
      colors={Colors.gradients.secondary}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header */}
          <Animatable.View 
            animation="bounceIn" 
            delay={200}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Icon name="add" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a FinanzaLite</Text>
          </Animatable.View>

          {/* Formulario */}
          <Animatable.View 
            animation="slideInUp" 
            delay={400}
            style={styles.formContainer}
          >
            <Card style={styles.registerCard} shadowLevel="xl">
              
              {/* Nombre completo */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Nombre completo
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Tu nombre completo"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.name}
                    onChangeText={(value) => updateField('name', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Usuario */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Nombre de usuario
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="usuario123"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.username}
                    onChangeText={(value) => updateField('username', value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Correo electrónico
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="tu@email.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Contraseña
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Text>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Indicador de fortaleza */}
                {formData.password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View style={[
                        styles.strengthFill,
                        { 
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color
                        }
                      ]} />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirmar contraseña */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Confirmar contraseña
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Crear Cuenta"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
                size="lg"
              />

              {/* Enlace a login */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                  ¿Ya tienes cuenta?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.loginLink, { color: Colors.secondary }]}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animatable.View>
        </ScrollView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    flex: 1,
  },
  registerCard: {
    padding: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
