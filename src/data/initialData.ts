import { Product, Category, Banner, Coupon, Vendor } from '../types/index';

export const initialCategories: Category[] = [
  {
    id: 'cat-phones',
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    description: 'Smartphones, Tablets, Smartwatches, Power Banks & Mobile Accessories',
    productCount: 42,
    featured: true
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    description: 'Wireless Earbuds, Headphones, Bluetooth Speakers, Smart TVs & Cameras',
    productCount: 38,
    featured: true
  },
  {
    id: 'cat-appliances',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    description: 'Portable Blenders, Air Fryers, Pressure Washers, Microwaves & Cleaning Tools',
    productCount: 29,
    featured: true
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Shoes',
    slug: 'fashion-shoes',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    description: 'Men & Women Clothing, Sneakers, Leather Belts, Handbags, Watches & Sunglasses',
    productCount: 56,
    featured: true
  },
  {
    id: 'cat-health',
    name: 'Health & Fitness',
    slug: 'health-fitness',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    description: 'Digital Blood Pressure Monitors, Waist Trainers, Grooming Clippers & Massage Guns',
    productCount: 22,
    featured: true
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Perfumes',
    slug: 'beauty-perfumes',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
    description: 'Designer Fragrances, Arabian Oud, Skincare Serums, Makeup & Body Atomizers',
    productCount: 34,
    featured: true
  },
  {
    id: 'cat-computing',
    name: 'Computers & Gaming',
    slug: 'computers-gaming',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    description: 'Laptops, Monitors, Mechanical Keyboards, Wireless Mice & Storage Drives',
    productCount: 25,
    featured: true
  },
  {
    id: 'cat-supermarket',
    name: 'Supermarket & Essentials',
    slug: 'supermarket-essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    description: 'Beverages, Gourmet Snacks, Household Detergents & Daily Personal Care',
    productCount: 40,
    featured: true
  }
];

