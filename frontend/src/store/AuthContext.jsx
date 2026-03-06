import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 로그인
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 회원가입
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // 사용자 정보 갱신
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  // 관리자 여부 확인
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    refreshUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
