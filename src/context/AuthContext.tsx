import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types/index';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isStoreManager: boolean;
  isVendor: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  vendorLogin: (email: string, pass: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; profileImage?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  switchDemoRole: (role: 'admin' | 'vendor' | 'customer') => Promise<void>;
}

const DEFAULT_AUTH_CONTEXT: AuthContextType = {
  user: null,
  token: null,
  isAdmin: false,
  isStoreManager: false,
  isVendor: false,
  isLoading: false,
  login: async () => false,
  adminLogin: async () => false,
  vendorLogin: async () => false,
  register: async () => false,
  googleLogin: async () => false,
  logout: () => {},
  updateProfile: async () => false,
  changePassword: async () => false,
  switchDemoRole: async () => {}
};

const AuthContext = createContext<AuthContextType>(DEFAULT_AUTH_CONTEXT);

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('novamart_auth_token');
  } catch {
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem('novamart_auth_token', token);
  } catch {}
};

const removeStoredToken = (): void => {
  try {
    localStorage.removeItem('novamart_auth_token');
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await api.getMe(storedToken);
          if (res.user) {
            setUser(res.user);
            setToken(storedToken);
          } else {
            removeStoredToken();
          }
        } catch {
          removeStoredToken();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);
      showToast('success', `Welcome back, ${res.user.firstName}!`, 'You are logged in.');
      return true;
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message || 'Invalid credentials');
      return false;
    }
  };

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.adminLogin({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);
      showToast('success', 'Admin Access Granted', `Logged in as ${res.user.firstName} (${res.user.role})`);
      return true;
    } catch (err: any) {
      showToast('error', 'Admin Login Failed', err.message || 'Access denied');
      return false;
    }
  };

  const vendorLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.vendorLogin({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);
      showToast('success', 'Vendor Portal Access', `Welcome back, ${res.user.firstName} (${res.user.vendorStoreName || 'Official Vendor'})!`);
      return true;
    } catch (err: any) {
      showToast('error', 'Vendor Login Failed', err.message || 'Access denied');
      return false;
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; phone?: string; password: string }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);
      showToast('success', 'Account Created Successfully!', `Welcome to NovaMart, ${res.user.firstName}!`);
      return true;
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Please check your information');
      return false;
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const nameParts = (fbUser.displayName || 'Guest User').split(' ');
      const googleUser: User = {
        id: fbUser.uid,
        firstName: nameParts[0] || 'Guest',
        lastName: nameParts.slice(1).join(' ') || 'User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: 'customer',
        profileImage: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const token = await fbUser.getIdToken();
      setUser(googleUser);
      setToken(token);
      setStoredToken(token);
      showToast('success', `Welcome, ${googleUser.firstName}! 🎉`, 'You are signed in with Google.');
      return true;
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('error', 'Google Sign-In Failed', err.message || 'Please try again.');
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredToken();
    showToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; phone?: string; profileImage?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await api.updateProfile({ userId: user.id, ...data });
      setUser(res.user);
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
      return true;
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await api.changePassword({ userId: user.id, currentPassword, newPassword });
      showToast('success', 'Password Changed', 'Your security password has been updated.');
      return true;
    } catch (err: any) {
      showToast('error', 'Password Change Failed', err.message);
      return false;
    }
  };

  // Demo Switcher for fast live review
  const switchDemoRole = async (role: 'admin' | 'vendor' | 'customer') => {
    if (role === 'admin') {
      await adminLogin('admin@novamart.com.gh', 'admin123');
    } else if (role === 'vendor') {
      await vendorLogin('kofi.seller@novamart.com.gh', 'seller123');
    } else {
      await login('maskarano111@gmail.com', 'customer123');
    }
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isStoreManager = isAdmin || user?.role === 'store_manager';
  const isVendor = user?.role === 'vendor';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isStoreManager,
        isVendor,
        isLoading,
        login,
        adminLogin,
        vendorLogin,
        register,
        googleLogin,
        logout,
        updateProfile,
        changePassword,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || DEFAULT_AUTH_CONTEXT;
};
