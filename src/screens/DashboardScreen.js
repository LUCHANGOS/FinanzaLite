import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useFinance } from '../context/FinanceContext';
import BarChart from '../components/BarChart';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const {
    currentMonth,
    setCurrentMonth,
    getMonthlyBalance,
    getCategoryTotals,
    getFortnightTransactions,
  } = useFinance();
  
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'fortnight'
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const cardColor = isDark ? '#2C2C2C' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#CCCCCC' : '#666666';

  const balance = getMonthlyBalance();
  const categoryTotals = getCategoryTotals();

  const getFortnightBalance = (fortnight) => {
    const transactions = getFortnightTransactions(currentMonth, fortnight);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  };

  const getChartData = () => {
    if (viewMode === 'month') {
      return [
        { label: 'Ingresos', value: balance.income, type: 'income' },
        { label: 'Gastos', value: balance.expenses, type: 'expense' },
      ];
    } else {
      const firstFortnight = getFortnightBalance(1);
      const secondFortnight = getFortnightBalance(2);
      return [
        { label: '1ra Quincena', value: firstFortnight.balance, type: firstFortnight.balance >= 0 ? 'income' : 'expense' },
        { label: '2da Quincena', value: Math.abs(secondFortnight.balance), type: secondFortnight.balance >= 0 ? 'income' : 'expense' },
      ];
    }
  };

  const changeMonth = (direction) => {
    const current = dayjs(currentMonth);
    const newMonth = direction === 'prev' 
      ? current.subtract(1, 'month') 
      : current.add(1, 'month');
    setCurrentMonth(newMonth.format('YYYY-MM'));
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header con selector de mes */}
      <View style={[styles.header, { backgroundColor: cardColor }]}>
        <TouchableOpacity onPress={() => changeMonth('prev')}>
          <Text style={[styles.navButton, { color: '#2196F3' }]}>◀</Text>
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: textColor }]}>
          {dayjs(currentMonth).format('MMMM YYYY')}
        </Text>
        
        <TouchableOpacity onPress={() => changeMonth('next')}>
          <Text style={[styles.navButton, { color: '#2196F3' }]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjetas de resumen */}
      <View style={styles.summaryCards}>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: subtextColor }]}>Ingresos</Text>
          <Text style={[styles.cardAmount, { color: '#4CAF50' }]}>
            {formatCurrency(balance.income)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: subtextColor }]}>Gastos</Text>
          <Text style={[styles.cardAmount, { color: '#F44336' }]}>
            {formatCurrency(balance.expenses)}
          </Text>
        </View>

        <View style={[styles.card, styles.fullWidthCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: subtextColor }]}>Balance</Text>
          <Text style={[
            styles.cardAmount, 
            { color: balance.balance >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatCurrency(balance.balance)}
          </Text>
        </View>
      </View>

      {/* Selector de vista */}
      <View style={[styles.viewSelector, { backgroundColor: cardColor }]}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            viewMode === 'month' && styles.activeViewButton
          ]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[
            styles.viewButtonText,
            { color: viewMode === 'month' ? '#FFFFFF' : textColor }
          ]}>
            Mensual
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewButton,
            viewMode === 'fortnight' && styles.activeViewButton
          ]}
          onPress={() => setViewMode('fortnight')}
        >
          <Text style={[
            styles.viewButtonText,
            { color: viewMode === 'fortnight' ? '#FFFFFF' : textColor }
          ]}>
            Quincenal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico */}
      <View style={[styles.chartContainer, { backgroundColor: cardColor }]}>
        <Text style={[styles.chartTitle, { color: textColor }]}>
          {viewMode === 'month' ? 'Resumen Mensual' : 'Comparación Quincenal'}
        </Text>
        <BarChart 
          data={getChartData()} 
          width={width - 40} 
          height={200} 
        />
      </View>

      {/* Categorías principales */}
      <View style={[styles.categoriesContainer, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Principales Categorías
        </Text>
        {categoryTotals
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={[styles.categoryName, { color: textColor }]}>
                  {category.name}
                </Text>
              </View>
              <Text style={[
                styles.categoryAmount,
                { color: category.type === 'income' ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(category.total)}
              </Text>
            </View>
          ))
        }
        
        {categoryTotals.length === 0 && (
          <Text style={[styles.noDataText, { color: subtextColor }]}>
            No hay transacciones este mes
          </Text>
        )}
      </View>

      {/* Botón de acción rápida */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTransaction')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  card: {
    width: (width - 30) / 2 - 10,
    padding: 20,
    margin: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fullWidthCard: {
    width: width - 30,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewSelector: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeViewButton: {
    backgroundColor: '#2196F3',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    margin: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  categoriesContainer: {
    margin: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 80,
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
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
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
