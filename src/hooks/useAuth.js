import { useState, useCallback, useEffect } from 'react';
import storage from '../utils/storage';

/**
 * Hook personalizado para manejar la autenticación de usuarios
 * @returns {Object} Estado y métodos de autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario guardado usando storage seguro al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = storage.getItem('user', null);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        setError('Error al cargar sesión');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Aquí iría la llamada al API de autenticación
      // Por ahora es una implementación básica
      const { username, password } = credentials;

      if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos');
      }

      // Simulación de respuesta del servidor
      // En producción, esto debería ser una llamada real al backend
      const userData = {
        id: Date.now(),
        username,
        email: `${username}@example.com`,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Guardar usando storage seguro
      storage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Registrar nuevo usuario
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { username, email, password } = userData;

      if (!username || !email || !password) {
        throw new Error('Todos los campos son requeridos');
      }

      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
      }

      // Simulación de respuesta del servidor
      const newUser = {
        id: Date.now(),
        username,
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Guardar usando storage seguro
      storage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    try {
      // Remover usando storage seguro
      storage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión');
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Actualizar información del usuario
   */
  const updateUser = useCallback((updates) => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Actualizar usando storage seguro
      storage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Obtener el token de autenticación (si existe)
   */
  const getToken = useCallback(() => {
    try {
      return storage.getItem('authToken', null);
    } catch (err) {
      console.error('Error al obtener token:', err);
      return null;
    }
  }, []);

  /**
   * Establecer el token de autenticación
   */
  const setToken = useCallback((token) => {
    try {
      if (token) {
        storage.setItem('authToken', token);
      } else {
        storage.removeItem('authToken');
      }
      return { success: true };
    } catch (err) {
      console.error('Error al guardar token:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    getToken,
    setToken
  };
};

export default useAuth;
