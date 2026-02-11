import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../Services/authServices.js';
import { loginWithGoogleToken } from '../Services/googleAuthService.js';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
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
  };

  // Permet de rafraîchir l'utilisateur à la demande (ex: après upload avatar)
  const refreshUser = async () => {
    setLoading(true);
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await loginWithGoogleToken(googleToken);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API failed:', err?.message || err);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  const register = async (credentials) => {
    try {
      const response = await authService.register(credentials);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const putUserById = async (id, userData) => {
    try {
      const response = await authService.putUserById(id, userData);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deleteUserById = async (id) => {
    try {
      const response = await authService.deleteUserById(id);
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const checkUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const allUsers = async () => {
    try {
      const response = await authService.getAllUsers();
      await checkAuth();
      return response;
    } catch (error) {
      throw error;
    }
  };
  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
