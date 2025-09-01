import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  useColorScheme,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';

const availableIcons = ['💼', '🎁', '🏠', '🍕', '🚗', '🎮', '📄', '💊', '👕', '⚡', '📱', '🎬', '☕', '🏥', '✈️', '🛒'];
const availableColors = ['#4CAF50', '#8BC34A', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#607D8B', '#795548', '#FF5722', '#009688', '#CDDC39', '#FFC107', '#E91E63', '#3F51B5', '#00BCD4', '#FFEB3B'];

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    icon: '💰',
    color: '#2196F3',
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const cardColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const inputColor = isDark ? '#3C3C3C' : '#F8F8F8';
  const borderColor = isDark ? '#555' : '#DDD';

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategory({
      name: '',
      type: 'expense',
      icon: '💰',
      color: '#2196F3',
    });
    setModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category);
    setModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (!newCategory.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    if (editingCategory) {
      updateCategory({ ...editingCategory, ...newCategory });
    } else {
      addCategory(newCategory);
    }

    setModalVisible(false);
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Estás seguro de que quieres eliminar "${category.name}"? También se eliminarán todas las transacciones asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteCategory(category.id)
        },
      ]
    );
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: cardColor }]}
      onPress={() => handleEditCategory(item)}
      onLongPress={() => handleDeleteCategory(item)}
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryIconContainer, { backgroundColor: item.color }]}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
        </View>
        <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
      </View>
      <Text style={[styles.categoryType, { color: isDark ? '#AAA' : '#666' }]}>
        {item.type === 'income' ? 'Ingreso' : 'Gasto'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Sección de ingresos */}
      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          💼 Categorías de Ingresos ({incomeCategories.length})
        </Text>
        <FlatList
          data={incomeCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: isDark ? '#AAA' : '#666' }]}>
              No hay categorías de ingresos
            </Text>
          }
        />
      </View>

      {/* Sección de gastos */}
      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          💸 Categorías de Gastos ({expenseCategories.length})
        </Text>
        <FlatList
          data={expenseCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: isDark ? '#AAA' : '#666' }]}>
              No hay categorías de gastos
            </Text>
          }
        />
      </View>

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddCategory}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal para agregar/editar categoría */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>

            {/* Nombre */}
            <Text style={[styles.label, { color: textColor }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputColor, color: textColor, borderColor }]}
              value={newCategory.name}
              onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
              placeholder="Ej: Supermercado"
              placeholderTextColor={isDark ? '#888' : '#AAA'}
            />

            {/* Tipo */}
            <Text style={[styles.label, { color: textColor }]}>Tipo</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCategory.type === 'income' && styles.activeTypeButton,
                  { borderColor }
                ]}
                onPress={() => setNewCategory({ ...newCategory, type: 'income' })}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: newCategory.type === 'income' ? '#FFFFFF' : textColor }
                ]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCategory.type === 'expense' && styles.activeTypeButton,
                  { borderColor }
                ]}
                onPress={() => setNewCategory({ ...newCategory, type: 'expense' })}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: newCategory.type === 'expense' ? '#FFFFFF' : textColor }
                ]}>
                  Gasto
                </Text>
              </TouchableOpacity>
            </View>

            {/* Iconos */}
            <Text style={[styles.label, { color: textColor }]}>Icono</Text>
            <View style={styles.iconGrid}>
              {availableIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconButton,
                    newCategory.icon === icon && styles.activeIconButton,
                    { backgroundColor: newCategory.icon === icon ? newCategory.color : inputColor }
                  ]}
                  onPress={() => setNewCategory({ ...newCategory, icon })}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Colores */}
            <Text style={[styles.label, { color: textColor }]}>Color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    newCategory.color === color && styles.activeColorButton
                  ]}
                  onPress={() => setNewCategory({ ...newCategory, color })}
                />
              ))}
            </View>

            {/* Botones del modal */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: textColor }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveCategory}
              >
                <Text style={styles.modalSaveText}>
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 2,
    borderRadius: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryType: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
    margin: 4,
    borderRadius: 15,
  },
  activeColorButton: {
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
