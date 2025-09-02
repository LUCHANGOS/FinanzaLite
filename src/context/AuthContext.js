import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  biometricAvailable: false,
  users: [],
  currentSession: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload] 
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => 
          u.id === action.payload.id ? action.payload : u
        ),
        user: state.user?.id === action.payload.id ? action.payload : state.user
      };
    
    case 'SET_BIOMETRIC_AVAILABLE':
      return { ...state, biometricAvailable: action.payload };
    
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        currentSession: null 
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Verificar disponibilidad biométrica
      const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      dispatch({ 
        type: 'SET_BIOMETRIC_AVAILABLE', 
        payload: biometricTypes.length > 0 
      });

      // Cargar usuarios
      const users = await loadUsers();
      dispatch({ type: 'SET_USERS', payload: users });

      // Verificar sesión activa
      const activeSession = await SecureStore.getItemAsync('activeSession');
      if (activeSession) {
        const sessionData = JSON.parse(activeSession);
        const user = users.find(u => u.id === sessionData.userId);
        if (user && isSessionValid(sessionData)) {
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_SESSION', payload: sessionData });
        } else {
          await SecureStore.deleteItemAsync('activeSession');
        }
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem('users');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      return [];
    }
  };

  const saveUsers = async (users) => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error('Error guardando usuarios:', error);
    }
  };

  const hashPassword = async (password) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + 'finanzalite_salt'
    );
  };

  const createUser = async (userData) => {
    try {
      const hashedPassword = await hashPassword(userData.password);
      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        name: userData.name,
        passwordHash: hashedPassword,
        biometricEnabled: false,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        profilePicture: null,
        preferences: {
          currency: 'CLP',
          notifications: true,
          biometricLogin: false,
          autoLock: true,
          darkMode: 'auto',
        }
      };

      const updatedUsers = [...state.users, newUser];
      await saveUsers(updatedUsers);
      dispatch({ type: 'ADD_USER', payload: newUser });

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creando usuario:', error);
      return { success: false, error: 'Error creando usuario' };
    }
  };

  const loginUser = async (username, password) => {
    try {
      const user = state.users.find(u => 
        u.username === username || u.email === username
      );

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const hashedPassword = await hashPassword(password);
      if (user.passwordHash !== hashedPassword) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      const sessionData = {
        userId: user.id,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      };

      await SecureStore.setItemAsync('activeSession', JSON.stringify(sessionData));
      
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const updatedUsers = state.users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      await saveUsers(updatedUsers);

      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_SESSION', payload: sessionData });
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error en el login' };
    }
  };

  const loginWithBiometric = async () => {
    try {
      if (!state.biometricAvailable) {
        return { success: false, error: 'Biometría no disponible' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticarse con biometría',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar PIN',
      });

      if (result.success) {
        // Buscar el último usuario que inició sesión
        const lastUser = state.users
          .filter(u => u.preferences.biometricLogin)
          .sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0))[0];

        if (lastUser) {
          const sessionData = {
            userId: lastUser.id,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };

          await SecureStore.setItemAsync('activeSession', JSON.stringify(sessionData));
          dispatch({ type: 'SET_USER', payload: lastUser });
          dispatch({ type: 'SET_SESSION', payload: sessionData });

          return { success: true, user: lastUser };
        } else {
          return { success: false, error: 'No hay usuarios con biometría habilitada' };
        }
      }

      return { success: false, error: 'Autenticación cancelada' };
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      return { success: false, error: 'Error en autenticación biométrica' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('activeSession');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const updateUserPreferences = async (preferences) => {
    if (!state.user) return;

    try {
      const updatedUser = {
        ...state.user,
        preferences: { ...state.user.preferences, ...preferences }
      };

      const updatedUsers = state.users.map(u => 
        u.id === state.user.id ? updatedUser : u
      );

      await saveUsers(updatedUsers);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });

      return { success: true };
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      return { success: false, error: 'Error actualizando preferencias' };
    }
  };

  const isSessionValid = (session) => {
    if (!session) return false;
    return new Date(session.expiresAt) > new Date();
  };

  const enableBiometricLogin = async () => {
    if (!state.biometricAvailable || !state.user) {
      return { success: false, error: 'Biometría no disponible' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verificar identidad para habilitar biometría',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        await updateUserPreferences({ biometricLogin: true });
        return { success: true };
      }

      return { success: false, error: 'Verificación cancelada' };
    } catch (error) {
      console.error('Error habilitando biometría:', error);
      return { success: false, error: 'Error habilitando biometría' };
    }
  };

  const value = {
    ...state,
    createUser,
    loginUser,
    loginWithBiometric,
    logout,
    updateUserPreferences,
    enableBiometricLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
