import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Phone,
  Truck,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Package,
  Clock,
  Tag,
  Check,
  Store,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Product, Order } from '../../types/index';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

interface MessageAction {
  type: 'add_to_cart' | 'track_order' | 'apply_coupon' | 'navigate';
  label: string;
  data?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
  orderInfo?: Order;
  couponCode?: string;
  timestamp: string;
  actionLinks?: { label: string; view: string; params?: any }[];
  actions?: MessageAction[];
}

interface NovaAICopilotProps {
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView?: (product: Product) => void;
}

// ----------------------------------------------------
// CLEAN RICH TEXT FORMATTER COMPONENT
// ----------------------------------------------------
const FormattedChatMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <p className="whitespace-pre-line text-xs font-medium leading-relaxed">{text}</p>;
  }

  // Parse inline styles (bold, code badges, tags)
  const parseInline = (content: string) => {
    // Clean up any remaining formatting artifacts
    const cleaned = content.replace(/^--+\s*/, '').replace(/--+$/, '');
    const parts = cleaned.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <span
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[11px]"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-100 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ### or ## or #
        if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4
              key={idx}
              className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-2.5 mb-1 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700/50 pb-1"
            >
              {parseInline(headerText)}
            </h4>
          );
        }

        // Bullet point (•, -, *)
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 text-xs">{parseInline(bulletContent)}</div>
            </div>
          );
        }

        // Numbered list item like 1. 2.
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-xs">{parseInline(numMatch[2])}</div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
};


