import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const VendorOrdersView: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dispatch Note Form State
  const [dispatchRider, setDispatchRider] = useState('');
  const [trackingNote, setTrackingNote] = useState('');

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorOrders(vendorId);
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [vendorId]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, customNote?: string) => {
    try {
      const note = customNote || `Status updated to ${newStatus} by merchant (${user?.vendorStoreName || 'Vendor'})`;
      await api.updateOrderStatus(orderId, newStatus, note);
      showToast('success', 'Order Updated', `Order status changed to ${newStatus}.`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
    } catch {
      showToast('error', 'Error', 'Failed to update order status.');
    }
  };

  const handleSaveDispatchInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const note = `Dispatch Assigned: Rider ${dispatchRider || 'Standard Courier'}. Tracking Ref: ${trackingNote || 'EXP-GH-' + selectedOrder.orderNumber.slice(-4)}`;
    handleUpdateStatus(selectedOrder.id, 'Shipped', note);
    showToast('success', 'Dispatch Recorded', 'Dispatch rider details assigned to this order.');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Orders &amp; Dispatch ({orders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage buyer purchases of your catalog items, assign couriers, and track fulfillment.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, buyer name, phone, or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
        >
          <option value="all">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total (GH₵)</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading your seller orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900 dark:text-white font-mono">{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                      <p className="text-[11px] text-slate-500">{order.customerPhone}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 truncate max-w-[140px]">
                          {order.items.map((i) => i.productName).join(', ')}
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-hidden cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDispatchRider('');
                          setTrackingNote('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Dispatch Slip */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 text-xs"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-slate-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Coordinates */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Buyer &amp; Delivery Destination</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <span className="font-semibold">Recipient:</span> {selectedOrder.customerName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </p>
                  <p className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {selectedOrder.deliveryAddress?.address}, {selectedOrder.deliveryAddress?.city},{' '}
                      {selectedOrder.deliveryAddress?.region}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Purchased Items</p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Dispatch Rider Box */}
              <form onSubmit={handleSaveDispatchInfo} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Assign Courier / Dispatch Rider</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Rider Name &amp; Phone
                    </label>
                    <input
                      type="text"
                      value={dispatchRider}
                      onChange={(e) => setDispatchRider(e.target.value)}
                      placeholder="e.g. Yaw (0244123456)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Tracking Code / Note
                    </label>
                    <input
                      type="text"
                      value={trackingNote}
                      onChange={(e) => setTrackingNote(e.target.value)}
                      placeholder="e.g. On delivery route East Legon"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Mark as Shipped with Rider</span>
                  </button>
                </div>
              </form>

              {/* Order Pricing Total */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between font-black text-sm">
                <span>Order Total</span>
                <span className="text-amber-600 dark:text-amber-400">{formatPrice(selectedOrder.total)}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
