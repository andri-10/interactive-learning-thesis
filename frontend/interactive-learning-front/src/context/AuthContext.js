import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userInfo } = response.data;

      console.log('Backend response userInfo:', userInfo);
      
      localStorage.setItem('token', token);
      
      
      const userData = {
        id: userInfo?.id || 1,
        username: userInfo?.username || username,
        email: userInfo?.email || '',
        role: userInfo?.role || 'USER',
        isAdmin: userInfo?.role === 'ADMIN' || userInfo?.isAdmin === true,
        createdAt: userInfo?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

       console.log('Final userData stored:', userData);
      console.log('isAdmin check:', userData.role === 'ADMIN', userData.isAdmin);
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: userInfo } = response.data;
      
      localStorage.setItem('token', token);
      
      
      const newUserData = {
        id: userInfo?.id || 1,
        username: userInfo?.username || userData.username,
        email: userInfo?.email || userData.email,
        role: userInfo?.role || 'USER',
        isAdmin: userInfo?.role === 'ADMIN' || userInfo?.isAdmin === true,
        createdAt: userInfo?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  
  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.isAdmin === true;
  };

  
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
    isAdmin,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};