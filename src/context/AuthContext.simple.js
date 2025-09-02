import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 'demo_user', name: 'Usuario Demo' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Para demo, siempre hay un usuario autenticado
  useEffect(() => {
    setIsAuthenticated(true);
    setUser({ id: 'demo_user', name: 'Usuario Demo' });
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    // Funciones dummy para compatibilidad
    loginUser: async () => ({ success: true }),
    logoutUser: async () => {},
    createUser: async () => ({ success: true }),
    loginWithBiometric: async () => ({ success: true }),
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
