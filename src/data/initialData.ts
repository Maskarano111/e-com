import { Product, Category, Banner, Coupon } from '../types/index';

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
  // 1. ELECTRONICS & GADGETS
  {
    id: 'prod-portable-blender',
    name: 'Portable USB Rechargeable Fruit Juice Blender (6-Blade Juicer 380ml)',
    slug: 'portable-usb-rechargeable-blender-380ml',
    description: 'Compact and high-speed portable personal blender powered by a built-in rechargeable battery via USB. Features 6 ultra-sharp 304 stainless steel blades spinning at 22,000 RPM, ideal for fresh smoothies, protein shakes, and baby food on the go.',
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
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Capacity', value: '380ml' },
      { name: 'Battery', value: '2000mAh USB Rechargeable' },
      { name: 'Blades', value: '6 Stainless Steel 304 Blades' },
      { name: 'Speed', value: '22,000 RPM' }
    ],
    tags: ['blender', 'kitchen', 'flash-sale', 'portable', 'bestseller'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 88,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-bp-monitor',
    name: 'Automatic Digital Upper Arm Blood Pressure Monitor with Heart Rate Pulse',
    slug: 'automatic-digital-arm-blood-pressure-monitor',
    description: 'High-precision digital upper arm sphygmomanometer with large HD LCD screen, dual-user memory (99 readings each), voice broadcast, and WHO color-coded blood pressure indicator. Includes universal comfort cuff (22-42cm).',
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
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Type', value: 'Upper Arm Digital' },
      { name: 'Display', value: 'Large Backlit LCD' },
      { name: 'Memory', value: '2 x 99 Reading History' },
      { name: 'Cuff Size', value: '22 - 42 cm Universal' }
    ],
    tags: ['health', 'medical', 'bp-monitor', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 65,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-pressure-washer',
    name: 'High Pressure Cordless Portable Car & Yard Washer Gun (48V Max)',
    slug: 'cordless-high-pressure-washer-gun-48v',
    description: 'Heavy duty 48V cordless portable high pressure power washer gun with rechargeable lithium battery, self-priming hose, adjustable nozzle, foam pot, and multi-spray patterns for car washing, air-conditioner cleaning, and patio detailing.',
    shortDescription: '48V cordless pressure washer gun with battery, foam dispenser and hose kit.',
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
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Power', value: '48V Lithium Battery' },
      { name: 'Peak Pressure', value: '35 Bar / 500 PSI' },
      { name: 'Water Flow', value: '4 L/min' },
      { name: 'Includes', value: 'Washer Gun, 48V Battery, Charger, 5m Hose, Foam Pot' }
    ],
    tags: ['car-wash', 'appliances', 'tools', 'pressure-washer', 'flash-sale'],
    isNewArrival: true,
    isBestSeller: false,
    salesCount: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-tummy-wrap',
    name: 'Snatch Band Seamless Waist Trainer & Sweat Tummy Wrap (4-Meter Adjustable)',
    slug: 'seamless-waist-trainer-tummy-wrap-4m',
    description: 'Premium 4-meter elastic compression wrap designed to instantly contour and snatch the waistline, support lower back posture, and accelerate thermal calorie burn during workouts or daily wear. Fits all body sizes (XS to 6XL).',
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
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Length', value: '4 Meters (13.1 ft)' },
      { name: 'Material', value: '35% Latex + 65% Polyester High Elasticity' },
      { name: 'Fastening', value: 'Segmented Hook & Loop Closure' }
    ],
    tags: ['fitness', 'waist-trainer', 'body-shaper', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 71,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-leather-belts',
    name: '3-Piece Genuine Leather Men Casual & Formal Belt Gift Set',
    slug: '3-piece-genuine-leather-men-belt-set',
    description: 'Set of 3 premium full-grain leather belts with heavy-duty alloy buckle finishes in Classic Black, Rich Brown, and Deep Tan. Reversible and easily adjustable for business suits, jeans, and formal trousers.',
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
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Set Size', value: '3 Belts (Black, Dark Brown, Tan)' },
      { name: 'Material', value: 'Genuine Cowhide Leather' },
      { name: 'Buckle', value: 'Scratch-resistant Zinc Alloy' },
      { name: 'Width', value: '3.5 cm Standard' }
    ],
    tags: ['fashion', 'men', 'leather', 'belts', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 49,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-mini-atomizers',
    name: '3-Pack Pocket Refillable Perfume & Mist Atomizer Spray Bottles (5ml)',
    slug: '3-pack-refillable-perfume-atomizers-5ml',
    description: 'Tired of carrying heavy glass perfume bottles? These sleek, leak-proof aluminum 5ml pocket atomizers refill directly from the base in 5 seconds with zero spills. TSA travel-approved.',
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
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Quantity', value: '3 Bottles (Matte Black, Rose Gold, Silver)' },
      { name: 'Capacity', value: '5ml (~65 Sprays each)' },
      { name: 'Refill Method', value: 'Direct Bottom Pump Mechanism' }
    ],
    tags: ['perfume', 'travel', 'beauty', 'atomizer', 'flash-sale'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2. SMARTPHONES & COMPUTING
  {
    id: 'prod-iphone-15-pro',
    name: 'Apple iPhone 15 Pro Max (256GB Natural Titanium 5G)',
    slug: 'apple-iphone-15-pro-max-256gb-natural-titanium',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, 48MP main camera system with 5x telephoto optical zoom, and USB-C with USB 3 speeds.',
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
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'
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
      { name: 'Display', value: '6.7-inch Super Retina XDR OLED 120Hz ProMotion' },
      { name: 'Processor', value: 'Apple A17 Pro (3nm)' },
      { name: 'Camera', value: '48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto' },
      { name: 'Warranty', value: '1-Year Apple International Warranty' }
    ],
    tags: ['iphone', 'apple', 'smartphone', '5g', 'flagship'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 5G (512GB Titanium Gray with S-Pen & Galaxy AI)',
    slug: 'samsung-galaxy-s24-ultra-512gb-titanium-gray',
    description: 'Galaxy AI is here. Epic titanium shield exterior, built-in S Pen, 200MP camera with Quad Telephoto system, and Snapdragon 8 Gen 3 for Galaxy.',
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
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Display', value: '6.8-inch Dynamic AMOLED 2X QHD+ 2600 nits' },
      { name: 'RAM / Storage', value: '12GB RAM / 512GB Storage' },
      { name: 'Main Camera', value: '200MP + 50MP + 12MP + 10MP' },
      { name: 'Battery', value: '5000mAh with 45W Fast Charging' }
    ],
    tags: ['samsung', 'galaxy', 's24-ultra', 'flagship', 'android'],
    isNewArrival: true,
    isBestSeller: true,
    salesCount: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-macbook-pro-m3',
    name: 'Apple MacBook Pro 14" (Apple M3 Pro Chip, 18GB RAM, 512GB SSD Space Black)',
    slug: 'apple-macbook-pro-14-m3-pro-18gb-512gb',
    description: 'Supercharged by the M3 Pro chip with an 11-core CPU and 14-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 18 hours of battery life.',
    shortDescription: '14" Liquid Retina XDR display, M3 Pro 11-Core CPU, 18GB Unified Memory.',
    categoryId: 'cat-computing',
    categoryName: 'Computers & Gaming',
    brand: 'Apple',
    sku: 'APL-MBP14-M3P-BLK',
    price: 24500,
    discountPrice: 22800,
    stockQuantity: 4,
    status: 'active',
    featured: true,
    rating: 5.0,
    reviewCount: 41,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Chip', value: 'Apple M3 Pro (11-Core CPU, 14-Core GPU)' },
      { name: 'Memory', value: '18GB Unified Memory' },
      { name: 'Storage', value: '512GB Fast NVMe SSD' },
      { name: 'Display', value: '14.2" Liquid Retina XDR 120Hz' }
    ],
    tags: ['macbook', 'laptop', 'apple', 'computing', 'pro'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3. AUDIO & HOME ENTERTAINMENT
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5-noise-canceling-headphones',
    description: 'Two processors and 8 microphones for industry-leading active noise cancellation. Ultra-comfortable lightweight design, crystal clear hands-free calling, and 30-hour battery life with quick charge.',
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
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Battery Life', value: '30 Hours (ANC ON) / 40 Hours (ANC OFF)' },
      { name: 'Charging', value: '3 min charge gives 3 hours playback' },
      { name: 'Audio', value: 'Hi-Res Audio Wireless LDAC' }
    ],
    tags: ['audio', 'headphones', 'sony', 'anc', 'electronics'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-smart-tv-55',
    name: 'Samsung 55-Inch Crystal 4K UHD Smart TV with HDR10+ & Gaming Hub',
    slug: 'samsung-55-inch-crystal-4k-uhd-smart-tv',
    description: 'Transform your living room with vivid Crystal Processor 4K colors, ultra-slim bezel-less design, Dolby Audio, built-in Netflix, YouTube, Prime Video, and Apple AirPlay 2.',
    shortDescription: '55" Ultra HD Crystal 4K Smart TV with Dolby Audio & Voice Remote.',
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    brand: 'Samsung',
    sku: 'SAM-TV55-CU7000',
    price: 7800,
    discountPrice: 6490,
    stockQuantity: 5,
    status: 'active',
    featured: true,
    rating: 4.8,
    reviewCount: 32,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Screen Size', value: '55 Inch 4K UHD (3840 x 2160)' },
      { name: 'OS', value: 'Tizen Smart TV OS' },
      { name: 'Connectivity', value: '3x HDMI, 2x USB, Wi-Fi, Bluetooth 5.2' }
    ],
    tags: ['tv', 'smart-tv', 'samsung', '4k', 'electronics'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 4. KITCHEN APPLIANCES
  {
    id: 'prod-air-fryer-8l',
    name: 'Digital XL 8-Liter Touchscreen Air Fryer with 10 Preset Cooking Modes',
    slug: 'digital-xl-8l-touchscreen-air-fryer',
    description: 'Cook crispy, delicious meals with up to 85% less oil. Massive 8.0-liter non-stick basket easily feeds a family of 6-8. Features 360-degree rapid air heat circulation and easy dishwasher-safe parts.',
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
      'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Capacity', value: '8.0 Liters XL Basket' },
      { name: 'Power', value: '1800W Rapid Heating' },
      { name: 'Presets', value: 'Chicken, Fries, Steak, Fish, Cake, Pizza, Dehydrate' }
    ],
    tags: ['air-fryer', 'kitchen', 'appliances', 'healthy-cooking'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 58,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 5. FOOTWEAR & LUXURY FASHION
  {
    id: 'prod-nike-air-force-1',
    name: 'Nike Air Force 1 07 Triple White Leather Classic Sneakers',
    slug: 'nike-air-force-1-07-triple-white-sneakers',
    description: 'The radiance lives on in the Nike Air Force 1 07. Crisp stitched overlays, pristine white leather, and encapsulated Nike Air cushioning provide all-day comfort and timeless street style.',
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
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    variations: [
      { id: 'var-af1-41', name: 'Size EU 41', sku: 'NKE-AF1-41', price: 1450, stockQuantity: 4, attributes: { Size: 'EU 41' } },
      { id: 'var-af1-42', name: 'Size EU 42', sku: 'NKE-AF1-42', price: 1450, stockQuantity: 6, attributes: { Size: 'EU 42' } },
      { id: 'var-af1-43', name: 'Size EU 43', sku: 'NKE-AF1-43', price: 1450, stockQuantity: 4, attributes: { Size: 'EU 43' } },
      { id: 'var-af1-44', name: 'Size EU 44', sku: 'NKE-AF1-44', price: 1450, stockQuantity: 2, attributes: { Size: 'EU 44' } }
    ],
    specifications: [
      { name: 'Material', value: '100% Genuine Leather Upper' },
      { name: 'Cushioning', value: 'Encapsulated Air-Sole Unit' },
      { name: 'Color', value: 'Triple White' }
    ],
    tags: ['sneakers', 'nike', 'shoes', 'fashion', 'streetwear'],
    isNewArrival: false,
    isBestSeller: true,
    salesCount: 94,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 6. BEAUTY & DESIGNER PERFUMES
  {
    id: 'prod-baccarat-rouge-540',
    name: 'Maison Francis Kurkdjian Baccarat Rouge 540 (Extrait de Parfum 70ml)',
    slug: 'maison-francis-kurkdjian-baccarat-rouge-540-extrait-70ml',
    description: 'An iconic, luminous and intense luxury fragrance blending grandiflorum jasmine from Egypt, saffron, bitter almond, and ambergris woody musks for unmatched sillage.',
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
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    specifications: [
      { name: 'Concentration', value: 'Extrait de Parfum' },
      { name: 'Scent Profile', value: 'Amber Woody Floral' },
      { name: 'Origin', value: 'Made in France (100% Authentic)' }
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
