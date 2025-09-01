import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';
import dayjs from 'dayjs';

export default function AddEditTransactionScreen({ navigation, route }) {
  const { addTransaction, updateTransaction, categories } = useFinance();
  const existingTransaction = route.params?.transaction;
  const isEditing = !!existingTransaction;
  
  const [type, setType] = useState(existingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(existingTransaction?.description || '');
  const [categoryId, setCategoryId] = useState(existingTransaction?.categoryId || '');
  const [date, setDate] = useState(existingTransaction?.date || dayjs().toISOString());

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const cardColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const inputColor = isDark ? '#3C3C3C' : '#F8F8F8';
  const borderColor = isDark ? '#555' : '#DDD';

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Transacción' : 'Nueva Transacción',
    });
  }, [navigation, isEditing]);

  const availableCategories = categories.filter(c => c.type === type);

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      categoryId,
      date,
    };

    if (isEditing) {
      updateTransaction({ ...existingTransaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }

    navigation.goBack();
  };

  const formatAmount = (text) => {
    // Remover caracteres no numéricos excepto punto y coma
    const cleaned = text.replace(/[^0-9.,]/g, '');
    // Reemplazar coma por punto para decimales
    const normalized = cleaned.replace(',', '.');
    setAmount(normalized);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.form, { backgroundColor: cardColor }]}>
        {/* Selector de tipo */}
        <Text style={[styles.label, { color: textColor }]}>Tipo de transacción</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.activeTypeButton,
              { borderColor }
            ]}
            onPress={() => {
              setType('income');
              setCategoryId(''); // Reset category when changing type
            }}
          >
            <Text style={[
              styles.typeButtonText,
              { color: type === 'income' ? '#FFFFFF' : textColor }
            ]}>
              💼 Ingreso
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.activeTypeButton,
              { borderColor }
            ]}
            onPress={() => {
              setType('expense');
              setCategoryId(''); // Reset category when changing type
            }}
          >
            <Text style={[
              styles.typeButtonText,
              { color: type === 'expense' ? '#FFFFFF' : textColor }
            ]}>
              💸 Gasto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monto */}
        <Text style={[styles.label, { color: textColor }]}>Monto</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputColor, color: textColor, borderColor }]}
          value={amount}
          onChangeText={formatAmount}
          placeholder="0"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          keyboardType="numeric"
        />

        {/* Descripción */}
        <Text style={[styles.label, { color: textColor }]}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputColor, color: textColor, borderColor }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: Compra supermercado"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          multiline
        />

        {/* Selector de categoría */}
        <Text style={[styles.label, { color: textColor }]}>Categoría</Text>
        <View style={styles.categoryGrid}>
          {availableCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                categoryId === category.id && styles.activeCategoryButton,
                { backgroundColor: categoryId === category.id ? category.color : inputColor }
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                { color: categoryId === category.id ? '#FFFFFF' : textColor }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {availableCategories.length === 0 && (
          <View style={styles.noCategoriesContainer}>
            <Text style={[styles.noCategoriesText, { color: textColor }]}>
              No hay categorías de {type === 'income' ? 'ingresos' : 'gastos'}
            </Text>
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.addCategoryText}>Crear categoría</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fecha */}
        <Text style={[styles.label, { color: textColor }]}>Fecha</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: inputColor, borderColor }]}
          onPress={() => {
            // En una implementación completa, aquí abriríamos un date picker
            Alert.alert('Información', 'Para esta demo, se usa la fecha actual');
          }}
        >
          <Text style={[styles.dateText, { color: textColor }]}>
            {dayjs(date).format('DD/MM/YYYY HH:mm')}
          </Text>
        </TouchableOpacity>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: textColor }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    margin: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 48,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  activeCategoryButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noCategoriesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCategoriesText: {
    fontSize: 16,
    marginBottom: 10,
  },
  addCategoryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addCategoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
