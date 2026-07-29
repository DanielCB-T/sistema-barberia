// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../api/mockApi';
import { setOnUnauthorized } from '../api/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si el token guardado ya no es válido (expiró/fue revocado en el
    // servidor), esto cierra la sesión local para que ProtectedRoute
    // mande de vuelta al login. Así "solo entran usuarios autenticados".
    setOnUnauthorized(() => setUser(null));

    let cancelled = false;
    (async () => {
      // Muestra de inmediato el usuario en caché mientras se confirma con
      // el servidor, para que la app no parpadee a la pantalla de login.
      setUser(auth.getCurrentUser());
      const res = await auth.fetchCurrentUser();
      if (!cancelled) {
        setUser(res.ok ? res.user : null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await auth.login({ email, password });
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await auth.loginWithGoogle();
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await auth.register(data);
    // Con verificación de correo el registro ya NO inicia sesión: solo
    // marcamos al usuario como autenticado si el backend devolvió sesión.
    if (res.ok && !res.verificationRequired) setUser(res.user);
    return res;
  }, []);

  const resendVerification = useCallback(async (email) => auth.resendVerification(email), []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (changes) => {
      if (!user) return;
      const res = await auth.updateProfile(user.id, changes);
      if (res.ok) setUser(res.user);
      return res;
    },
    [user]
  );

  const changePassword = useCallback(async (data) => auth.changePassword(data), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        resendVerification,
        logout,
        updateProfile,
        changePassword,
      }}
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
