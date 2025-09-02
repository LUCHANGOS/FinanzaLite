import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import { useFinance } from '../context/FinanceContext';
import { getTheme, Colors } from '../constants/Theme';
import Card from './Card';
import Icon from './Icon';

export default function TransactionItem({ transaction, onPress, onLongPress, index = 0 }) {
  const { categories } = useFinance();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  const category = categories.find(c => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) onLongPress();
  };

  return (
    <Animatable.View 
      animation="slideInRight" 
      delay={index * 100}
      duration={600}
    >
      <Card
        style={styles.container}
        shadowLevel="md"
        padding={0}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
        >
          <View style={styles.leftSection}>
            {/* Icono con gradiente */}
            <LinearGradient
              colors={[
                category?.color || Colors.primary, 
                (category?.color || Colors.primary) + '80'
              ]}
              style={styles.iconContainer}
            >
              <Text style={styles.icon}>{category?.icon || '💰'}</Text>
            </LinearGradient>
            
            <View style={styles.details}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category?.name || 'Sin categoría'}
              </Text>
              
              {transaction.description && (
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  {transaction.description}
                </Text>
              )}
              
              <View style={styles.dateContainer}>
                <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
                  {dayjs(transaction.date).format('DD/MM/YYYY')}
                </Text>
                <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
                  {dayjs(transaction.date).format('HH:mm')}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <View style={[
              styles.amountContainer,
              { backgroundColor: (isIncome ? Colors.success : Colors.error) + '15' }
            ]}>
              <Text style={[styles.amount, { color: isIncome ? Colors.success : Colors.error }]}>
                {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
              </Text>
            </View>
            
            <View style={[
              styles.typeBadge,
              { backgroundColor: isIncome ? Colors.success + '20' : Colors.error + '20' }
            ]}>
              <Icon 
                name={isIncome ? 'income' : 'expense'} 
                size={12} 
                color={isIncome ? Colors.success : Colors.error} 
              />
              <Text style={[
                styles.type, 
                { color: isIncome ? Colors.success : Colors.error }
              ]}>
                {isIncome ? 'Ingreso' : 'Gasto'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
  },
  details: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  type: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
});
