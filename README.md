# 🛒 NovaMart — Premier Online Superstore & Marketplace

NovaMart is a full-featured, responsive multi-vendor e-commerce platform and administrative management suite tailored for modern online retail with localized support for African and global commerce (including Ghanaian Cedis `GH₵`, Mobile Money checkout, and WhatsApp order routing).

---

## ✨ Features & Capabilities

### 🛍️ Customer Experience
- **Dynamic Storefront**: Curated hero showcases, flash deals, trending categories, top-rated products, and brand spotlights.
- **Intelligent Search & Filtering**: Multi-faceted filter system by category, sub-category, brand, price range, rating, and stock status.
- **Signature Scent Concierge**: Interactive 4-step fragrance recommendation quiz matching notes, occasions, sillage, and gender profiles to curated perfumes.
- **Custom Discovery Box**: Interactive luxury fragrance bundle builder allowing customers to curate bespoke 3-piece or 5-piece 10ml travel spray decant boxes.
- **Side-by-Side Product Comparison**: Real-time floating compare dock and matrix comparison analyzing specifications, prices, and ratings across products.
- **Nova AI Shopping Copilot**: Intelligent conversational shopping assistant that helps shoppers find products, answer specifications, and track deliveries.
- **Cart & Slide-over Drawer**: Real-time quantity management, coupon code verification, multiple delivery options (Standard, Express, Store Pickup), and tax/fee calculation.
- **Multi-method Checkout**: Mobile Money (MTN MoMo, Telecel Cash, AT Money), Card payments, and Cash on Delivery with localized validation.

### 🏢 Vendor & Merchant Hub
- **Self-service Vendor Registration**: Onboarding flow for local merchants with store setup, commission rates, and payout management.
- **Vendor Dashboard**: Real-time analytics, inventory management, order tracking, and earnings reports.

### ⚙️ Administrative Suite
- **Management Console**: Comprehensive admin controls for orders, products, inventory thresholds, vendors, coupons, customer accounts, and site settings.
- **Real-time Configuration**: Dynamic control over delivery fees, free delivery thresholds, tax rates, and currency formatting.

---

## 🏗️ Architecture & Clean Code Standards

- **Type-Safe Routing**: Unified `NavigationParams` discriminated union and `useAppNavigation` hook decoupling view logic from presentation components.
- **Modular Provider Pipeline**: Clean `AppProviders` composition wrapper preventing deep context tree nesting and unneeded re-renders.
- **Performance Optimized Cart**: `CartContext` featuring memoized derived calculations (`useMemo`) and functional state dispatch (`useCallback`).
- **Accessible UI & Modals**: Keyboard accessibility (`Escape` dismissal, focus trapping), background scroll lock, and ARIA dialog semantics across modals.
- **Motion & Responsive Design**: Smooth page and drawer transitions powered by `motion/react` with dark mode support.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Maskarano111/e-com.git
   cd novamart-e-commerce-&-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler / Tooling** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + CSS Modules |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **AI Integration** | Google Gemini API (`@google/genai`) |

---

## 🧪 Quality & Verification

Run the TypeScript compiler to ensure strict type safety across the entire repository:
```bash
node node_modules/typescript/bin/tsc --noEmit
```
*(Status: **0 errors** across all components, contexts, and views)*

---

## 📁 Project Structure

```
novamart-e-commerce-&-admin/
├── src/
│   ├── components/
│   │   ├── common/           # CartDrawer, ScentQuizModal, CompareModal, Navbar, Footer...
│   │   ├── admin/            # Admin dashboard components and tables
│   │   ├── vendor/           # Vendor store and product management components
│   │   └── AppProviders.tsx  # Composed context provider pipeline
│   ├── context/              # CartContext, AuthContext, SettingsContext, ToastContext...
│   ├── hooks/                # useAppNavigation, custom hooks
│   ├── services/             # API services and mock database layer
│   ├── types/                # Strict TypeScript interfaces and navigation unions
│   ├── views/                # Full-page views (Shop, Checkout, DiscoveryBox, ProductDetail...)
│   ├── App.tsx               # Clean root application entry
│   └── main.tsx              # React DOM mounting
├── package.json
└── vite.config.ts
```

---

## 📄 License
This project is proprietary and confidential. Developed for NovaMart Ghana.
