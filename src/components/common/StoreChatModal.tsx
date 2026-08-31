import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  Store,
  ShieldCheck,
  CheckCheck,
  Clock,
  Sparkles,
  Phone,
  Paperclip,
  Smile
} from 'lucide-react';
import { Vendor, Product } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'vendor';
  text: string;
  timestamp: string;
}

interface StoreChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  product?: Product | null;
}

export const StoreChatModal: React.FC<StoreChatModalProps> = ({
  isOpen,
  onClose,
  vendor,
  product
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened
  useEffect(() => {
    if (isOpen && vendor) {
      const initialMsgs: ChatMessage[] = [
        {
          id: 'msg-1',
          sender: 'vendor',
          text: `Hello ${user ? user.firstName : 'there'}! Welcome to ${vendor.storeName}. How can we assist you today?`,
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      if (product) {
        initialMsgs.push({
          id: 'msg-2',
          sender: 'vendor',
          text: `Are you inquiring about "${product.name}"? We currently have it in stock with official warranty coverage!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      setMessages(initialMsgs);
    }
  }, [isOpen, vendor, product, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !vendor) return null;

  const handleSendMessage = (textToSend?: string) => {
    const msg = (textToSend || inputMessage).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic vendor automated response
    setTimeout(() => {
      let replyText = `Thanks for reaching out! A representative from ${vendor.storeName} is reviewing your question and will reply shortly.`;

      const lower = msg.toLowerCase();
      if (lower.includes('discount') || lower.includes('coupon') || lower.includes('price')) {
        replyText = `We are currently offering free express shipping and you can apply voucher code "WELCOME10" at checkout for 10% off!`;
      } else if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('time')) {
        replyText = `Deliveries within ${vendor.city || 'central metro'} take 24–48 hours via our express dispatch courier network.`;
      } else if (lower.includes('warranty') || lower.includes('authentic') || lower.includes('original')) {
        replyText = `All items sold by ${vendor.storeName} are 100% brand new, authentic, and covered by NovaMart's 7-day satisfaction replacement policy.`;
      }

      const vendorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'vendor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, vendorMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const quickPrompts = [
    'Is this in stock for immediate delivery?',
    'What warranty comes with this item?',
    'Can I get a discount for multiple units?',
    'How fast is shipping to my location?'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full h-[600px] shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={vendor.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                  alt={vendor.storeName}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-500/40"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">{vendor.storeName}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Typical reply under 5 mins</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${(vendor.phone || '233248881234').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Switch to WhatsApp"
                className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Banner context (if opened from a product) */}
          {product && (
            <div className="p-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={product.featuredImage} alt={product.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white truncate">{product.name}</span>
              </div>
              <span className="font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                Inquiring Item
              </span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                End-to-End Encrypted Customer Support
              </span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'customer'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{m.timestamp}</span>
                  {m.sender === 'customer' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium">{vendor.storeName} is typing</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message to merchant..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