export const NovaAICopilot: React.FC<NovaAICopilotProps> = ({ onNavigate, onOpenQuickView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { addToCart, setIsCartDrawerOpen, applyCoupon } = useCart();
  const { formatPrice, country, countryConfig } = useSettings();
  const { showToast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Hello! I'm **NovaAI**, your personal multi-task shopping assistant for **NovaMart ${country === 'NG' ? 'Nigeria 🇳🇬' : 'Ghana 🇬🇭'}**. 🌟\n\nI can:\n• 🛒 **Add products directly to your bag**\n• 📦 **Track your orders in real-time**\n• 🏷️ **Apply active discount codes**\n• ⚡ **Find the best deals & local warehouse stock**\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Load products and orders for AI lookup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          api.getProducts({ limit: 50 }),
          api.getOrders().catch(() => [])
        ]);
        if (prodRes?.products) setCatalogProducts(prodRes.products);
        if (Array.isArray(orderRes)) setRecentOrders(orderRes);
      } catch (e) {
        console.warn('Failed to load data for NovaAI', e);
      }
    };
    fetchData();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Voice Recognition (Speech-to-Text via Web Speech API)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('info', 'Voice Input', 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = country === 'NG' ? 'en-NG' : 'en-GH';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('info', 'Listening...', 'Speak your question or order request now.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Voice input failed', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech Audio Output
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown characters for cleaner speech
    const cleanText = text.replace(/[*#_`•]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const quickPrompts = [
    { label: '🛍️ About NovaMart', query: 'Tell me about this site' },
    { label: '🔥 Flash Deals', query: 'Show me the best flash sales and discounts' },
    { label: '🎁 Gift Finder', query: 'Recommend top gifts' },
    { label: '🏪 Become a Seller', query: 'How do I sell on NovaMart?' },
    { label: '✨ Scent Quiz', query: 'Help me find my signature perfume' },
    { label: '📦 Track Order', query: 'Where is my order?' },
    { label: '🏷️ Discount Code', query: 'Do you have any promo codes or coupons?' },
    { label: '🚚 Delivery & MoMo', query: `How fast is delivery and how do I pay with MoMo?` },
    { label: '📞 Hotline & Help', query: 'What is customer service contact number?' }
  ];

  // ----------------------------------------------------
  // INTELLIGENT MULTI-TASK AGENT EXECUTION ENGINE
  // ----------------------------------------------------
  const generateResponse = async (userQuery: string) => {
    setIsTyping(true);
    const q = userQuery.toLowerCase().trim();

    try {
      // 1. Check server Gemini AI endpoint first
      const serverRes = await api.chatWithAI(userQuery);
      if (serverRes && serverRes.text) {
        let actionLinks: { label: string; view: string; params?: any }[] = [];
        
        if (q.includes('about') || q.includes('site')) {
          actionLinks = [
            { label: '🔥 Today\'s Flash Deals', view: 'shop', params: { dealsOnly: true } },
            { label: '🏪 Become a Seller', view: 'become-seller' },
            { label: '🎁 Discovery Box', view: 'discovery-box' }
          ];
        } else if (q.includes('seller') || q.includes('vendor')) {
          actionLinks = [
            { label: '🚀 Open Seller Registration', view: 'become-seller' },
            { label: '🛍️ Browse Marketplace', view: 'shop' }
          ];
        } else if (q.includes('gift')) {
          actionLinks = [
            { label: '✨ Scent Quiz', view: 'scent-quiz' },
            { label: '🎁 Discovery Box', view: 'discovery-box' },
            { label: '🛍️ Shop Best Sellers', view: 'shop' }
          ];
        }

        const newAiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: serverRes.text,
          products: serverRes.products && serverRes.products.length > 0 ? serverRes.products : undefined,
          actionLinks: actionLinks.length > 0 ? actionLinks : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, newAiMessage]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      console.warn('AI chat endpoint fallback', e);
    }

    // Small delay for natural conversation feel
    await new Promise((r) => setTimeout(r, 450));

    let replyText = '';
    let matchingProducts: Product[] = [];
    let orderInfo: Order | undefined = undefined;
    let couponCode: string | undefined = undefined;
    let actionLinks: { label: string; view: string; params?: any }[] = [];

    // ==========================================
    // TASK 1: ABOUT THIS SITE / PLATFORM TOUR
    // ==========================================
    if (q.includes('about this site') || q.includes('about us') || q.includes('what is this site') || q.includes('tell me about this site') || q.includes('what is novamart') || q.includes('site tour') || q.includes('who are you')) {
      replyText = `Welcome to NovaMart!\n\nNovaMart is West Africa's premier multi-vendor online superstore and marketplace serving Ghana and Nigeria.\n\n### 🌟 What We Offer:\n• 📱 Tech & Phones: Apple, Samsung, Sony ANC audio, and gadgets.\n• 🍳 Home & Kitchen: Touchscreen air fryers, rechargeable juicers, power washers.\n• 👗 Fashion & Leather: Handcrafted cowhide belts, classic sneakers, and accessories.\n• ✨ Beauty & Niche Fragrances: Extrait de Parfum (MFK Baccarat Rouge 540) & travel atomizers.\n• 🏃 Health & Fitness: Digital arm BP monitors, snatch waist trainers.\n\n### 🛡️ Why Shop With Us?\n• 100% Authenticity Guarantee: Every single item is QC-inspected.\n• Express Nationwide Delivery: 24–48h delivery to Accra/Kumasi and Lagos/Abuja.\n• Flexible Payments: MTN MoMo, Telecel Cash, NIP Bank Transfer, Cards & Cash on Delivery.\n• 7-Day Hassle-Free Returns.`;
      actionLinks = [
        { label: '🔥 Today\'s Deals', view: 'shop', params: { dealsOnly: true } },
        { label: '🏪 Become a Seller', view: 'become-seller' },
        { label: '✨ Take Scent Quiz', view: 'scent-quiz' }
      ];
    }
    // ==========================================
    // TASK 2: PRODUCT COMPARISON ENGINE (VS / COMPARE)
    // ==========================================
    else if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('difference between')) {
      // Find candidate products
      let compA: Product | undefined;
      let compB: Product | undefined;

      if (q.includes('iphone') || q.includes('apple')) compA = catalogProducts.find(p => p.id === 'prod-iphone-15-pro');
      if (q.includes('samsung') || q.includes('galaxy')) compB = catalogProducts.find(p => p.id === 'prod-samsung-s24-ultra');
      if (q.includes('blender')) compA = compA || catalogProducts.find(p => p.id === 'prod-portable-blender');
      if (q.includes('air fryer') || q.includes('fryer')) compB = compB || catalogProducts.find(p => p.id === 'prod-air-fryer-8l');
      if (q.includes('sony') || q.includes('headphone')) compA = compA || catalogProducts.find(p => p.id === 'prod-sony-wh1000xm5');

      if (!compA) compA = catalogProducts[0];
      if (!compB) compB = catalogProducts[1] || catalogProducts[0];

      matchingProducts = [compA, compB];
      replyText = `⚖️ **Product Comparison Analysis:**\n\n1. **${compA.name}**\n• Price: **${formatPrice(compA.discountPrice || compA.price)}**\n• Rating: **${compA.rating} ★** (${compA.reviewCount} reviews)\n• Category: ${compA.categoryName}\n\n2. **${compB.name}**\n• Price: **${formatPrice(compB.discountPrice || compB.price)}**\n• Rating: **${compB.rating} ★** (${compB.reviewCount} reviews)\n• Category: ${compB.categoryName}\n\nBoth items are 100% genuine and covered by NovaMart's **7-Day Quality Guarantee**.`;
      actionLinks = [
        { label: `View ${compA.brand}`, view: 'product-detail', params: { productId: compA.id } },
        { label: `View ${compB.brand}`, view: 'product-detail', params: { productId: compB.id } }
      ];
    }
    // ==========================================
    // TASK 3: DIRECT CART & CHECKOUT CONTROLS
    // ==========================================
    else if (q.includes('checkout') || q.includes('proceed to checkout') || q.includes('pay now')) {
      replyText = `⚡ Ready to complete your order? Click below to proceed directly to our secure Mobile Money and Card checkout!`;
      actionLinks = [{ label: '⚡ Go to Checkout', view: 'checkout' }, { label: '🛍️ View Bag', view: 'cart' }];
    }
    else if (q.includes('clear cart') || q.includes('empty cart') || q.includes('remove all items')) {
      replyText = `🗑️ Your shopping bag can be managed directly in the Cart drawer. Click below to review or remove items:`;
      actionLinks = [{ label: 'Open Cart Drawer', view: 'cart' }];
    }
    // ==========================================
    // TASK 4: CATEGORY / DEPARTMENT BROWSING
    // ==========================================
    else if (q.includes('phone') || q.includes('smartphone') || q.includes('iphone') || q.includes('samsung') || q.includes('tablet')) {
      const prods = catalogProducts.filter(p => p.categoryId === 'cat-phones');
      matchingProducts = prods.length > 0 ? prods : catalogProducts.slice(0, 2);
      replyText = `📱 **Smartphones & Flagship Devices:**\n\nExplore genuine Apple iPhone and Samsung Galaxy flagships with official warranty and fast delivery across Ghana & Nigeria.`;
      actionLinks = [{ label: 'Browse All Phones', view: 'shop', params: { category: 'cat-phones' } }];
    }
    else if (q.includes('electronic') || q.includes('audio') || q.includes('headphone') || q.includes('sony') || q.includes('speaker')) {
      const prods = catalogProducts.filter(p => p.categoryId === 'cat-electronics');
      matchingProducts = prods.length > 0 ? prods : catalogProducts.slice(0, 2);
      replyText = `🎧 **Electronics & Audio Gear:**\n\nCheck out industry-leading noise cancelling headphones, Hi-Res wireless audio, and home gadgets.`;
      actionLinks = [{ label: 'Browse Electronics', view: 'shop', params: { category: 'cat-electronics' } }];
    }
    else if (q.includes('kitchen') || q.includes('appliance') || q.includes('blender') || q.includes('air fryer') || q.includes('washer')) {
      const prods = catalogProducts.filter(p => p.categoryId === 'cat-appliances');
      matchingProducts = prods.length > 0 ? prods : catalogProducts.slice(0, 2);
      replyText = `🍳 **Home & Kitchen Appliances:**\n\nUpgrade your lifestyle with digital touchscreen air fryers, portable USB blenders, and heavy duty power washers.`;
      actionLinks = [{ label: 'Browse Kitchen & Home', view: 'shop', params: { category: 'cat-appliances' } }];
    }
    else if (q.includes('fashion') || q.includes('leather') || q.includes('belt') || q.includes('shoe') || q.includes('sneaker') || q.includes('nike')) {
      const prods = catalogProducts.filter(p => p.categoryId === 'cat-fashion');
      matchingProducts = prods.length > 0 ? prods : catalogProducts.slice(0, 2);
      replyText = `👗 **Fashion & Leather Goods:**\n\nShop 100% full-grain leather belts, classic sneakers, and premium accessories.`;
      actionLinks = [{ label: 'Browse Fashion', view: 'shop', params: { category: 'cat-fashion' } }];
    }
    else if (q.includes('health') || q.includes('fitness') || q.includes('blood pressure') || q.includes('waist trainer') || q.includes('tummy')) {
      const prods = catalogProducts.filter(p => p.categoryId === 'cat-health');
      matchingProducts = prods.length > 0 ? prods : catalogProducts.slice(0, 2);
      replyText = `🏃 **Health & Wellness Essentials:**\n\nStay on top of your vitality with automatic voice blood pressure monitors and seamless sweat wraps.`;
      actionLinks = [{ label: 'Browse Health & Fitness', view: 'shop', params: { category: 'cat-health' } }];
    }
    // ==========================================
    // TASK 5: LOYALTY POINTS & VIP TIERS
    // ==========================================
    else if (q.includes('loyalty') || q.includes('point') || q.includes('reward') || q.includes('vip') || q.includes('tier') || q.includes('diamond')) {
      replyText = `👑 **NovaMart VIP Rewards Program:**\n\n• **Earn Points**: Get **2 points for every ₵1 spent** on all orders.\n• **Redeem Discounts**: 100 points = **₵10 instant cash discount** at checkout.\n• **VIP Tiers**: Unlock Gold, Platinum, and Diamond Privé status with exclusive perks, express delivery vouchers, and dedicated priority concierge.`;
      actionLinks = [
        { label: '👑 View My VIP Tier & Points', view: 'account', params: { tab: 'loyalty' } }
      ];
    }
    // ==========================================
    // TASK 6: WISHLIST & SAVED ITEMS
    // ==========================================
    else if (q.includes('wishlist') || q.includes('saved item') || q.includes('favorite') || q.includes('save for later')) {
      replyText = `❤️ **My Saved Wishlist:**\n\nAccess your curated wishlist anytime, share with friends, or move saved items directly to your shopping bag with 1 click!`;
      actionLinks = [
        { label: '❤️ Open My Wishlist', view: 'wishlist' }
      ];
    }
    // ==========================================
    // TASK 7: GREETINGS & IDENTITY
    // ==========================================
    else if (['hi', 'hello', 'hey', 'hey there', 'good morning', 'good afternoon', 'good evening', 'how are you', 'whats up', 'yo'].includes(q)) {
      replyText = `Hello there! 👋 Welcome to **NovaMart ${countryConfig.name}**.\n\nI'm your personal shopping assistant. How can I help you today?\n\nI can:\n• 🔍 Find products & flash deals\n• ⚖️ Compare products side-by-side\n• 🛒 Add items directly to your shopping bag\n• 📦 Track your orders in real-time\n• 🏷️ Apply the **\`WELCOME10\`** discount coupon\n• 🚚 Explain delivery & payment options\n\nWhat are you looking for today?`;
      actionLinks = [
        { label: '🔥 Flash Deals', view: 'shop', params: { dealsOnly: true } },
        { label: '🏷️ 10% Discount Code', view: 'shop' },
        { label: '📦 Track My Order', view: 'track-order' }
      ];
    }
    // ==========================================
    // TASK 8: BECOME A SELLER / VENDOR
    // ==========================================
    else if (q.includes('seller') || q.includes('vendor') || q.includes('sell on') || q.includes('merchant') || q.includes('open store')) {
      replyText = `🏪 **Sell on NovaMart Marketplace!**\n\nJoin verified merchants reaching 50,000+ shoppers across Ghana and Nigeria.\n\n• **Zero Setup Fee**: Launch your storefront in under 5 minutes.\n• **Integrated Logistics**: We handle rider dispatch and nationwide delivery.\n• **Fast Payouts**: Automated weekly payouts to your MoMo or Bank Account.\n• **Vendor Dashboard**: Real-time sales analytics and stock manager.`;
      actionLinks = [
        { label: '🚀 Register as a Seller', view: 'become-seller' }
      ];
    }
    // ==========================================
    // TASK 9: SCENT / PERFUME QUIZ
    // ==========================================
    else if (q.includes('scent') || q.includes('perfume') || q.includes('fragrance') || q.includes('baccarat') || q.includes('cologne')) {
      const perfumes = catalogProducts.filter(p => p.categoryId === 'cat-beauty');
      matchingProducts = perfumes.length > 0 ? perfumes : catalogProducts.slice(0, 2);
      replyText = `✨ **Niche Fragrance Concierge:**\n\nDiscover signature scents crafted in Paris and Dubai. You can take our interactive Scent Profile Quiz to find the perfect notes for your personality!`;
      actionLinks = [
        { label: '✨ Launch Scent Quiz', view: 'scent-quiz' },
        { label: '🎁 Discovery Box Subscription', view: 'discovery-box' }
      ];
    }
    // ==========================================
    // TASK 10: GIFTS & CURATED RECOMMENDATIONS
    // ==========================================
    else if (q.includes('gift') || q.includes('recommend') || q.includes('present') || q.includes('birthday') || q.includes('wedding')) {
      const giftItems = catalogProducts.filter(p => ['prod-baccarat-rouge-540', 'prod-sony-wh1000xm5', 'prod-leather-belts', 'prod-portable-blender'].includes(p.id));
      matchingProducts = giftItems.length > 0 ? giftItems : catalogProducts.slice(0, 3);
      replyText = `🎁 **Curated Gift Recommendations:**\n\nHere are top-rated gifts guaranteed to delight:\n• 🌟 **Baccarat Rouge 540 Extrait**: Luxury ambergris & jasmine perfume.\n• 🎧 **Sony WH-1000XM5**: Industry-leading active noise cancellation.\n• 👔 **Genuine Leather 3-Belt Set**: Handcrafted full-grain leather in gift box.\n• 🥤 **Portable USB Blender**: Healthy smoothies anywhere.`;
      actionLinks = [
        { label: '🎁 Explore Discovery Box', view: 'discovery-box' },
        { label: '🛍️ Shop Best Sellers', view: 'shop' }
      ];
    }
    // ==========================================
    // TASK 11: DIRECT ADD TO CART EXECUTION
    // ==========================================
    else if (q.includes('add') || q.includes('buy') || q.includes('put in bag') || q.includes('purchase')) {
      const keywords = q.replace(/(add|to|my|cart|bag|please|buy|the|order|purchase)/g, '').trim().split(' ').filter(w => w.length > 2);
      const matched = catalogProducts.find(p => {
        const text = `${p.name} ${p.categoryName} ${p.brand}`.toLowerCase();
        return keywords.some(k => text.includes(k));
      }) || catalogProducts[0];

      if (matched) {
        addToCart(matched, undefined, 1);
        matchingProducts = [matched];
        replyText = `🎉 **Done!** I've added **${matched.name}** to your shopping bag.\n\nPrice: **${formatPrice(matched.discountPrice || matched.price)}**\n\nYou can continue shopping or proceed directly to checkout.`;
        actionLinks = [
          { label: '⚡ Proceed to Checkout', view: 'checkout' },
          { label: '🛍️ View Bag', view: 'cart' }
        ];
      }
    }
    // ==========================================
    // TASK 12: ORDER TRACKING LOOKUP
    // ==========================================
    else if (q.includes('track') || q.includes('where is my') || q.includes('status') || q.includes('parcel')) {
      const orderMatch = q.match(/ord-?[a-z0-9]+/i) || q.match(/\d{4,6}/);
      let foundOrder = recentOrders.find(o => 
        orderMatch && (o.id.toLowerCase().includes(orderMatch[0].toLowerCase()) || o.orderNumber.toLowerCase().includes(orderMatch[0].toLowerCase()))
      );

      if (!foundOrder && recentOrders.length > 0) foundOrder = recentOrders[0];

      if (foundOrder) {
        orderInfo = foundOrder;
        replyText = `📦 **Live Order Status Found:**\n\n• Order Number: **#${foundOrder.orderNumber}**\n• Status: **${(foundOrder.orderStatus || 'in_transit').toUpperCase().replace('_', ' ')}**\n• Total: **${formatPrice(foundOrder.total)}**\n• Dispatch Hub: **${country === 'NG' ? 'Ikeja Depot, Lagos Hub' : 'Airport City Hub, Accra'}**\n• Estimated Delivery: **${foundOrder.estimatedDelivery || '1–2 Business Days'}**`;
        actionLinks = [{ label: '🗺️ Open Full GPS Live Map', view: 'track-order', params: { orderNumber: foundOrder.orderNumber } }];
      } else {
        replyText = `📦 You can track any active order in real-time! Please enter your **Order Number** or click below:`;
        actionLinks = [{ label: 'Track Order with ID', view: 'track-order' }];
      }
    }
    // ==========================================
    // TASK 13: BUDGET / PRICE SEARCH
    // ==========================================
    else if (q.includes('under') || q.includes('budget') || q.includes('cheap') || q.includes('less than') || q.includes('below')) {
      const numMatch = q.match(/\d+/);
      const limit = numMatch ? Number(numMatch[0]) : 200;
      const budgetItems = catalogProducts.filter(p => (p.discountPrice || p.price) <= limit);
      matchingProducts = budgetItems.length > 0 ? budgetItems.slice(0, 3) : catalogProducts.slice(0, 3);
      replyText = `💰 **Budget Picks Under ${formatPrice(limit)}:**\n\nHere are top-rated products matching your price range:`;
      actionLinks = [{ label: 'Explore Budget Deals', view: 'shop', params: { dealsOnly: true } }];
    }
    // ==========================================
    // TASK 14: COUPONS & DISCOUNTS
    // ==========================================
    else if (q.includes('coupon') || q.includes('promo') || q.includes('discount code') || q.includes('voucher') || q.includes('save money')) {
      couponCode = 'WELCOME10';
      replyText = `🎁 **Active Store Coupon Available:**\n\nUse voucher code **\`WELCOME10\`** to receive **10% OFF** your entire order (Min order: ${country === 'NG' ? '₦15,000' : 'GH₵ 200'}).\n\nClick below to apply it to your cart right now! 👇`;
      actionLinks = [{ label: 'View Today\'s Flash Deals', view: 'shop', params: { dealsOnly: true } }];
    }
    // ==========================================
    // TASK 15: FLASH SALES & DEALS
    // ==========================================
    else if (q.includes('deal') || q.includes('discount') || q.includes('sale') || q.includes('flash')) {
      const deals = catalogProducts.filter((p) => p.discountPrice && p.discountPrice < p.price).slice(0, 3);
      matchingProducts = deals.length > 0 ? deals : catalogProducts.slice(0, 3);
      replyText = `🔥 Here are our top discounted flash deals today with instant savings up to **35%**:`;
      actionLinks = [{ label: 'Shop All Flash Deals', view: 'shop', params: { dealsOnly: true } }];
    }
    // ==========================================
    // TASK 16: SHIPPING & DELIVERY
    // ==========================================
    else if (q.includes('shipping') || q.includes('delivery') || q.includes('courier') || q.includes('how long') || q.includes('arrive') || q.includes('lagos') || q.includes('accra')) {
      if (country === 'NG') {
        replyText = `🇳🇬 **Nigeria Express Shipping Policy:**\n\n• **Lagos & Abuja Metro**: 1–2 Business Days (₦2,500 standard / Free over ₦50,000).\n• **Other States**: 2–4 Business Days via GIG Logistics / Verified Couriers.\n• **Same-Day Express**: Available in Ikeja & Lekki.\n• **Live Tracking**: SMS & GPS rider tracking provided.`;
      } else {
        replyText = `🇬🇭 **Ghana Express Shipping Policy:**\n\n• **Accra & Tema Metro**: 24–48 Hours (GH₵ 35 / Free over GH₵ 500).\n• **Regional Centers**: 1–3 Business Days (Kumasi, Takoradi, Sunyani, Tamale).\n• **Same-Day Dispatch**: Available in central Accra.\n• **Live Tracking**: Real-time SMS & Courier phone link.`;
      }
      actionLinks = [{ label: 'Track Parcel Status', view: 'track-order' }];
    }
    // ==========================================
    // TASK 17: PAYMENT METHODS & MOMO
    // ==========================================
    else if (q.includes('payment') || q.includes('pay') || q.includes('momo') || q.includes('bank transfer') || q.includes('card') || q.includes('cod') || q.includes('cash on delivery')) {
      if (country === 'NG') {
        replyText = `🇳🇬 **Supported Payment Channels (Nigeria):**\n\n1. **Direct NIP Bank Transfer**: Dedicated virtual accounts (Wema, GTBank, Providus).\n2. **Debit Cards**: Verve, Mastercard, Visa via secure Paystack.\n3. **OPay / PalmPay & USSD (*737#, *894#, etc.)**.\n4. **Cash On Delivery (COD)**: Available in Lagos & Abuja.`;
      } else {
        replyText = `🇬🇭 **Supported Payment Channels (Ghana):**\n\n1. **MTN Mobile Money & Telecel Cash**: Instant USSD push prompt approval.\n2. **Debit/Credit Cards**: Visa, Mastercard & GH-Link via Paystack.\n3. **Cash On Delivery (COD)**: Available in Accra & Kumasi.\n4. **NovaMart Gift Vouchers**.`;
      }
    }
    // ==========================================
    // TASK 18: RETURN & WARRANTY POLICY
    // ==========================================
    else if (q.includes('return') || q.includes('refund') || q.includes('warranty') || q.includes('authentic') || q.includes('fake') || q.includes('broken')) {
      replyText = `🛡️ **100% Authenticity & 7-Day Guarantee:**\n\n• All products sold on NovaMart are inspected and 100% brand genuine.\n• Enjoy a **7-day free return & replacement policy** if an item is damaged or differs from description.\n• Instant refunds are remitted directly to your MoMo or Bank Account upon item return.`;
      actionLinks = [{ label: 'Read Return Policy', view: 'returns' }];
    }
    // ==========================================
    // TASK 19: GENERAL SEARCH FALLBACK
    // ==========================================
    else {
      const stopWords = ['can', 'you', 'tell', 'me', 'about', 'this', 'site', 'show', 'the', 'what', 'are', 'is', 'a', 'an', 'in', 'for', 'with', 'and'];
      const keywords = q.split(' ').filter((w) => w.length > 2 && !stopWords.includes(w));
      const matches = keywords.length > 0 ? catalogProducts.filter((p) => {
        const text = `${p.name} ${p.description} ${p.categoryName} ${p.brand} ${(p.tags || []).join(' ')}`.toLowerCase();
        return keywords.some((k) => text.includes(k));
      }).slice(0, 3) : [];

      if (matches.length > 0) {
        matchingProducts = matches;
        replyText = `I found these products in our active store catalog matching your request:`;
      } else {
        replyText = `I'm here to help you shop! Here are top-rated products from our **${countryConfig.name}** inventory:`;
        matchingProducts = catalogProducts.filter((p) => (p.rating || 0) >= 4.5).slice(0, 3);
        actionLinks = [{ label: 'Explore Full Catalog', view: 'shop' }];
      }
    }


    const newAiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      products: matchingProducts.length > 0 ? matchingProducts : undefined,
      orderInfo: orderInfo,
      couponCode: couponCode,
      actionLinks: actionLinks.length > 0 ? actionLinks : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newAiMessage]);
    setIsTyping(false);
  };


  const handleSend = (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    generateResponse(textToSend);
  };

  return (
    <>
      {/* 1. Floating AI Trigger Button (Bottom Right) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40"
        >
          <div className="relative group">
            {/* Glowing ring animation */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

            <button
              id="btn-open-novaaicopilot"
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-full shadow-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all group-hover:scale-105 cursor-pointer"
            >
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="font-bold text-xs tracking-wide">Ask NovaAI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Floating AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[96vw] sm:w-[420px] h-[600px] max-h-[75vh] sm:max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Bot className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm">NovaAI Assistant</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {countryConfig.flag} {countryConfig.name} Market • 100% Free
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'msg-welcome',
                        sender: 'ai',
                        text: "Conversation cleared. How else can I assist you with your shopping today? ✨",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])
                  }
                  title="Clear conversation"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                    }`}
                  >
                    {/* Formatted Message Bubble Text */}
                    <FormattedChatMessage text={m.text} isUser={m.sender === 'user'} />

                    {/* AI Speech Voice Button */}
                    {m.sender === 'ai' && (
                      <div className="mt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => speakText(m.text)}
                          className="text-[10px] text-slate-400 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Listen to audio response"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                        </button>
                      </div>
                    )}

                    {/* 1. EMBEDDED INTERACTIVE PRODUCT CARDS */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        {m.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
                          >
                            <img
                              src={product.featuredImage || product.images?.[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-slate-800 shrink-0 cursor-pointer"
                              onClick={() => {
                                setIsOpen(false);
                                onNavigate('product-detail', { productId: product.id });
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <h5
                                onClick={() => {
                                  setIsOpen(false);
                                  onNavigate('product-detail', { productId: product.id });
                                }}
                                className="text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate cursor-pointer"
                              >
                                {product.name}
                              </h5>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {formatPrice(product.discountPrice || product.price)}
                                </span>
                                {product.originCity && (
                                  <span className="text-[9px] text-slate-400 truncate">
                                    • {product.originCity}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                addToCart(product, undefined, 1);
                                showToast('success', 'Added to Bag', `${product.name} added.`);
                                setIsCartDrawerOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm shrink-0 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                              title="Add to Cart directly"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. EMBEDDED LIVE ORDER TRACKING CARD */}
                    {m.orderInfo && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-900 text-white border border-slate-700/80 space-y-2 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-xs text-slate-100">Order #{m.orderInfo.orderNumber}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {(m.orderInfo.orderStatus || 'in_transit').replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                          <div>
                            <span className="text-slate-400 block">Hub:</span>
                            <span className="font-bold text-white">{country === 'NG' ? 'Ikeja Hub (Lagos)' : 'Airport City Hub (Accra)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Courier Rider:</span>
                            <span className="font-bold text-emerald-400">Kwame Mensah (Van #04)</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate('track-order');
                          }}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer mt-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View Live GPS Map & Rider Contact</span>
                        </button>
                      </div>
                    )}

                    {/* 3. EMBEDDED 1-CLICK COUPON APPLY CARD */}
                    {m.couponCode && (
                      <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-200">{m.couponCode}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                            10% OFF
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await applyCoupon(m.couponCode!);
                            if (ok) {
                              showToast('success', 'Coupon Applied! 🎉', `10% discount applied to your order.`);
                            }
                          }}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Apply Coupon to Bag</span>
                        </button>
                      </div>
                    )}

                    {/* Action Links */}
                    {m.actionLinks && m.actionLinks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                        {m.actionLinks.map((link, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setIsOpen(false);
                              if (link.view === 'scent-quiz') {
                                onNavigate('scent-quiz');
                              } else {
                                onNavigate(link.view, link.params);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          >
                            {link.label} <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse text-[11px]">NovaAI is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar with Voice Support */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
                title={isListening ? 'Stop listening' : 'Speak to NovaAI (Voice Shopping)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? 'Listening to voice...' : 'Ask to add to cart, track orders, coupons...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
