import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Sparkles, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryHint?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'shoes'>('men');
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

  const menClothing = [
    { size: 'S', chestCm: '88–96', waistCm: '73–81', hipsCm: '88–96', chestIn: '35–38', waistIn: '29–32', hipsIn: '35–38' },
    { size: 'M', chestCm: '96–104', waistCm: '81–89', hipsCm: '96–104', chestIn: '38–41', waistIn: '32–35', hipsIn: '38–41' },
    { size: 'L', chestCm: '104–112', waistCm: '89–97', hipsCm: '104–112', chestIn: '41–44', waistIn: '35–38', hipsIn: '41–44' },
    { size: 'XL', chestCm: '112–124', waistCm: '97–109', hipsCm: '112–120', chestIn: '44–49', waistIn: '38–43', hipsIn: '44–47' },
    { size: 'XXL', chestCm: '124–136', waistCm: '109–121', hipsCm: '120–128', chestIn: '49–54', waistIn: '43–48', hipsIn: '47–50' },
  ];

  const womenClothing = [
    { size: 'XS (UK 6)', bustCm: '78–82', waistCm: '60–64', hipsCm: '86–90', bustIn: '31–32', waistIn: '24–25', hipsIn: '34–35' },
    { size: 'S (UK 8-10)', bustCm: '82–90', waistCm: '64–72', hipsCm: '90–98', bustIn: '32–35', waistIn: '25–28', hipsIn: '35–39' },
    { size: 'M (UK 12-14)', bustCm: '90–98', waistCm: '72–80', hipsCm: '98–106', bustIn: '35–39', waistIn: '28–31', hipsIn: '39–42' },
    { size: 'L (UK 16)', bustCm: '98–106', waistCm: '80–88', hipsCm: '106–114', bustIn: '39–42', waistIn: '31–35', hipsIn: '42–45' },
    { size: 'XL (UK 18)', bustCm: '106–116', waistCm: '88–98', hipsCm: '114–124', bustIn: '42–46', waistIn: '35–39', hipsIn: '45–49' },
  ];

  const shoes = [
    { eu: '38', uk: '5', usMen: '5.5', usWomen: '7', cm: '24.0', in: '9.4' },
    { eu: '39', uk: '6', usMen: '6.5', usWomen: '8', cm: '24.5', in: '9.6' },
    { eu: '40', uk: '6.5', usMen: '7.5', usWomen: '9', cm: '25.5', in: '10.0' },
    { eu: '41', uk: '7.5', usMen: '8.5', usWomen: '10', cm: '26.0', in: '10.2' },
    { eu: '42', uk: '8', usMen: '9', usWomen: '10.5', cm: '27.0', in: '10.6' },
    { eu: '43', uk: '9', usMen: '10', usWomen: '11.5', cm: '27.5', in: '10.8' },
    { eu: '44', uk: '9.5', usMen: '10.5', usWomen: '12', cm: '28.5', in: '11.2' },
    { eu: '45', uk: '10.5', usMen: '11.5', usWomen: '13', cm: '29.5', in: '11.6' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Size & Fit Guide
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Accurate conversions for Ghana & Nigeria standards
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls: Tabs & Unit Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 my-5">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  onClick={() => setActiveTab('men')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'men'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Men's Apparel
                </button>
                <button
                  onClick={() => setActiveTab('women')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'women'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Women's Apparel
                </button>
                <button
                  onClick={() => setActiveTab('shoes')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'shoes'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Footwear
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    unit === 'cm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    unit === 'inches' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Inches
                </button>
              </div>
            </div>

            {/* Tables */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              {activeTab === 'men' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Size</th>
                      <th className="p-3">Chest ({unit.toUpperCase()})</th>
                      <th className="p-3">Waist ({unit.toUpperCase()})</th>
                      <th className="p-3">Hips ({unit.toUpperCase()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {menClothing.map((row) => (
                      <tr key={row.size} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.size}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.chestCm : row.chestIn}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.waistCm : row.waistIn}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.hipsCm : row.hipsIn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'women' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Size / Standard</th>
                      <th className="p-3">Bust ({unit.toUpperCase()})</th>
                      <th className="p-3">Waist ({unit.toUpperCase()})</th>
                      <th className="p-3">Hips ({unit.toUpperCase()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {womenClothing.map((row) => (
                      <tr key={row.size} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.size}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.bustCm : row.bustIn}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.waistCm : row.waistIn}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? row.hipsCm : row.hipsIn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'shoes' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">EU</th>
                      <th className="p-3">UK</th>
                      <th className="p-3">US Men</th>
                      <th className="p-3">US Women</th>
                      <th className="p-3">Foot Length ({unit.toUpperCase()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shoes.map((row) => (
                      <tr key={row.eu} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.eu}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.uk}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.usMen}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.usWomen}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit === 'cm' ? `${row.cm} cm` : `${row.in} in`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* How to Measure Tips */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                NovaMart Fit Guarantee:
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                If the size you order doesn't fit perfectly, enjoy free size exchanges within 7 days in Accra, Kumasi, Lagos, and Abuja.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
