import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken as saveToken, clearToken as removeToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      api.getMe().then(u => setUser(u)).catch(() => removeToken()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    saveToken(res.token);
    setUser(res.user || { username, role: res.role });
    return res;
  };

  const logout = () => { removeToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
