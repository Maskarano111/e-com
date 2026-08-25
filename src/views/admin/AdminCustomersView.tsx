import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { User, Order } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';

export const AdminCustomersView: React.FC = () => {
  const { formatPrice } = useSettings();
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.getAdminCustomers(),
          api.getOrders()
        ]);
        setCustomers(usersRes);
        setOrders(ordersRes);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getCustomerStats = (userId: string) => {
    const userOrders = orders.filter((o) => o.userId === userId);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      orderCount: userOrders.length,
      totalSpent
    };
  };

  const filteredCustomers = customers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Directory ({customers.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered shopper profiles, lifetime order history, and contact coordinates
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((u) => {
                const stats = getCustomerStats(u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${u.firstName}`}
                          alt={u.firstName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.phone || '+233 24 555 0199'}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        u.role === 'admin' || u.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {stats.orderCount} orders
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-600">
                      {formatPrice(stats.totalSpent)}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
