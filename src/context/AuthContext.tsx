import React, { createContext, useContext, useState, useEffect } from 'react';
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
  logout: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; profileImage?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  switchDemoRole: (role: 'admin' | 'vendor' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('novamart_auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('novamart_auth_token');
      if (storedToken) {
        try {
          const res = await api.getMe(storedToken);
          if (res.user) {
            setUser(res.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('novamart_auth_token');
          }
        } catch {
          localStorage.removeItem('novamart_auth_token');
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
      localStorage.setItem('novamart_auth_token', res.token);
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
      localStorage.setItem('novamart_auth_token', res.token);
      showToast('success', 'Admin Access Granted', `Logged in as ${res.user.firstName} (${res.user.role})`);
      return true;
    } catch (err: any) {
      showToast('error', 'Admin Login Failed', err.message || 'Access denied');
      return false;
    }
  };

  const vendorLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const vendors = await api.getVendors();
      const vendor = vendors.find(
        (v) => v.email.toLowerCase() === email.toLowerCase() || v.ownerName.toLowerCase().includes(email.toLowerCase())
      );

      const vendorUser: User = {
        id: vendor?.userId || 'usr-kofi-seller',
        firstName: vendor ? vendor.ownerName.split(' ')[0] : 'Kofi',
        lastName: vendor ? vendor.ownerName.split(' ')[1] || 'Seller' : 'Boateng',
        email: email,
        phone: vendor?.phone || '+233 24 888 1234',
        role: 'vendor',
        vendorId: vendor?.id || 'vend-kofi',
        vendorStoreName: vendor?.storeName || 'Kofi Tech & Audio Hub',
        profileImage: vendor?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setUser(vendorUser);
      const token = `mock-vendor-token-${vendorUser.id}`;
      setToken(token);
      localStorage.setItem('novamart_auth_token', token);
      showToast('success', 'Vendor Portal Access', `Welcome back, ${vendorUser.firstName} (${vendorUser.vendorStoreName})!`);
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
      localStorage.setItem('novamart_auth_token', res.token);
      showToast('success', 'Account Created Successfully!', `Welcome to NovaMart, ${res.user.firstName}!`);
      return true;
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Please check your information');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('novamart_auth_token');
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
