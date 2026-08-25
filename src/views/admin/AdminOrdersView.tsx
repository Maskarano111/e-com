import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  Printer,
  Copy,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { generateOrderInvoicePDF } from '../../utils/pdfGenerator';

const STATUS_LIST: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'Order Placed', label: 'Order Placed' },
  { id: 'Payment Confirmed', label: 'Payment Confirmed' },
  { id: 'Processing', label: 'Processing' },
  { id: 'Packed', label: 'Packed' },
  { id: 'Shipped', label: 'Shipped' },
  { id: 'Out for Delivery', label: 'Out for Delivery' },
  { id: 'Delivered', label: 'Delivered' },
  { id: 'Cancelled', label: 'Cancelled' }
];

export const AdminOrdersView: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Order Placed');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenOrder = (o: Order) => {
    setSelectedOrder(o);
    setNewStatus(o.orderStatus);
    setTrackingNumber(o.trackingNumber || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res: any = await api.updateOrderStatus(selectedOrder.id, newStatus, trackingNumber);
      const updatedOrder = res.order || res;
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);

      // Auto dispatch SMS to customer on status update
      if (selectedOrder.customerPhone) {
        api.sendOrderSMS({
          phone: selectedOrder.customerPhone,
          message: `NovaMart Update: Your order #${selectedOrder.orderNumber} is now ${newStatus}. Tracking Code: ${trackingNumber || selectedOrder.trackingNumber || 'Assigned'}`,
          orderNumber: selectedOrder.orderNumber,
          type: 'status_update'
        }).catch(console.warn);
      }

      showToast('success', 'Order Updated & Customer Notified', `Order #${updatedOrder.orderNumber} set to ${newStatus}.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportOrdersCSV = () => {
    if (!orders.length) {
      showToast('error', 'No Orders', 'There are no orders to export.');
      return;
    }
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'Items Count', 'Subtotal', 'Delivery Fee', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Tracking Number'];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      o.items?.length || 0,
      o.subtotal,
      o.deliveryFee,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.trackingNumber || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaMart_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Orders Exported', 'Downloaded NovaMart Orders CSV file.');
  };

  const handleDownloadWaybill = (order: Order) => {
    try {
      generateOrderInvoicePDF(order);
      showToast('success', 'Waybill Generated', `Waybill & Tax Invoice for #${order.orderNumber} generated.`);
    } catch (err) {
      showToast('error', 'Generation Failed', 'Could not generate PDF waybill.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Orders & Dispatch ({orders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track fulfillment, update status, assign rider tracking codes, and print packing slips
          </p>
        </div>

        <button
          onClick={handleExportOrdersCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Export Orders (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, or Email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_LIST.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items / Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">#{o.orderNumber}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{o.customerName}</p>
                    <p className="text-[10px] text-slate-400">{o.deliveryAddress?.city || 'Accra'}, {o.deliveryAddress?.region || 'Greater Accra'}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-black text-slate-900 dark:text-white">{formatPrice(o.total)}</p>
                    <p className="text-[10px] text-slate-400">{o.items.length} items</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      o.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {o.paymentStatus} ({o.paymentMethod})
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      o.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : o.orderStatus === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {o.orderStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenOrder(o)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Management & Packing Slip Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadWaybill(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    title="Generate PDF Waybill & Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Waybill</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Print Invoice"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedOrder(null)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 space-y-3 text-xs">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-200">
                  Update Fulfillment & Tracking
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Payment Confirmed">Payment Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Courier Tracking Code:</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. GH-TRK-77402"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                  >
                    {isUpdating ? 'Saving...' : 'Apply Status Update'}
                  </button>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Shipping Address</span>
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.deliveryAddress?.name || selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.deliveryAddress?.address}</p>
                  <p className="text-slate-500">{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.region} Region</p>
                  <p className="text-slate-500">Contact: {selectedOrder.deliveryAddress?.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dispatch Info</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 capitalize">Method: {selectedOrder.deliveryMethod}</p>
                  <p className="text-slate-700 dark:text-slate-300 capitalize">Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                  <p className="text-slate-500">Email: {selectedOrder.customerEmail}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Order Line Items</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{it.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {it.quantity} • {formatPrice(it.price)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
