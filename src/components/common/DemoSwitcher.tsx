import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, ShieldCheck, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DemoSwitcherProps {
  onNavigateToAdmin?: () => void;
  onNavigateToCustomer?: () => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({ onNavigateToAdmin, onNavigateToCustomer }) => {
  const { user, isAdmin, switchDemoRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left z-40">
      <button
        id="btn-demo-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Demo: {user ? (isAdmin ? 'Admin (Kwame)' : 'Customer (Abena)') : 'Guest'}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">1-Click Test Drive</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch persona instantly:</p>
              </div>

              <div className="space-y-1">
                <button
                  id="btn-switch-admin"
                  onClick={async () => {
                    await switchDemoRole('admin');
                    setIsOpen(false);
                    if (onNavigateToAdmin) onNavigateToAdmin();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                    isAdmin ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Store Admin</p>
                      <p className="text-[10px] text-slate-500">Kwame Mensah (Full Control)</p>
                    </div>
                  </div>
                  {isAdmin && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                <button
                  id="btn-switch-customer"
                  onClick={async () => {
                    await switchDemoRole('customer');
                    setIsOpen(false);
                    if (onNavigateToCustomer) onNavigateToCustomer();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                    user && !isAdmin ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Customer Account</p>
                      <p className="text-[10px] text-slate-500">Abena Osei (Orders & Reviews)</p>
                    </div>
                  </div>
                  {user && !isAdmin && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                {user && (
                  <button
                    id="btn-switch-guest"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4 ml-1.5" />
                    <span>Browse as Guest (Sign Out)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
