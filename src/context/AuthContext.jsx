// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

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
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call - replace with actual API
    try {
      // Mock users for demo
      const mockUsers = {
        'admin@edu.com': { id: 1, name: 'Admin User', email: 'admin@edu.com', role: 'admin' },
        'student@edu.com': { id: 2, name: 'Student User', email: 'student@edu.com', role: 'student' }
      };

      const user = mockUsers[email];
      if (user && password === 'password') {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Simulate registration - replace with actual API
      const newUser = {
        id: Date.now(),
        ...userData,
        role: userData.role || 'student'
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};