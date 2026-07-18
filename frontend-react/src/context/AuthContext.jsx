/**
 * AuthContext.jsx — Global auth state (token, role, user info)
 */
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    authenticated: false,
    token: null,
    role: null,
    username: null,
    displayName: null,
    roleColor: null,
    roleEmoji: null,
  });

  const login = useCallback((data) => {
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

  const logout = useCallback(() => {
    setAuth({
      authenticated: false,
      token: null,
      role: null,
      username: null,
      displayName: null,
      roleColor: null,
      roleEmoji: null,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
