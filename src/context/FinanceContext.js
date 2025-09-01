import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';

const FinanceContext = createContext();

const initialState = {
  transactions: [],
  categories: [
    { id: '1', name: 'Sueldo', type: 'income', color: '#4CAF50', icon: '💼' },
    { id: '2', name: 'Bonos', type: 'income', color: '#8BC34A', icon: '🎁' },
    { id: '3', name: 'Arriendo', type: 'expense', color: '#F44336', icon: '🏠' },
    { id: '4', name: 'Comida', type: 'expense', color: '#FF9800', icon: '🍕' },
    { id: '5', name: 'Transporte', type: 'expense', color: '#2196F3', icon: '🚗' },
    { id: '6', name: 'Ocio', type: 'expense', color: '#9C27B0', icon: '🎮' },
    { id: '7', name: 'Cuentas', type: 'expense', color: '#607D8B', icon: '📄' },
  ],
  settings: {
    pinEnabled: false,
    notificationsEnabled: true,
    darkMode: 'auto',
    currency: 'CLP',
    firstTimeUser: true,
  },
  currentMonth: dayjs().format('YYYY-MM'),
};

function financeReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return { ...state, ...action.payload };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
        transactions: state.transactions.filter(t => t.categoryId !== action.payload)
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'SET_CURRENT_MONTH':
      return {
        ...state,
        currentMonth: action.payload
      };
    
    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Cargar datos del almacenamiento local
  useEffect(() => {
    loadData();
  }, []);

  // Guardar datos cuando cambia el estado
  useEffect(() => {
    saveData();
  }, [state.transactions, state.categories, state.settings]);

  const loadData = async () => {
    try {
      const transactions = await AsyncStorage.getItem('transactions');
      const categories = await AsyncStorage.getItem('categories');
      const settings = await AsyncStorage.getItem('settings');

      const loadedData = {
        transactions: transactions ? JSON.parse(transactions) : [],
        categories: categories ? JSON.parse(categories) : initialState.categories,
        settings: settings ? JSON.parse(settings) : initialState.settings,
      };

      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: loadedData
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      // En caso de error, usar datos iniciales
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: {
          transactions: [],
          categories: initialState.categories,
          settings: initialState.settings,
        }
      });
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(state.transactions));
      await AsyncStorage.setItem('categories', JSON.stringify(state.categories));
      await AsyncStorage.setItem('settings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Error guardando datos:', error);
    }
  };

  // Funciones de transacciones
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || dayjs().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const updateTransaction = (transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  // Funciones de categorías
  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = (category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = (id) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  // Funciones de configuración
  const updateSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const setCurrentMonth = (month) => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: month });
  };

  // Funciones de cálculo
  const getMonthlyTransactions = (month = state.currentMonth) => {
    return state.transactions.filter(t => 
      dayjs(t.date).format('YYYY-MM') === month
    );
  };

  const getFortnightTransactions = (month = state.currentMonth, fortnight = 1) => {
    const monthTransactions = getMonthlyTransactions(month);
    const startOfMonth = dayjs(`${month}-01`);
    const midMonth = startOfMonth.date(15);
    
    if (fortnight === 1) {
      return monthTransactions.filter(t => dayjs(t.date).isBefore(midMonth) || dayjs(t.date).isSame(midMonth));
    } else {
      return monthTransactions.filter(t => dayjs(t.date).isAfter(midMonth));
    }
  };

  const getMonthlyBalance = (month = state.currentMonth) => {
    const transactions = getMonthlyTransactions(month);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  };

  const getCategoryTotals = (month = state.currentMonth) => {
    const transactions = getMonthlyTransactions(month);
    const categoryTotals = {};
    
    transactions.forEach(t => {
      const category = state.categories.find(c => c.id === t.categoryId);
      if (category) {
        if (!categoryTotals[category.id]) {
          categoryTotals[category.id] = {
            ...category,
            total: 0,
            count: 0,
          };
        }
        categoryTotals[category.id].total += t.amount;
        categoryTotals[category.id].count += 1;
      }
    });
    
    return Object.values(categoryTotals);
  };

  // Función para exportar a CSV
  const exportToCSV = async (month = state.currentMonth) => {
    try {
      const transactions = getMonthlyTransactions(month);
      
      let csvContent = 'Fecha,Tipo,Categoría,Descripción,Monto\n';
      
      transactions.forEach(transaction => {
        const category = state.categories.find(c => c.id === transaction.categoryId);
        const row = [
          dayjs(transaction.date).format('YYYY-MM-DD'),
          transaction.type === 'income' ? 'Ingreso' : 'Gasto',
          category?.name || 'Sin categoría',
          transaction.description || '',
          transaction.amount.toString()
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
      });

      const fileName = `finanzas_${month}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Exportar movimientos de ${month}`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error exportando CSV:', error);
      return false;
    }
  };

  const value = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    setCurrentMonth,
    getMonthlyTransactions,
    getFortnightTransactions,
    getMonthlyBalance,
    getCategoryTotals,
    exportToCSV,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe usarse dentro de FinanceProvider');
  }
  return context;
}
