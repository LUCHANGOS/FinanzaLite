import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useAuth } from './AuthContext';

const SavingsContext = createContext();

const initialState = {
  savingsGoals: [],
  savingsHistory: [],
  totalSavings: 0,
  monthlyTarget: 0,
};

function savingsReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return { ...state, ...action.payload };
    
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload]
      };
    
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(goal => goal.id !== action.payload)
      };
    
    case 'ADD_SAVINGS_ENTRY':
      return {
        ...state,
        savingsHistory: [...state.savingsHistory, action.payload],
        totalSavings: state.totalSavings + action.payload.amount
      };
    
    case 'UPDATE_SAVINGS_ENTRY':
      const oldEntry = state.savingsHistory.find(entry => entry.id === action.payload.id);
      const amountDiff = action.payload.amount - (oldEntry?.amount || 0);
      
      return {
        ...state,
        savingsHistory: state.savingsHistory.map(entry => 
          entry.id === action.payload.id ? action.payload : entry
        ),
        totalSavings: state.totalSavings + amountDiff
      };
    
    case 'DELETE_SAVINGS_ENTRY':
      const entryToDelete = state.savingsHistory.find(entry => entry.id === action.payload);
      return {
        ...state,
        savingsHistory: state.savingsHistory.filter(entry => entry.id !== action.payload),
        totalSavings: state.totalSavings - (entryToDelete?.amount || 0)
      };
    
    case 'SET_MONTHLY_TARGET':
      return {
        ...state,
        monthlyTarget: action.payload
      };
    
    default:
      return state;
  }
}

export function SavingsProvider({ children }) {
  const [state, dispatch] = useReducer(savingsReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavingsData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      saveSavingsData();
    }
  }, [state.savingsGoals, state.savingsHistory, state.monthlyTarget, user]);

  const loadSavingsData = async () => {
    if (!user) return;

    try {
      const key = `savings_${user.id}`;
      const savingsData = await AsyncStorage.getItem(key);
      
      if (savingsData) {
        const parsed = JSON.parse(savingsData);
        dispatch({ type: 'SET_INITIAL_DATA', payload: parsed });
      }
    } catch (error) {
      console.error('Error cargando datos de ahorros:', error);
    }
  };

  const saveSavingsData = async () => {
    if (!user) return;

    try {
      const key = `savings_${user.id}`;
      const dataToSave = {
        savingsGoals: state.savingsGoals,
        savingsHistory: state.savingsHistory,
        totalSavings: state.totalSavings,
        monthlyTarget: state.monthlyTarget,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error guardando datos de ahorros:', error);
    }
  };

  // Funciones de metas de ahorro
  const addSavingsGoal = (goalData) => {
    const newGoal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      isCompleted: false,
    };
    
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newGoal });
    return newGoal;
  };

  const updateSavingsGoal = (goal) => {
    dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal });
  };

  const deleteSavingsGoal = (goalId) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: goalId });
  };

  const completeGoal = (goalId) => {
    const goal = state.savingsGoals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = { ...goal, isCompleted: true, completedAt: new Date().toISOString() };
      updateSavingsGoal(updatedGoal);
    }
  };

  // Funciones de entradas de ahorro
  const addSavingsEntry = (entryData) => {
    const newEntry = {
      ...entryData,
      id: Date.now().toString(),
      date: entryData.date || new Date().toISOString(),
      userId: user?.id,
    };

    dispatch({ type: 'ADD_SAVINGS_ENTRY', payload: newEntry });

    // Si está asociado a una meta, actualizar el progreso
    if (entryData.goalId) {
      const goal = state.savingsGoals.find(g => g.id === entryData.goalId);
      if (goal) {
        const newAmount = goal.currentAmount + entryData.amount;
        const updatedGoal = {
          ...goal,
          currentAmount: newAmount,
          isCompleted: newAmount >= goal.targetAmount
        };
        
        if (updatedGoal.isCompleted && !goal.isCompleted) {
          updatedGoal.completedAt = new Date().toISOString();
        }
        
        updateSavingsGoal(updatedGoal);
      }
    }

    return newEntry;
  };

  const updateSavingsEntry = (entry) => {
    dispatch({ type: 'UPDATE_SAVINGS_ENTRY', payload: entry });
  };

  const deleteSavingsEntry = (entryId) => {
    const entry = state.savingsHistory.find(e => e.id === entryId);
    if (entry?.goalId) {
      // Actualizar la meta si estaba asociada
      const goal = state.savingsGoals.find(g => g.id === entry.goalId);
      if (goal) {
        const updatedGoal = {
          ...goal,
          currentAmount: Math.max(0, goal.currentAmount - entry.amount),
          isCompleted: false
        };
        updateSavingsGoal(updatedGoal);
      }
    }
    
    dispatch({ type: 'DELETE_SAVINGS_ENTRY', payload: entryId });
  };

  // Funciones de cálculo
  const getMonthlySavings = (month = dayjs().format('YYYY-MM')) => {
    return state.savingsHistory
      .filter(entry => dayjs(entry.date).format('YYYY-MM') === month)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getGoalProgress = (goalId) => {
    const goal = state.savingsGoals.find(g => g.id === goalId);
    if (!goal) return 0;
    
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getActiveGoals = () => {
    return state.savingsGoals.filter(goal => !goal.isCompleted);
  };

  const getCompletedGoals = () => {
    return state.savingsGoals.filter(goal => goal.isCompleted);
  };

  const getSavingsAnalytics = () => {
    const currentMonth = dayjs().format('YYYY-MM');
    const lastMonth = dayjs().subtract(1, 'month').format('YYYY-MM');
    
    const currentMonthSavings = getMonthlySavings(currentMonth);
    const lastMonthSavings = getMonthlySavings(lastMonth);
    
    const totalGoals = state.savingsGoals.length;
    const completedGoals = getCompletedGoals().length;
    const activeGoals = getActiveGoals().length;
    
    const averageMonthlySavings = state.savingsHistory.length > 0 
      ? state.totalSavings / Math.max(1, dayjs().diff(dayjs(state.savingsHistory[0]?.date), 'month') + 1)
      : 0;

    return {
      totalSavings: state.totalSavings,
      currentMonthSavings,
      lastMonthSavings,
      monthlyGrowth: lastMonthSavings > 0 ? ((currentMonthSavings - lastMonthSavings) / lastMonthSavings) * 100 : 0,
      totalGoals,
      completedGoals,
      activeGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      averageMonthlySavings,
      targetProgress: state.monthlyTarget > 0 ? (currentMonthSavings / state.monthlyTarget) * 100 : 0,
    };
  };

  const setMonthlyTarget = (amount) => {
    dispatch({ type: 'SET_MONTHLY_TARGET', payload: amount });
  };

  const value = {
    ...state,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    completeGoal,
    addSavingsEntry,
    updateSavingsEntry,
    deleteSavingsEntry,
    getMonthlySavings,
    getGoalProgress,
    getActiveGoals,
    getCompletedGoals,
    getSavingsAnalytics,
    setMonthlyTarget,
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
}

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings debe usarse dentro de SavingsProvider');
  }
  return context;
};
