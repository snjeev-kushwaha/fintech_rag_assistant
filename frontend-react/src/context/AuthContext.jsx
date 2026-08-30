/**
 * AuthContext.jsx — Token-Only LocalStorage Auth Manager
 * Stores ONLY the JWT access token in localStorage and fetches live user profile via /auth/me on refresh
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGetMe } from '../services/authService';

const AuthContext = createContext(null);
const TOKEN_KEY = 'auth_token';

const defaultLoggedOutState = {
  authenticated: false,
  token: null,
  role: null,
  username: null,
  displayName: null,
  roleColor: null,
  roleEmoji: null,
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(defaultLoggedOutState);
  const [sessionLoading, setSessionLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Failed to clear auth token from localStorage:', err);
    }
    setAuth(defaultLoggedOutState);
  }, []);

  const login = useCallback((data) => {
    try {
      // Store ONLY the token in localStorage
      localStorage.setItem(TOKEN_KEY, data.access_token);
    } catch (err) {
      console.error('Failed to save auth token to localStorage:', err);
    }

    setAuth({
      authenticated: true,
      token: data.access_token,
      role: data.role,
      username: data.username,
      displayName: data.display_name,
      roleColor: data.role_color,
      roleEmoji: data.role_emoji,
    });
  }, []);

  // On page load/refresh: Verify token with backend /auth/me and hydrate user profile
  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setSessionLoading(false);
        return;
      }

      try {
        const userInfo = await apiGetMe(savedToken);
        setAuth({
          authenticated: true,
          token: savedToken,
          role: userInfo.role,
          username: userInfo.username,
          displayName: userInfo.display_name,
          roleColor: userInfo.role_color,
          roleEmoji: userInfo.role_emoji,
        });
      } catch (err) {
        console.warn('Saved auth token is invalid or expired. Logging out.');
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // ignore
        }
        setAuth(defaultLoggedOutState);
      } finally {
        setSessionLoading(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, sessionLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
