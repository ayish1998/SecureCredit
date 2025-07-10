import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, AuthContextType, LoginCredentials, RegisterCredentials } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Simulate API calls with localStorage for demo
  const mockUsers = JSON.parse(localStorage.getItem('securecredit_users') || '[]');
  const currentSession = localStorage.getItem('securecredit_session');

  useEffect(() => {
    // Check for existing session on mount
    if (currentSession) {
      const sessionData = JSON.parse(currentSession);
      const user = mockUsers.find((u: User) => u.id === sessionData.userId);
      
      if (user && sessionData.expiresAt > Date.now()) {
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return;
      } else {
        // Session expired
        localStorage.removeItem('securecredit_session');
      }
    }

    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find((u: User) => 
        u.email === credentials.email
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In production, you'd verify the password hash
      // For demo, we'll accept any password for existing users

      // Update last login
      user.lastLogin = new Date().toISOString();
      const updatedUsers = mockUsers.map((u: User) => u.id === user.id ? user : u);
      localStorage.setItem('securecredit_users', JSON.stringify(updatedUsers));

      // Create session
      const session = {
        userId: user.id,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      localStorage.setItem('securecredit_session', JSON.stringify(session));

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUser = mockUsers.find((u: User) => u.email === credentials.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phone: credentials.phone,
        country: credentials.country,
        role: 'user',
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Save user
      const updatedUsers = [...mockUsers, newUser];
      localStorage.setItem('securecredit_users', JSON.stringify(updatedUsers));

      // Create session
      const session = {
        userId: newUser.id,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      localStorage.setItem('securecredit_session', JSON.stringify(session));

      setState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear session
      localStorage.removeItem('securecredit_session');

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!state.user) throw new Error('No user logged in');

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...state.user, ...updates };
      const updatedUsers = mockUsers.map((u: User) => 
        u.id === state.user!.id ? updatedUser : u
      );
      localStorage.setItem('securecredit_users', JSON.stringify(updatedUsers));

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Profile update failed',
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find((u: User) => u.email === email);
      if (!user) {
        throw new Error('No user found with this email address');
      }

      // In production, this would send a reset email
      console.log(`Password reset email sent to ${email}`);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};