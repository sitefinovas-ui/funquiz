import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../Services/authServices.js';
import { loginWithGoogleToken } from '../Services/googleAuthService.js';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Permet de rafraîchir l'utilisateur à la demande (ex: après upload avatar)
  const refreshUser = useCallback(async () => {
    setLoading(true);
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const loginWithGoogle = useCallback(async (googleToken) => {
    try {
      const response = await loginWithGoogleToken(googleToken);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API failed:', err?.message || err);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const register = useCallback(async (credentials) => {
    try {
      const response = await authService.register(credentials);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const putUserById = useCallback(async (id, userData) => {
    try {
      const response = await authService.putUserById(id, userData);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const deleteUserById = useCallback(async (id) => {
    try {
      const response = await authService.deleteUserById(id);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const checkUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const allUsers = useCallback(async () => {
    try {
      const response = await authService.getAllUsers();
      // On ne fait pas checkAuth() ici pour éviter des boucles infinies ou des re-renders inutiles
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    putUserById,
    deleteUserById,
    checkUser,
    refreshUser,
    allUsers,
  }), [user, loading, login, loginWithGoogle, logout, register, putUserById, deleteUserById, checkUser, refreshUser, allUsers]);

  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
