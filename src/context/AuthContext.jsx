// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../api/mockApi';
import { loginConDummyJSON } from '../api/dummyAuth';

const AuthContext = createContext(null);
const SESSION_KEY = 'barberia_session_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(auth.getCurrentUser());
    setLoading(false);
  }, []);

  // Login real contra DummyJSON (https://dummyjson.com/auth/login)
  const login = useCallback(async (username, password) => {
    const res = await loginConDummyJSON(username, password);
    if (res.ok) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await auth.loginWithGoogle();
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await auth.register(data);
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (changes) => {
      if (!user) return;
      // Los usuarios que iniciaron sesión con DummyJSON no existen en la
      // base local simulada, así que solo actualizamos el estado/sesión.
      if (user.provider === 'dummyjson') {
        const updated = { ...user, ...changes };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setUser(updated);
        return { ok: true, user: updated };
      }
      const res = await auth.updateProfile(user.id, changes);
      if (res.ok) setUser(res.user);
      return res;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
