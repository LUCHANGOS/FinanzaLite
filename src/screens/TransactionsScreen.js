import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from '../components/TransactionItem';
import dayjs from 'dayjs';

export default function TransactionsScreen({ navigation }) {
  const {
    currentMonth,
    getMonthlyTransactions,
    getFortnightTransactions,
    deleteTransaction,
  } = useFinance();
  
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense', 'fortnight1', 'fortnight2'
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const cardColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  const getFilteredTransactions = () => {
    let transactions = [];
    
    switch (filter) {
      case 'income':
        transactions = getMonthlyTransactions().filter(t => t.type === 'income');
        break;
      case 'expense':
        transactions = getMonthlyTransactions().filter(t => t.type === 'expense');
        break;
      case 'fortnight1':
        transactions = getFortnightTransactions(currentMonth, 1);
        break;
      case 'fortnight2':
        transactions = getFortnightTransactions(currentMonth, 2);
        break;
      default:
        transactions = getMonthlyTransactions();
    }
    
    return transactions.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  };

  const handleEditTransaction = (transaction) => {
    navigation.navigate('AddEditTransaction', { transaction });
  };

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id)
        },
      ]
    );
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'income': return 'Ingresos';
      case 'expense': return 'Gastos';
      case 'fortnight1': return '1ra Quincena';
      case 'fortnight2': return '2da Quincena';
      default: return 'Todas';
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header con filtros */}
      <View style={[styles.header, { backgroundColor: cardColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Movimientos - {dayjs(currentMonth).format('MMM YYYY')}
        </Text>
        
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: textColor }]}>
            Filtrar: {getFilterLabel()}
          </Text>
        </View>
      </View>

      {/* Botones de filtro */}
      <View style={[styles.filterButtons, { backgroundColor: cardColor }]}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'income', label: 'Ingresos' },
          { key: 'expense', label: 'Gastos' },
          { key: 'fortnight1', label: '1ra Q.' },
          { key: 'fortnight2', label: '2da Q.' },
        ].map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterButton,
              filter === filterOption.key && styles.activeFilterButton
            ]}
            onPress={() => setFilter(filterOption.key)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: filter === filterOption.key ? '#FFFFFF' : textColor }
            ]}>
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de transacciones */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => handleEditTransaction(item)}
            onLongPress={() => handleDeleteTransaction(item)}
          />
        )}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No hay transacciones para mostrar
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#AAA' : '#666' }]}>
              Toca el botón + para agregar una nueva transacción
            </Text>
          </View>
        }
        contentContainerStyle={filteredTransactions.length === 0 && styles.emptyList}
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
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
});
