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
  Modal,
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

export default function AddSavingsScreen({ navigation }) {
  const { 
    savingsGoals, 
    addSavingsEntry, 
    getActiveGoals, 
    getGoalProgress,
    setMonthlyTarget,
    monthlyTarget 
  } = useSavings();
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const [amount, setAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [description, setDescription] = useState('');
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newMonthlyTarget, setNewMonthlyTarget] = useState(monthlyTarget.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const amountInputRef = useRef();
  const descriptionInputRef = useRef();

  const activeGoals = getActiveGoals();

  const validateForm = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!selectedGoal && activeGoals.length > 0) {
      newErrors.goal = 'Selecciona una meta o crea una nueva';
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
      await addSavingsEntry({
        amount: parseFloat(amount),
        goalId: selectedGoal?.id,
        description: description.trim(),
        date: new Date(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '¡Ahorro registrado!',
        `Se han agregado $${formatCurrency(amount)} a tu ${selectedGoal ? `meta "${selectedGoal.name}"` : 'ahorro general'}.`,
        [{ text: 'Continuar', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo registrar el ahorro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetMonthlyTarget = async () => {
    const targetValue = parseFloat(newMonthlyTarget);
    if (isNaN(targetValue) || targetValue < 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      await setMonthlyTarget(targetValue);
      setShowTargetModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('¡Listo!', `Tu meta mensual se estableció en $${formatCurrency(newMonthlyTarget)}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo establecer la meta mensual');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setAmount(numericText);
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setShowGoalSelector(false);
    Haptics.selectionAsync();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.success}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar Ahorro</Text>
          <TouchableOpacity
            onPress={() => setShowTargetModal(true)}
            style={styles.targetButton}
          >
            <Icon name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Monto */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <Card style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
              ¿Cuánto quieres ahorrar?
            </Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
              <TextInput
                ref={amountInputRef}
                style={[
                  styles.amountInput,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.amount ? Colors.error : 'transparent',
                    color: theme.colors.text,
                  }
                ]}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                value={formatCurrency(amount)}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => descriptionInputRef.current?.focus()}
              />
            </View>
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </Card>
        </Animatable.View>

        {/* Selección de meta */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                Asignar a una meta
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddSavingsGoal')}
                style={styles.newGoalButton}
              >
                <Icon name="add" size={16} color={Colors.primary} />
                <Text style={[styles.newGoalText, { color: Colors.primary }]}>
                  Nueva Meta
                </Text>
              </TouchableOpacity>
            </View>

            {selectedGoal ? (
              <TouchableOpacity
                style={styles.selectedGoal}
                onPress={() => setShowGoalSelector(true)}
              >
                <View style={styles.selectedGoalContent}>
                  <Text style={styles.selectedGoalIcon}>{selectedGoal.icon}</Text>
                  <View style={styles.selectedGoalInfo}>
                    <Text style={[styles.selectedGoalName, { color: theme.colors.text }]}>
                      {selectedGoal.name}
                    </Text>
                    <Text style={[styles.selectedGoalProgress, { color: theme.colors.textSecondary }]}>
                      ${selectedGoal.currentAmount.toLocaleString()} de ${selectedGoal.targetAmount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.selectedGoalRight}>
                    <Text style={[styles.selectedGoalPercentage, { color: Colors.primary }]}>
                      {getGoalProgress(selectedGoal.id).toFixed(1)}%
                    </Text>
                    <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.selectGoalButton,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.goal ? Colors.error : theme.colors.border,
                  }
                ]}
                onPress={() => setShowGoalSelector(true)}
              >
                <Icon name="categories" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.selectGoalText, { color: theme.colors.textSecondary }]}>
                  {activeGoals.length > 0 ? 'Seleccionar meta' : 'Sin metas activas'}
                </Text>
                <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}

            {errors.goal && (
              <Text style={styles.errorText}>{errors.goal}</Text>
            )}

            {/* Opción de ahorro libre */}
            <TouchableOpacity
              style={styles.freeOption}
              onPress={() => {
                setSelectedGoal(null);
                Haptics.selectionAsync();
              }}
            >
              <View style={styles.freeOptionContent}>
                <Icon 
                  name={selectedGoal ? "radio-unchecked" : "radio-checked"} 
                  size={20} 
                  color={selectedGoal ? theme.colors.textTertiary : Colors.primary} 
                />
                <Text style={[
                  styles.freeOptionText, 
                  { color: selectedGoal ? theme.colors.textSecondary : theme.colors.text }
                ]}>
                  Ahorro libre (sin meta específica)
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        </Animatable.View>

        {/* Descripción */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Card style={styles.descriptionCard}>
            <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
              Descripción (Opcional)
            </Text>
            <TextInput
              ref={descriptionInputRef}
              style={[
                styles.descriptionInput,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="Ej: Ahorro semanal, dinero extra del trabajo..."
              placeholderTextColor={theme.colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </Card>
        </Animatable.View>

        {/* Botones */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.buttonsContainer}>
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
          <Button
            title={isSubmitting ? "Guardando..." : "Agregar Ahorro"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
            icon={<Icon name="add" size={20} color="#FFFFFF" />}
          />
        </Animatable.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Goal Selector Modal */}
      <Modal
        visible={showGoalSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <View style={[styles.modalHeader, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Seleccionar Meta
              </Text>
              <TouchableOpacity onPress={() => setShowGoalSelector(false)}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {activeGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalOption, { backgroundColor: theme.colors.background }]}
                  onPress={() => handleGoalSelect(goal)}
                >
                  <View style={styles.goalOptionContent}>
                    <Text style={styles.goalOptionIcon}>{goal.icon}</Text>
                    <View style={styles.goalOptionInfo}>
                      <Text style={[styles.goalOptionName, { color: theme.colors.text }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.goalOptionProgress, { color: theme.colors.textSecondary }]}>
                        ${goal.currentAmount.toLocaleString()} de ${goal.targetAmount.toLocaleString()}
                      </Text>
                      <Text style={[styles.goalOptionCategory, { color: theme.colors.textTertiary }]}>
                        {goal.category} • {dayjs(goal.targetDate).format('DD/MM/YYYY')}
                      </Text>
                    </View>
                    <View style={styles.goalOptionRight}>
                      <Text style={[styles.goalOptionPercentage, { color: Colors.primary }]}>
                        {getGoalProgress(goal.id).toFixed(1)}%
                      </Text>
                      <View style={[styles.goalOptionProgressBar, { backgroundColor: theme.colors.border }]}>
                        <View style={[
                          styles.goalOptionProgressFill, 
                          { 
                            width: `${getGoalProgress(goal.id)}%`,
                            backgroundColor: Colors.primary 
                          }
                        ]} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {activeGoals.length === 0 && (
                <View style={styles.noGoalsContainer}>
                  <Text style={styles.noGoalsEmoji}>🎯</Text>
                  <Text style={[styles.noGoalsText, { color: theme.colors.textSecondary }]}>
                    No tienes metas activas
                  </Text>
                  <Button
                    title="Crear primera meta"
                    onPress={() => {
                      setShowGoalSelector(false);
                      navigation.navigate('AddSavingsGoal');
                    }}
                    style={styles.createGoalButton}
                  />
                </View>
              )}
            </ScrollView>
          </Animatable.View>
        </View>
      </Modal>

      {/* Monthly Target Modal */}
      <Modal
        visible={showTargetModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTargetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" style={styles.targetModalContent}>
            <Text style={[styles.targetModalTitle, { color: theme.colors.text }]}>
              Meta Mensual de Ahorro
            </Text>
            <Text style={[styles.targetModalSubtitle, { color: theme.colors.textSecondary }]}>
              Establece cuánto quieres ahorrar cada mes
            </Text>

            <View style={styles.targetInputContainer}>
              <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
              <TextInput
                style={[
                  styles.targetInput,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                value={formatCurrency(newMonthlyTarget)}
                onChangeText={(text) => setNewMonthlyTarget(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.targetModalButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowTargetModal(false)}
                style={styles.targetCancelButton}
              />
              <Button
                title="Establecer"
                onPress={handleSetMonthlyTarget}
                style={styles.targetSubmitButton}
              />
            </View>
          </Animatable.View>
        </View>
      </Modal>
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
  targetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  amountCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  goalCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
  },
  newGoalText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedGoal: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.primary + '05',
  },
  selectedGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedGoalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedGoalInfo: {
    flex: 1,
  },
  selectedGoalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedGoalProgress: {
    fontSize: 12,
  },
  selectedGoalRight: {
    alignItems: 'flex-end',
  },
  selectedGoalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  selectGoalText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  freeOption: {
    marginTop: 12,
    padding: 12,
  },
  freeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeOptionText: {
    fontSize: 14,
    marginLeft: 12,
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    height: 60,
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
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 400,
  },
  goalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  goalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  goalOptionInfo: {
    flex: 1,
  },
  goalOptionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalOptionProgress: {
    fontSize: 12,
    marginBottom: 2,
  },
  goalOptionCategory: {
    fontSize: 11,
  },
  goalOptionRight: {
    alignItems: 'flex-end',
  },
  goalOptionPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalOptionProgressBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  goalOptionProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  noGoalsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noGoalsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noGoalsText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  createGoalButton: {
    paddingHorizontal: 24,
  },
  targetModalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  targetModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  targetModalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  targetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  targetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
  },
  targetModalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  targetCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  targetSubmitButton: {
    flex: 1,
    marginLeft: 8,
  },
});
