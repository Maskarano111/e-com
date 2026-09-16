import { User, DeliveryAddress } from '../../types/index';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const authApi = {
  async register(data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);
        const newUser: User = {
          id: `usr-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '+233 24 555 0199',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push({ ...newUser, passwordHash: data.password });
        setLocal(STORAGE_KEYS.USERS, users);
        return { user: newUser, token: `mock-token-${newUser.id}` };
      }
    );
  },

  async login(data: { email: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);
        const found = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        const user: User = found || {
          id: 'usr-demo-customer',
          firstName: 'Customer',
          lastName: 'VIP',
          email: data.email,
          phone: '+233 24 555 0199',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user, token: `mock-token-${user.id}` };
      }
    );
  },

  async adminLogin(data: { email: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/admin-login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const adminUser: User = {
          id: 'usr-super-admin',
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: data.email,
          phone: '+233 24 555 0199',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user: adminUser, token: `mock-admin-token-${adminUser.id}` };
      }
    );
  },

  async getMe(token: string) {
    return safeFetch<{ user: User }>(
      `${API_BASE}/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => {
        const user: User = {
          id: 'usr-current',
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: 'admin@novamart.com.gh',
          phone: '+233 24 555 0199',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user };
      }
    );
  },

  async updateProfile(data: { userId: string; firstName?: string; lastName?: string; phone?: string; profileImage?: string }) {
    return safeFetch<{ user: User }>(
      `${API_BASE}/auth/profile`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const user: User = {
          id: data.userId,
          firstName: data.firstName || 'Kwame',
          lastName: data.lastName || 'Mensah',
          email: 'admin@novamart.com.gh',
          phone: data.phone || '+233 24 555 0199',
          profileImage: data.profileImage,
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user };
      }
    );
  },

  async changePassword(data: { userId: string; currentPassword: string; newPassword: string }) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/change-password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ message: 'Password updated successfully' })
    );
  },

  async forgotPassword(email: string) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      },
      () => ({ message: `Password reset link sent to ${email}` })
    );
  },

  async resetPassword(data: { email: string; token: string; newPassword: string }) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ message: 'Password has been reset successfully' })
    );
  },

  // Addresses
  async getAddresses(userId: string) {
    return safeFetch<DeliveryAddress[]>(
      `${API_BASE}/addresses?userId=${userId}`,
      undefined,
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, [
          {
            id: 'addr-default',
            userId,
            name: 'Kwame Mensah',
            phone: '+233 24 555 0199',
            country: 'Ghana',
            city: 'Accra',
            region: 'Greater Accra',
            address: 'Airport Residential Area, Accra',
            isDefault: true
          }
        ]);
        return addrs;
      }
    );
  },

  async createAddress(data: DeliveryAddress) {
    return safeFetch<DeliveryAddress>(
      `${API_BASE}/addresses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        const newAddr = { ...data, id: `addr-${Date.now()}` };
        addrs.push(newAddr);
        setLocal(STORAGE_KEYS.ADDRESSES, addrs);
        return newAddr;
      }
    );
  },

  async updateAddress(id: string, data: Partial<DeliveryAddress>) {
    return safeFetch<DeliveryAddress>(
      `${API_BASE}/addresses/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        const idx = addrs.findIndex((a) => a.id === id);
        if (idx !== -1) {
          addrs[idx] = { ...addrs[idx], ...data };
          setLocal(STORAGE_KEYS.ADDRESSES, addrs);
          return addrs[idx];
        }
        return data as DeliveryAddress;
      }
    );
  },

  async deleteAddress(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/addresses/${id}`,
      { method: 'DELETE' },
      () => {
        let addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        addrs = addrs.filter((a) => a.id !== id);
        setLocal(STORAGE_KEYS.ADDRESSES, addrs);
        return { success: true };
      }
    );
  }
};
