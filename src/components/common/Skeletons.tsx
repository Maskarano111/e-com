/**
 * NovaMart Loading Skeletons
 * Beautiful shimmer placeholders for every data-loading state in the app.
 * Uses the .skeleton utility defined in index.css
 */

import React from 'react';

// ── Base shimmer atom ─────────────────────────────────────────────────────────
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

// ══════════════════════════════════════════════════════════════════════════════
// STOREFRONT SKELETONS
// ══════════════════════════════════════════════════════════════════════════════

/** Full-width hero banner skeleton */
export const HeroSkeleton: React.FC = () => (
  <div className="w-full rounded-3xl overflow-hidden">
    <Shimmer className="h-64 sm:h-80 lg:h-[460px] rounded-3xl" />
    <div className="mt-4 flex gap-2 justify-center">
      {[...Array(4)].map((_, i) => (
        <Shimmer key={i} className="w-2 h-2 rounded-full" />
      ))}
    </div>
  </div>
);

/** Single product card skeleton (matches ProductCard layout) */
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
    <Shimmer className="h-48 w-full rounded-2xl" />
    <div className="space-y-2 pt-1">
      <Shimmer className="h-3 w-1/3 rounded-full" />
      <Shimmer className="h-4 w-3/4 rounded-full" />
      <Shimmer className="h-3 w-1/2 rounded-full" />
      <div className="flex items-center justify-between pt-2">
        <Shimmer className="h-5 w-1/3 rounded-full" />
        <Shimmer className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  </div>
);

/** Grid of product card skeletons */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Horizontal product row skeleton (for "Top Picks" / flash sales) */
export const ProductRowSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="flex gap-4 overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="min-w-[180px] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 p-3 space-y-2">
        <Shimmer className="h-36 w-full rounded-2xl" />
        <Shimmer className="h-3 w-2/3 rounded-full" />
        <Shimmer className="h-4 w-full rounded-full" />
        <Shimmer className="h-5 w-1/2 rounded-full" />
      </div>
    ))}
  </div>
);

/** Product detail page skeleton */
export const ProductDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
    {/* Images */}
    <div className="space-y-3">
      <Shimmer className="h-96 w-full rounded-3xl" />
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-20 w-20 rounded-2xl" />
        ))}
      </div>
    </div>
    {/* Info */}
    <div className="space-y-4 pt-2">
      <Shimmer className="h-3 w-1/4 rounded-full" />
      <Shimmer className="h-7 w-3/4 rounded-full" />
      <Shimmer className="h-5 w-1/3 rounded-full" />
      <div className="space-y-2">
        <Shimmer className="h-3 w-full rounded-full" />
        <Shimmer className="h-3 w-5/6 rounded-full" />
        <Shimmer className="h-3 w-4/6 rounded-full" />
      </div>
      <Shimmer className="h-12 w-full rounded-2xl" />
      <Shimmer className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN / VENDOR SHARED SKELETONS
// ══════════════════════════════════════════════════════════════════════════════

/** Dashboard KPI stat card skeleton */
export const StatCardSkeleton: React.FC = () => (
  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
    <div className="flex items-center justify-between">
      <Shimmer className="h-3 w-1/3 rounded-full" />
      <Shimmer className="h-9 w-9 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-2/3 rounded-full" />
    <Shimmer className="h-3 w-1/2 rounded-full" />
  </div>
);

/** Row of 4 stat card skeletons */
export const StatsRowSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {[...Array(count)].map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

/** Single data table row skeleton */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <Shimmer className={`h-3.5 rounded-full ${i === 0 ? 'w-24' : i === 1 ? 'w-32' : 'w-16'}`} />
      </td>
    ))}
  </tr>
);

/** Full table skeleton */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 8, cols = 6 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
    {/* Table header */}
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-6">
      {[...Array(cols)].map((_, i) => (
        <Shimmer key={i} className={`h-3 rounded-full ${i === 0 ? 'w-20' : 'w-14'}`} />
      ))}
    </div>
    <table className="w-full">
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

/** Order row skeleton (matches order list in admin/vendor) */
export const OrderRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
    <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Shimmer className="h-4 w-32 rounded-full" />
      <Shimmer className="h-3 w-48 rounded-full" />
    </div>
    <Shimmer className="h-6 w-24 rounded-full hidden sm:block" />
    <Shimmer className="h-6 w-16 rounded-full" />
    <Shimmer className="h-8 w-8 rounded-xl" />
  </div>
);

/** List of order row skeletons */
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
    {[...Array(count)].map((_, i) => (
      <OrderRowSkeleton key={i} />
    ))}
  </div>
);

/** Full admin/vendor overview dashboard skeleton */
export const DashboardSkeleton: React.FC<{ statCount?: number }> = ({ statCount = 4 }) => (
  <div className="space-y-6">
    {/* Welcome banner */}
    <Shimmer className="h-36 w-full rounded-3xl" />
    {/* Stat cards */}
    <StatsRowSkeleton count={statCount} />
    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Shimmer className="h-72 w-full rounded-3xl" />
      </div>
      <Shimmer className="h-72 w-full rounded-3xl" />
    </div>
    {/* Orders table */}
    <OrderListSkeleton count={5} />
  </div>
);

/** Full generic page loading skeleton */
export const PageSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
    {title && (
      <div className="space-y-2">
        <Shimmer className="h-8 w-48 rounded-full" />
        <Shimmer className="h-4 w-72 rounded-full" />
      </div>
    )}
    <StatsRowSkeleton count={4} />
    <TableSkeleton rows={6} cols={5} />
  </div>
);

/** Cart item skeleton */
export const CartItemSkeleton: React.FC = () => (
  <div className="flex gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
    <Shimmer className="h-20 w-20 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <Shimmer className="h-3 w-1/3 rounded-full" />
      <Shimmer className="h-4 w-2/3 rounded-full" />
      <Shimmer className="h-3 w-1/4 rounded-full" />
      <div className="flex items-center justify-between pt-2">
        <Shimmer className="h-9 w-24 rounded-xl" />
        <Shimmer className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);
