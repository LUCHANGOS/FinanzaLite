import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useSavings } from '../context/SavingsContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import dayjs from 'dayjs';

const goalIcons = [
  '🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🎸', '📱', '💻', 
  '🏖️', '🎁', '👗', '⌚', '🎮', '🏃‍♀️', '🍎', '🎨', '📚', '🌟'
];

const goalCategories = [
  { name: 'Casa/Hogar', color: Colors.gradients.secondary, icon: '🏠' },
  { name: 'Viajes', color: Colors.gradients.warning, icon: '✈️' },
  { name: 'Vehículo', color: Colors.gradients.error, icon: '🚗' },
  { name: 'Educación', color: Colors.gradients.primary, icon: '🎓' },
  { name: 'Emergencia', color: Colors.gradients.success, icon: '🚨' },
  { name: 'Entretenimiento', color: Colors.gradients.warning, icon: '🎮' },
  { name: 'Tecnología', color: Colors.gradients.secondary, icon: '💻' },
  { name: 'Salud', color: Colors.gradients.success, icon: '🏥' },
  { name: 'Otro', color: Colors.gradients.primary, icon: '🎯' },
];

export default function AddSavingsGoalScreen({ navigation }) {
  const { addSavingsGoal } = useSavings();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
    category: goalCategories[0],
    icon: '🎯',
    description: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef();
  const amountInputRef = useRef();
  const descriptionInputRef = useRef();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'El monto debe ser mayor a 0';
    }

    if (formData.targetDate <= new Date()) {
      newErrors.targetDate = 'La fecha debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addSavingsGoal({
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        category: formData.category.name,
        icon: formData.icon,
        description: formData.description.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '¡Meta creada!',
        `Tu meta "${formData.name}" ha sido creada exitosamente.`,
        [{ text: 'Continuar', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo crear la meta. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelection = () => {
    Alert.prompt(
      'Fecha objetivo',
      'Ingresa la fecha en formato DD/MM/YYYY',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Establecer',
          onPress: (dateText) => {
            const [day, month, year] = dateText.split('/');
            const newDate = new Date(year, month - 1, day);
            if (!isNaN(newDate.getTime()) && newDate > new Date()) {
              setFormData({ ...formData, targetDate: newDate });
            } else {
              Alert.alert('Error', 'Fecha inválida o debe ser futura');
            }
          }
        }
      ],
      'plain-text',
      dayjs(formData.targetDate).format('DD/MM/YYYY')
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (text) => {
    // Remover caracteres no numéricos excepto punto decimal
    const numericText = text.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, targetAmount: numericText });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Meta</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Información básica */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <Card style={styles.formCard}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              Información Básica
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Nombre de la meta *
              </Text>
              <TextInput
                ref={nameInputRef}
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.name ? Colors.error : theme.colors.border,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="Ej: Vacaciones en Europa"
                placeholderTextColor={theme.colors.textTertiary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                returnKeyType="next"
                onSubmitEditing={() => amountInputRef.current?.focus()}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Monto objetivo *
              </Text>
              <View style={styles.amountContainer}>
                <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
                <TextInput
                  ref={amountInputRef}
                  style={[
                    styles.amountInput,
                    { 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: errors.targetAmount ? Colors.error : theme.colors.border,
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formatCurrency(formData.targetAmount)}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionInputRef.current?.focus()}
                />
              </View>
              {errors.targetAmount && (
                <Text style={styles.errorText}>{errors.targetAmount}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Fecha objetivo *
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.targetDate ? Colors.error : theme.colors.border,
                  }
                ]}
                onPress={handleDateSelection}
              >
                <Icon name="calendar" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {dayjs(formData.targetDate).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              {errors.targetDate && (
                <Text style={styles.errorText}>{errors.targetDate}</Text>
              )}
            </View>
          </Card>
        </Animatable.View>

        {/* Categoría */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={styles.formCard}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              Categoría
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {goalCategories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    formData.category.name === category.name && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, category });
                    Haptics.selectionAsync();
                  }}
                >
                  <LinearGradient
                    colors={formData.category.name === category.name ? category.color : ['#F5F5F5', '#E0E0E0']}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </LinearGradient>
                  <Text style={[
                    styles.categoryName,
                    { 
                      color: formData.category.name === category.name 
                        ? Colors.primary 
                        : theme.colors.textSecondary 
                    }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        </Animatable.View>

        {/* Icono */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Card style={styles.formCard}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              Icono
            </Text>
            
            <View style={styles.iconsGrid}>
              {goalIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconItem,
                    formData.icon === icon && styles.iconItemSelected,
                    { backgroundColor: theme.colors.inputBackground }
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, icon });
                    setSelectedIconIndex(index);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animatable.View>

        {/* Descripción opcional */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Card style={styles.formCard}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              Descripción (Opcional)
            </Text>
            
            <TextInput
              ref={descriptionInputRef}
              style={[
                styles.textAreaInput,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="Describe tu meta de ahorro..."
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>
        </Animatable.View>

        {/* Preview */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Card style={styles.previewCard}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
              Vista Previa
            </Text>
            
            <View style={styles.previewGoal}>
              <View style={styles.previewHeader}>
                <View style={styles.previewLeft}>
                  <Text style={styles.previewIcon}>{formData.icon}</Text>
                  <View>
                    <Text style={[styles.previewName, { color: theme.colors.text }]}>
                      {formData.name || 'Nombre de la meta'}
                    </Text>
                    <Text style={[styles.previewCategory, { color: theme.colors.textSecondary }]}>
                      {formData.category.name} • {dayjs(formData.targetDate).format('DD/MM/YYYY')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.previewAmount, { color: Colors.primary }]}>
                  ${formatCurrency(formData.targetAmount) || '0'}
                </Text>
              </View>

              <View style={styles.previewProgress}>
                <View style={[styles.previewProgressBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.previewProgressFill, { width: '0%' }]} />
                </View>
                <Text style={[styles.previewProgressText, { color: theme.colors.textSecondary }]}>
                  $0 de ${formatCurrency(formData.targetAmount) || '0'}
                </Text>
              </View>
            </View>
          </Card>
        </Animatable.View>

        {/* Botones */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.buttonsContainer}>
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
          <Button
            title={isSubmitting ? "Creando..." : "Crear Meta"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
            icon={<Icon name="add" size={20} color="#FFFFFF" />}
          />
        </Animatable.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  formCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  categoriesScroll: {
    marginHorizontal: -8,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  iconEmoji: {
    fontSize: 24,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 80,
  },
  previewCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewGoal: {
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.primary + '05',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewCategory: {
    fontSize: 12,
  },
  previewAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewProgress: {
    marginTop: 8,
  },
  previewProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  previewProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  previewProgressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
