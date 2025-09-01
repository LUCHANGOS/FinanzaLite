import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import dayjs from 'dayjs';
import { useFinance } from '../context/FinanceContext';

export default function TransactionItem({ transaction, onPress, onLongPress }) {
  const { categories } = useFinance();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const category = categories.find(c => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';

  const backgroundColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const amountColor = isIncome ? '#4CAF50' : '#F44336';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: category?.color || '#666' }]}>
          <Text style={styles.icon}>{category?.icon || '💰'}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.categoryName, { color: textColor }]}>
            {category?.name || 'Sin categoría'}
          </Text>
          <Text style={[styles.description, { color: isDark ? '#AAA' : '#666' }]}>
            {transaction.description || 'Sin descripción'}
          </Text>
          <Text style={[styles.date, { color: isDark ? '#888' : '#999' }]}>
            {dayjs(transaction.date).format('DD/MM/YYYY HH:mm')}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
        </Text>
        <Text style={[styles.type, { color: isDark ? '#AAA' : '#666' }]}>
          {isIncome ? 'Ingreso' : 'Gasto'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