export const initialProducts: Product[] = [
  // 1. PORTABLE BLENDER
  {
    id: 'prod-portable-blender',
    name: 'Portable USB Rechargeable Fruit Juice Blender (6-Blade 380ml Smoothie Maker)',
    slug: 'portable-usb-rechargeable-blender-380ml',
    description: 'Compact and high-speed portable personal blender powered by a built-in 2000mAh rechargeable battery via USB-C. Features 6 ultra-sharp 304 food-grade stainless steel blades spinning at 22,000 RPM, ideal for fresh fruit smoothies, protein shakes, milkshakes, and baby food on the go. One-button self-cleaning and BPA-free cup body.',
    shortDescription: '6-blade USB rechargeable personal smoothie maker and juicer bottle.',
    categoryId: 'cat-appliances',
    categoryName: 'Home & Kitchen',
    brand: 'NovaKitchen',
    sku: 'NK-BLND-USB380',
    price: 188,
    discountPrice: 64,
    stockQuantity: 12,
    status: 'active',
    featured: true,
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622484214149-6e65c569f168?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Capacity', value: '380 ml (13.5 oz)' },
      { name: 'Blade Material', value: '6-Leaf 304 Food-Grade Stainless Steel' },
      { name: 'Motor Speed', value: '22,000 RPM Heavy-Duty' },
      { name: 'Battery', value: '2000mAh Built-in Lithium-ion (USB Rechargeable)' },
      { name: 'Full Charge Yield', value: '12 - 15 Fresh Blends per Charge' },
      { name: 'Body Material', value: 'Eco-Friendly BPA-Free Food Grade PC & ABS' },
      { name: 'Charging Port', value: 'Universal USB-C Port' },
      { name: 'Safety Feature', value: 'Magnetic Induction Auto-Shutoff Protection' }
    ],
    tags: ['blender', 'kitchen', 'flash-sale', 'portable', 'bestseller'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 88,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2. BLOOD PRESSURE MONITOR
  {
    id: 'prod-bp-monitor',
    name: 'Automatic Digital Upper Arm Blood Pressure Monitor with Voice Broadcast',
    slug: 'automatic-digital-arm-blood-pressure-monitor',
    description: 'Clinical accuracy digital upper arm sphygmomanometer with high-contrast backlit LCD display, dual-user memory mode (2 x 99 readings history), irregular heartbeat detection, and English voice broadcast. Comes with a universal 22-42cm comfort cuff and hard-shell travel case.',
    shortDescription: 'Accurate digital upper-arm blood pressure and heart rate monitor with voice read-out.',
    categoryId: 'cat-health',
    categoryName: 'Health & Fitness',
    brand: 'MedCheck',
    sku: 'MC-BPM-ARM99',
    price: 280,
    discountPrice: 98,
    stockQuantity: 7,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 96,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583912267670-6575ad4736f8?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Measurement Method', value: 'Oscillometric Upper Arm Method' },
      { name: 'Display', value: '3.5-inch High-Definition Backlit LCD' },
      { name: 'Accuracy', value: 'Pressure ±3 mmHg | Pulse ±5%' },
      { name: 'Memory Capacity', value: '2 Users x 99 Readings with Date & Time' },
      { name: 'Cuff Range', value: '22 cm to 42 cm (Fits Standard to Large Arms)' },
      { name: 'Power Source', value: '4x AAA Batteries or USB Type-C Cable' },
      { name: 'Special Features', value: 'Voice Readout, WHO Color Gauge, Arrhythmia Warning' }
    ],
    tags: ['health', 'medical', 'bp-monitor', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 65,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3. CORDLESS HIGH PRESSURE WASHER GUN
  {
    id: 'prod-pressure-washer',
    name: 'High Pressure Cordless Portable Car & Yard Washer Gun (48V Max Kit)',
    slug: 'cordless-high-pressure-washer-gun-48v',
    description: 'Heavy duty 48V cordless portable power washer gun engineered for car washing, air conditioning coil servicing, compound floor scrubbing, and garden watering. Features a pure copper motor, self-priming suction filter hose (draws water from any bucket or lake), adjustable multi-spray nozzle, and dedicated snow-foam lance pot.',
    shortDescription: '48V cordless pressure washer gun with battery, foam dispenser and 5m hose kit.',
    categoryId: 'cat-appliances',
    categoryName: 'Home & Kitchen',
    brand: 'PowerPro',
    sku: 'PWR-PWG-48V',
    price: 678,
    discountPrice: 398,
    stockQuantity: 20,
    status: 'active',
    featured: true,
    rating: 4.7,
    reviewCount: 54,
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Battery Voltage', value: '48V Max Rechargeable Lithium-ion' },
      { name: 'Peak Water Pressure', value: '35 Bar / 500 PSI High Jet' },
      { name: 'Water Flow Rate', value: '4.5 Liters per minute' },
      { name: 'Hose Length', value: '5-Meter Reinforced Self-Priming Hose' },
      { name: 'Nozzle Modes', value: '0° Direct Jet, 40° Fan Spray, Foam Cannon' },
      { name: 'Box Includes', value: 'Washer Gun, 48V Battery, Fast Charger, 5m Hose, Filter, Foam Bottle, Case' }
    ],
    tags: ['car-wash', 'appliances', 'tools', 'pressure-washer', 'flash-sale'],
    isNewArrival: true,
    isBestSeller: false,
    salesCount: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 4. TUMMY WRAP / WAIST TRAINER
  {
    id: 'prod-tummy-wrap',
    name: 'Snatch Band Seamless Waist Trainer & Sweat Tummy Wrap (4-Meter Adjustable)',
    slug: 'seamless-waist-trainer-tummy-wrap-4m',
    description: 'Premium 4-meter elastic compression wrap crafted from high-density breathable latex and polyester. Instantly contours and snatches the waistline, supports lower back spine posture, smooths abdomen bulges, and accelerates thermal calorie burn during workouts or daily wear. Fits all body sizes (XS to 6XL).',
    shortDescription: '4-meter seamless adjustable tummy wrap and compression waist shaper.',
    categoryId: 'cat-health',
    categoryName: 'Health & Fitness',
    brand: 'CurveFit',
    sku: 'CF-WRAP-4M',
    price: 135,
    discountPrice: 62,
    stockQuantity: 18,
    status: 'active',
    featured: true,
    rating: 4.6,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Length', value: '4.0 Meters (13.1 feet Continuous Wrap)' },
      { name: 'Width', value: '13 cm (5.1 inches Full Abdominal Coverage)' },
      { name: 'Material', value: '35% Natural Latex + 65% Durable Woven Polyester' },
      { name: 'Closure System', value: '6-Segment Reinforced Hook & Loop Fastener' },
      { name: 'Size Fit', value: 'Universal Free Size (Fits Waist 23 to 50 inches)' }
    ],
    tags: ['fitness', 'waist-trainer', 'body-shaper', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 71,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 5. 3-PIECE LEATHER BELTS SET
  {
    id: 'prod-leather-belts',
    name: '3-Piece Genuine Leather Men Casual & Formal Belt Gift Set',
    slug: '3-piece-genuine-leather-men-belt-set',
    description: 'Set of 3 premium full-grain leather belts with heavy-duty alloy buckle finishes in Classic Black, Rich Brown, and Deep Tan. Scratch-resistant zinc alloy buckles, precision edge stitching, and easily adjustable sizing for business suits, jeans, and formal trousers.',
    shortDescription: 'Value pack of 3 genuine leather belts in Black, Brown, and Tan.',
    categoryId: 'cat-fashion',
    categoryName: 'Fashion & Shoes',
    brand: 'Oxford & Co',
    sku: 'OXF-BLT-SET3',
    price: 140,
    discountPrice: 71,
    stockQuantity: 19,
    status: 'active',
    featured: true,
    rating: 4.8,
    reviewCount: 43,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Set Quantity', value: '3 Full Belts (1x Black, 1x Dark Brown, 1x Tan)' },
      { name: 'Material', value: '100% Genuine Full-Grain Cowhide Leather' },
      { name: 'Buckle Type', value: 'Heavy Duty Anti-Rust Zinc Alloy' },
      { name: 'Belt Width', value: '3.5 cm Standard Fit' },
      { name: 'Length', value: '120 cm (Easily trimmable to custom waist size)' }
    ],
    tags: ['fashion', 'men', 'leather', 'belts', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 49,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 6. MINI REFILLABLE ATOMIZERS
  {
    id: 'prod-mini-atomizers',
    name: '3-Pack Pocket Refillable Perfume & Mist Atomizer Spray Bottles (5ml)',
    slug: '3-pack-refillable-perfume-atomizers-5ml',
    description: 'Tired of carrying heavy glass perfume bottles? These sleek, leak-proof aluminum 5ml pocket atomizers refill directly from the base in 5 seconds with zero spills. Clear visual window to monitor fluid level. TSA travel-approved for flights and daily pocket carry.',
    shortDescription: '3-pack 5ml bottom-pump refillable travel perfume atomizers.',
    categoryId: 'cat-beauty',
    categoryName: 'Beauty & Perfumes',
    brand: 'ScentPocket',
    sku: 'SP-ATM-3PK',
    price: 78,
    discountPrice: 37,
    stockQuantity: 18,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 110,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Quantity', value: '3 Bottles (Matte Black, Metallic Rose Gold, Silver)' },
      { name: 'Capacity', value: '5ml each (~65 - 70 Ultra-Fine Sprays)' },
      { name: 'Refill Mechanism', value: 'Direct Bottom Pump Valve (No Funnel Required)' },
      { name: 'Shell Material', value: 'Aircraft Grade Aluminum with Glass Inner Vial' }
    ],
    tags: ['perfume', 'travel', 'beauty', 'atomizer', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 7. APPLE IPHONE 15 PRO MAX
  {
    id: 'prod-iphone-15-pro',
    name: 'Apple iPhone 15 Pro Max (256GB Natural Titanium 5G)',
    slug: 'apple-iphone-15-pro-max-256gb-natural-titanium',
    description: 'Forged in aerospace-grade titanium with textured matte glass back. Powered by the industry-leading A17 Pro chip (3nm) with pro-class GPU. Features a 48MP main camera with customizable focal lengths, 5x telephoto optical zoom, Dynamic Island, Action button, USB-C with USB 3 data speeds, and all-day battery life.',
    shortDescription: 'Titanium powerhouse with A17 Pro chip, 48MP Pro camera & USB-C.',
    categoryId: 'cat-phones',
    categoryName: 'Phones & Tablets',
    brand: 'Apple',
    sku: 'APL-IP15PM-256-NT',
    price: 18500,
    discountPrice: 16900,
    stockQuantity: 8,
    status: 'active',
    featured: true,
    rating: 5.0,
    reviewCount: 154,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    variations: [
      {
        id: 'var-ip15-256-nat',
        name: '256GB - Natural Titanium',
        sku: 'APL-IP15PM-256-NT',
        price: 16900,
        stockQuantity: 5,
        attributes: { Storage: '256GB', Color: 'Natural Titanium' }
      },
      {
        id: 'var-ip15-512-blk',
        name: '512GB - Black Titanium',
        sku: 'APL-IP15PM-512-BT',
        price: 19800,
        stockQuantity: 3,
        attributes: { Storage: '512GB', Color: 'Black Titanium' }
      }
    ],
    specifications: [
      { name: 'Display', value: '6.7-inch Super Retina XDR OLED 120Hz ProMotion (2000 nits)' },
      { name: 'Processor', value: 'Apple A17 Pro (6-core CPU, 6-core GPU, 16-core Neural Engine)' },
      { name: 'Camera System', value: '48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto Optical' },
      { name: 'Battery Life', value: 'Up to 29 hours video playback | MagSafe & USB-C fast charging' },
      { name: 'Water Resistance', value: 'IP68 Rated (6 meters up to 30 mins)' },
      { name: 'Warranty', value: '1-Year Apple International Manufacturer Warranty' }
    ],
    tags: ['iphone', 'apple', 'smartphone', '5g', 'flagship'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 8. SAMSUNG GALAXY S24 ULTRA
  {
    id: 'prod-samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 5G (512GB Titanium Gray with S-Pen & Galaxy AI)',
    slug: 'samsung-galaxy-s24-ultra-512gb-titanium-gray',
    description: 'Galaxy AI is here. Epic titanium shield exterior, built-in S Pen stylus, 200MP camera with Quad Telephoto system, Circle to Search with Google, Live Translate, and Snapdragon 8 Gen 3 for Galaxy.',
    shortDescription: 'Galaxy AI flagship with 200MP camera, Snapdragon 8 Gen 3 and S Pen.',
    categoryId: 'cat-phones',
    categoryName: 'Phones & Tablets',
    brand: 'Samsung',
    sku: 'SAM-S24U-512-GRY',
    price: 17800,
    discountPrice: 15990,
    stockQuantity: 6,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 98,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Display', value: '6.8-inch Dynamic AMOLED 2X QHD+ 120Hz (2600 nits peak)' },
      { name: 'RAM / Storage', value: '12GB RAM / 512GB High Speed UFS 4.0 Storage' },
      { name: 'Camera System', value: '200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultra-wide' },
      { name: 'Battery', value: '5000mAh with 45W Fast Wired & 15W Wireless Charging' },
      { name: 'Included Stylus', value: 'Built-in Bluetooth S Pen with Air Actions' },
      { name: 'Warranty', value: '24-Month Samsung Ghana Official Warranty' }
    ],
    tags: ['samsung', 'galaxy', 's24-ultra', 'flagship', 'android'],
    isNewArrival: true,
    isBestSeller: true,
    salesCount: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 9. SONY WH-1000XM5 HEADPHONES
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5-noise-canceling-headphones',
    description: 'Two processors and 8 microphones deliver world-class active noise cancellation. Ultra-comfortable lightweight soft-fit leather headband, crystal clear hands-free calling with 4 beamforming mics, and 30-hour battery life with 3-minute quick charge.',
    shortDescription: 'World class ANC headphones with 30-hour battery & Hi-Res wireless audio.',
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    brand: 'Sony',
    sku: 'SNY-WH1000XM5-BLK',
    price: 4600,
    discountPrice: 3850,
    stockQuantity: 11,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Battery Life', value: '30 Hours (ANC ON) / 40 Hours (ANC OFF)' },
      { name: 'Quick Charge', value: '3 min charge gives 3 hours playback' },
      { name: 'Audio Codecs', value: 'LDAC, AAC, SBC (Hi-Res Audio Wireless Certified)' },
      { name: 'Microphones', value: '8 Mics with AI Noise Reduction algorithm' },
      { name: 'Multipoint Connection', value: 'Connect simultaneously to 2 Bluetooth devices' }
    ],
    tags: ['audio', 'headphones', 'sony', 'anc', 'electronics'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 10. DIGITAL XL 8L AIR FRYER
  {
    id: 'prod-air-fryer-8l',
    name: 'Digital XL 8-Liter Touchscreen Air Fryer with 10 Preset Cooking Modes',
    slug: 'digital-xl-8l-touchscreen-air-fryer',
    description: 'Cook crispy, delicious meals with up to 85% less oil. Massive 8.0-liter non-stick basket easily roasts a whole 2.5kg chicken for a family of 6-8. Features 360-degree rapid heat circulation, smart shake reminder, and dishwasher-safe non-stick parts.',
    shortDescription: '8L large capacity digital touchscreen air fryer with 10 presets.',
    categoryId: 'cat-appliances',
    categoryName: 'Home & Kitchen',
    brand: 'NovaKitchen',
    sku: 'NK-AF-8L-DIG',
    price: 1250,
    discountPrice: 890,
    stockQuantity: 14,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Capacity', value: '8.0 Liters XL Square Basket (Feeds 6-8 People)' },
      { name: 'Power Rating', value: '1800W High Efficiency Turbo Heating' },
      { name: 'Temperature Range', value: '60°C to 200°C Precise Digital Control' },
      { name: 'Preset Programs', value: 'Fries, Roast, Chicken, Steak, Shrimp, Fish, Pizza, Cake, Dehydrate, Reheat' },
      { name: 'Cleaning', value: 'Dishwasher-Safe BPA-Free Non-Stick Coating' }
    ],
    tags: ['air-fryer', 'kitchen', 'appliances', 'healthy-cooking'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 58,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 11. NIKE AIR FORCE 1 SNEAKERS
  {
    id: 'prod-nike-air-force-1',
    name: 'Nike Air Force 1 07 Triple White Leather Classic Sneakers',
    slug: 'nike-air-force-1-07-triple-white-sneakers',
    description: 'The radiance lives on in the Nike Air Force 1 07. Crisp stitched overlays, pristine white full-grain leather, padded low-cut collar, and encapsulated Nike Air cushioning provide all-day comfort and timeless street style.',
    shortDescription: 'Iconic all-white leather sneaker with encapsulated Air sole.',
    categoryId: 'cat-fashion',
    categoryName: 'Fashion & Shoes',
    brand: 'Nike',
    sku: 'NKE-AF1-WHT',
    price: 1800,
    discountPrice: 1450,
    stockQuantity: 16,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 180,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    variations: [
      { id: 'var-af1-41', name: 'Size EU 41', sku: 'NKE-AF1-41', price: 1450, stockQuantity: 4, attributes: { Size: 'EU 41' } },
      { id: 'var-af1-42', name: 'Size EU 42', sku: 'NKE-AF1-42', price: 1450, stockQuantity: 6, attributes: { Size: 'EU 42' } },
      { id: 'var-af1-43', name: 'Size EU 43', sku: 'NKE-AF1-43', price: 1450, stockQuantity: 4, attributes: { Size: 'EU 43' } },
      { id: 'var-af1-44', name: 'Size EU 44', sku: 'NKE-AF1-44', price: 1450, stockQuantity: 2, attributes: { Size: 'EU 44' } }
    ],
    specifications: [
      { name: 'Upper Material', value: '100% Genuine Stitched Full-Grain Leather' },
      { name: 'Sole Unit', value: 'Encapsulated Nike Air-Sole Cushioning' },
      { name: 'Outsole', value: 'Non-Marking Pivot-Circle Rubber Traction' },
      { name: 'Colorway', value: 'White / White / White (Triple White)' }
    ],
    tags: ['sneakers', 'nike', 'shoes', 'fashion', 'streetwear'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 94,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 12. BACCARAT ROUGE 540 EXTRAIT
  {
    id: 'prod-baccarat-rouge-540',
    name: 'Maison Francis Kurkdjian Baccarat Rouge 540 (Extrait de Parfum 70ml)',
    slug: 'maison-francis-kurkdjian-baccarat-rouge-540-extrait-70ml',
    description: 'An iconic, luminous and intense luxury fragrance blending Grandiflorum jasmine from Egypt, saffron, bitter almond from Morocco, and signature ambergris woody musks for unmatched longevity and sillage.',
    shortDescription: 'Iconic luxury fragrance with Egyptian Jasmine, Ambergris and Saffron.',
    categoryId: 'cat-beauty',
    categoryName: 'Beauty & Perfumes',
    brand: 'Maison Francis Kurkdjian',
    sku: 'MFK-BR540-EXT70',
    price: 6850,
    discountPrice: 6200,
    stockQuantity: 9,
    status: 'active',
    featured: true,
    rating: 5.0,
    reviewCount: 74,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Concentration', value: 'Extrait de Parfum (Highest Oil Concentration)' },
      { name: 'Scent Family', value: 'Amber Woody Floral' },
      { name: 'Top Notes', value: 'Bitter Almond from Morocco, Saffron' },
      { name: 'Heart Notes', value: 'Egyptian Grandiflorum Jasmine, Cedarwood' },
      { name: 'Base Notes', value: 'Ambergris Accord, Woody Musk' },
      { name: 'Origin', value: 'Made in Paris, France (100% Genuine Batch)' }
    ],
    tags: ['luxury', 'niche', 'perfume', 'beauty'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialBanners: Banner[] = [
  {
    id: 'ban-1',
    title: "Ghana's Premier Online Superstore",
    subtitle: 'Electronics, Fashion, Home Appliances, Health & Groceries',
    highlight: 'MEGA SALE 2026',
    message: 'Explore over 10,000 genuine products delivered express to your doorstep across Accra & all 16 regions.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Shop All Departments',
    destinationUrl: '/shop',
    position: 'hero',
    status: 'active',
    order: 1
  },
  {
    id: 'ban-2',
    title: 'Top Tech, Smartphones & Laptops',
    subtitle: 'Official Apple, Samsung, Sony & HP Tech Hub',
    highlight: 'TECH WEEK DEALS',
    message: 'Save up to 35% on latest smartphones, gaming accessories, smartwatches & 4K smart TVs with warranty.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Explore Electronics',
    destinationUrl: '/shop?category=cat-phones',
    position: 'hero',
    status: 'active',
    order: 2
  },
  {
    id: 'ban-3',
    title: 'Modern Home & Kitchen Essentials',
    subtitle: 'Air Fryers, Blenders, Pressure Washers & Cookware',
    highlight: 'UP TO 50% OFF',
    message: 'Upgrade your living space with smart kitchen appliances and powerful cordless home cleaning gadgets.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Browse Appliances',
    destinationUrl: '/shop?category=cat-appliances',
    position: 'hero',
    status: 'active',
    order: 3
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-welcome',
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minimumPurchase: 200,
    maximumDiscount: 150,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usageCount: 142,
    status: 'active'
  },
  {
    id: 'coup-super',
    code: 'SUPER50',
    discountType: 'fixed',
    value: 50,
    minimumPurchase: 500,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 89,
    status: 'active'
  },
  {
    id: 'coup-vip',
    code: 'NOVAVIP',
    discountType: 'percentage',
    value: 15,
    minimumPurchase: 1000,
    maximumDiscount: 400,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usageCount: 35,
    status: 'active'
  }
];

export const initialVendors: Vendor[] = [
  {
    id: 'vend-kofi',
    userId: 'usr-kofi-seller',
    storeName: 'Kofi Tech & Audio Hub',
    slug: 'kofi-tech-audio',
    ownerName: 'Kofi Boateng',
    email: 'kofi.seller@novamart.com.gh',
    phone: '+233 24 888 1234',
    category: 'Electronics & Phones',
    description: 'Premier distributor of certified audio gear, flagship smartphones, gaming accessories, and smart devices in Ghana.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    address: 'Plot 14, Oxford Street, Osu',
    city: 'Accra',
    status: 'active',
    commissionRate: 10,
    payoutDetails: {
      method: 'mtn_momo',
      accountName: 'Kofi Boateng',
      accountNumber: '0248881234'
    },
    rating: 4.8,
    reviewCount: 64,
    totalProducts: 12,
    totalSales: 48,
    totalRevenue: 18450.00,
    balance: 3450.00,
    pendingBalance: 1200.00,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'vend-akosua',
    userId: 'usr-akosua-seller',
    storeName: 'Akosua Luxury & Scents',
    slug: 'akosua-luxury-scents',
    ownerName: 'Akosua Mensah',
    email: 'akosua.seller@novamart.com.gh',
    phone: '+233 55 999 5678',
    category: 'Beauty & Perfumes',
    description: 'Curated collection of authentic designer fragrances, Arabian oud oils, luxury skincare, and bespoke fashion accessories.',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    address: 'Shop 12, Accra Mall, Tetteh Quarshie',
    city: 'Accra',
    status: 'active',
    commissionRate: 12,
    payoutDetails: {
      method: 'mtn_momo',
      accountName: 'Akosua Mensah',
      accountNumber: '0559995678'
    },
    rating: 4.9,
    reviewCount: 82,
    totalProducts: 9,
    totalSales: 76,
    totalRevenue: 24800.00,
    balance: 5280.00,
    pendingBalance: 850.00,
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-02-20T09:15:00Z'
  }
];

