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
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useFinance } from '../context/FinanceContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
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
  const theme = getTheme(colorScheme === 'dark');
  const isDark = colorScheme === 'dark';

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

  const changeMonth = async (direction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => changeMonth('prev')}
            style={styles.navButton}
          >
            <Icon name="income" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          
          <Animatable.Text 
            animation="fadeIn" 
            style={styles.monthTitle}
          >
            {dayjs(currentMonth).format('MMMM YYYY')}
          </Animatable.Text>
          
          <TouchableOpacity 
            onPress={() => changeMonth('next')}
            style={styles.navButton}
          >
            <Icon name="income" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjetas de resumen con gradientes */}
        <View style={styles.summarySection}>
          <Animatable.View animation="slideInLeft" delay={100}>
            <Card 
              gradient={Colors.gradients.income} 
              style={styles.summaryCard}
              shadowLevel="lg"
            >
              <View style={styles.cardHeader}>
                <Icon name="income" size={20} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Ingresos</Text>
              </View>
              <Text style={styles.cardAmount}>
                {formatCurrency(balance.income)}
              </Text>
            </Card>
          </Animatable.View>

          <Animatable.View animation="slideInRight" delay={200}>
            <Card 
              gradient={Colors.gradients.error} 
              style={styles.summaryCard}
              shadowLevel="lg"
            >
              <View style={styles.cardHeader}>
                <Icon name="expense" size={20} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Gastos</Text>
              </View>
              <Text style={styles.cardAmount}>
                {formatCurrency(balance.expenses)}
              </Text>
            </Card>
          </Animatable.View>
        </View>

        {/* Balance principal */}
        <Animatable.View animation="bounceIn" delay={300}>
          <Card 
            gradient={balance.balance >= 0 ? Colors.gradients.success : Colors.gradients.error}
            style={styles.balanceCard}
            shadowLevel="xl"
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Balance Total</Text>
              <Icon 
                name={balance.balance >= 0 ? "income" : "expense"} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.balanceAmount}>
              {formatCurrency(Math.abs(balance.balance))}
            </Text>
            <Text style={styles.balanceSubtext}>
              {balance.balance >= 0 ? 'Superávit' : 'Déficit'} del mes
            </Text>
          </Card>
        </Animatable.View>

        {/* Selector de vista mejorado */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Card style={styles.viewSelectorCard}>
            <View style={styles.viewSelector}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'month' && styles.activeViewButton
                ]}
                onPress={() => setViewMode('month')}
              >
                <Text style={[
                  styles.viewButtonText,
                  { color: viewMode === 'month' ? '#FFFFFF' : theme.colors.text }
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
                  { color: viewMode === 'fortnight' ? '#FFFFFF' : theme.colors.text }
                ]}>
                  Quincenal
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animatable.View>

        {/* Gráfico mejorado */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Card style={styles.chartCard} shadowLevel="lg">
            <View style={styles.chartHeader}>
              <Icon name="chart" size={20} color={Colors.primary} />
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                {viewMode === 'month' ? 'Análisis Mensual' : 'Comparación Quincenal'}
              </Text>
            </View>
            <BarChart 
              data={getChartData()} 
              width={width - 60} 
              height={220} 
            />
          </Card>
        </Animatable.View>

        {/* Categorías principales mejoradas */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Card style={styles.categoriesCard} shadowLevel="lg">
            <View style={styles.categoriesHeader}>
              <Icon name="categories" size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Top Categorías
              </Text>
            </View>
            
            {categoryTotals
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((category, index) => (
                <Animatable.View 
                  key={category.id} 
                  animation="slideInLeft" 
                  delay={700 + (index * 100)}
                >
                  <View style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <LinearGradient
                        colors={[category.color, category.color + '80']}
                        style={styles.categoryIconGradient}
                      >
                        <Text style={styles.categoryEmoji}>{category.icon}</Text>
                      </LinearGradient>
                      <View style={styles.categoryInfo}>
                        <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                          {category.name}
                        </Text>
                        <Text style={[styles.categorySubtext, { color: theme.colors.textSecondary }]}>
                          {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={[
                        styles.categoryAmount,
                        { color: category.type === 'income' ? Colors.success : Colors.error }
                      ]}>
                        {formatCurrency(category.total)}
                      </Text>
                      <View style={[
                        styles.categoryBadge,
                        { backgroundColor: category.type === 'income' ? Colors.success + '20' : Colors.error + '20' }
                      ]}>
                        <Text style={[
                          styles.categoryBadgeText,
                          { color: category.type === 'income' ? Colors.success : Colors.error }
                        ]}>
                          #{index + 1}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animatable.View>
              ))
            }
            
            {categoryTotals.length === 0 && (
              <Animatable.View animation="fadeIn" delay={700}>
                <View style={styles.noDataContainer}>
                  <Icon emoji="📊" size={48} background={theme.colors.surfaceVariant} borderRadius="full" />
                  <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                    No hay transacciones este mes
                  </Text>
                  <Text style={[styles.noDataSubtext, { color: theme.colors.textTertiary }]}>
                    ¡Comienza agregando tu primera transacción!
                  </Text>
                </View>
              </Animatable.View>
            )}
          </Card>
        </Animatable.View>

        {/* Espacio para el FAB */}
        <View style={styles.fabSpace} />
      </ScrollView>

      {/* Botón de acción flotante mejorado */}
      <Animatable.View 
        animation="bounceIn" 
        delay={800}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEditTransaction')}
          style={styles.fab}
        >
          <LinearGradient
            colors={Colors.gradients.secondary}
            style={styles.fabGradient}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    opacity: 0.9,
  },
  cardAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  viewSelectorCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 4,
  },
  viewSelector: {
    flexDirection: 'row',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeViewButton: {
    backgroundColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoriesCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categorySubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fabSpace: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
