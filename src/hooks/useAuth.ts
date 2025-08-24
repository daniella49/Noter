import { useState, useEffect } from 'react';
import { apiClient, User } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      apiClient.getCurrentUser()
        .then(({ user }) => {
          setUser(user);
          setLoading(false);
        })
        .catch(() => {
          // Token is invalid, remove it
          apiClient.setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const response = await apiClient.register(email, password);
      apiClient.setToken(response.token);
      setUser(response.user);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      setUser(response.user);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.logout();
      apiClient.setToken(null);
      setUser(null);
      return { error: null };
    } catch (error) {
      // Even if logout fails on server, clear local state
      apiClient.setToken(null);
      setUser(null);
      return { error: { message: (error as Error).message } };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}