import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import {
  Product,
  Category,
  Order,
  PaymentTransaction,
  Review,
  Coupon,
  Banner,
  NotificationItem,
  StoreSettings,
  DeliveryAddress,
  User,
  OrderStatus,
  PaymentStatus
} from '../src/types/index';

const router = Router();

// Helper to generate IDs
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
const generateOrderNumber = () => `NM-GH-${Math.floor(10000 + Math.random() * 90000)}`;

// ----------------------------------------------------
// 1. AUTHENTICATION & USER MANAGEMENT
// ----------------------------------------------------
router.post('/auth/register', (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanFirst = (firstName || '').trim();
  const cleanLast = (lastName || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPass) {
    return res.status(400).json({ error: 'Please provide first name, last name, email, and password' });
  }

  if (cleanPass.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const users = db.get('users');
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const newUser = {
    id: uid('usr-cust'),
    firstName: cleanFirst,
    lastName: cleanLast,
    email: cleanEmail,
    phone: (phone || '').trim(),
    role: 'customer' as const,
    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanFirst + ' ' + cleanLast)}`,
    passwordHash: cleanPass,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  db.set('users', users);

  const { passwordHash, ...userWithoutPass } = newUser;
  res.status(201).json({ user: userWithoutPass, token: `jwt-demo-${newUser.id}` });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanPass) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Fallback demo matching for convenience if domain variant used
  if (!user) {
    if (cleanEmail.startsWith('admin@')) {
      user = users.find(u => u.role === 'super_admin' || u.role === 'admin');
    } else if (cleanEmail.startsWith('manager@')) {
      user = users.find(u => u.role === 'store_manager');
    } else if (cleanEmail.startsWith('customer@') || cleanEmail.includes('abena')) {
      user = users.find(u => u.role === 'customer');
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Password matching with tolerance for demo account case variations
  const isDemoAdmin = user.role === 'super_admin' || user.role === 'admin';
  const isDemoManager = user.role === 'store_manager';
  const isDemoCustomer = user.role === 'customer';

  const passMatches = 
    user.passwordHash === cleanPass ||
    (isDemoAdmin && (cleanPass.toLowerCase() === 'admin123' || cleanPass === 'Admin@123')) ||
    (isDemoManager && (cleanPass.toLowerCase() === 'manager123' || cleanPass === 'Manager@123')) ||
    (isDemoCustomer && (cleanPass.toLowerCase() === 'customer123' || cleanPass === 'Customer@123'));

  if (!passMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token: `jwt-demo-${user.id}` });
});

router.post('/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Fallback demo admin matching
  if (!user && (cleanEmail.startsWith('admin@') || cleanEmail.startsWith('manager@'))) {
    user = users.find(u => u.role === 'super_admin' || u.role === 'admin' || u.role === 'store_manager');
  }
  
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'store_manager')) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }

  const passMatches = 
    user.passwordHash === cleanPass ||
    cleanPass.toLowerCase() === 'admin123' ||
    cleanPass === 'Admin@123' ||
    cleanPass.toLowerCase() === 'manager123' ||
    cleanPass === 'Manager@123';

  if (!passMatches) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const { passwordHash, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token: `jwt-admin-${user.id}` });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('jwt-demo-', '').replace('jwt-admin-', '');
  
  const users = db.get('users');
  let user = users.find(u => u.id === userId);
  
  if (!user) {
    // If token has default admin/customer keyword
    if (token.includes('admin')) {
      user = users.find(u => u.role === 'super_admin' || u.role === 'admin');
    } else {
      user = users.find(u => u.role === 'customer');
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid token session' });
  }

  const { passwordHash, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass });
});

router.put('/auth/profile', (req: Request, res: Response) => {
  const { userId, firstName, lastName, phone, profileImage } = req.body;
  const users = db.get('users');
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = {
    ...users[userIndex],
    firstName: firstName || users[userIndex].firstName,
    lastName: lastName || users[userIndex].lastName,
    phone: phone !== undefined ? phone : users[userIndex].phone,
    profileImage: profileImage || users[userIndex].profileImage,
    updatedAt: new Date().toISOString()
  };

  db.set('users', users);
  const { passwordHash, ...userWithoutPass } = users[userIndex];
  res.json({ user: userWithoutPass });
});

router.put('/auth/change-password', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;
  const users = db.get('users');
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (users[userIndex].passwordHash !== currentPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  users[userIndex].passwordHash = newPassword;
  users[userIndex].updatedAt = new Date().toISOString();
  db.set('users', users);

  res.json({ message: 'Password updated successfully' });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  res.json({ message: `Password reset instructions sent to ${email}. (Demo reset token: RESET-${user.id})` });
});

router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  const users = db.get('users');
  const userIndex = users.findIndex(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex].passwordHash = newPassword;
  users[userIndex].updatedAt = new Date().toISOString();
  db.set('users', users);

  res.json({ message: 'Password has been reset successfully. Please log in.' });
});

// ----------------------------------------------------
// 2. PRODUCTS
// ----------------------------------------------------
router.get('/products', (req: Request, res: Response) => {
  const {
    search,
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    rating,
    availability,
    sortBy,
    featured,
    dealsOnly,
    page = '1',
    limit = '50',
    includeInactive
  } = req.query;

  let products = db.get('products');

  // Filter by status unless admin requests all
  if (includeInactive !== 'true') {
    products = products.filter(p => p.status === 'active');
  }

  // Search keyword across name, description, brand, tags, SKU
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter(p => p.categoryId === category || p.categoryName === category);
  }

  // SubCategory filter
  if (subCategory && typeof subCategory === 'string' && subCategory !== 'all') {
    products = products.filter(p => p.subCategory?.toLowerCase() === subCategory.toLowerCase());
  }

  // Brand filter
  if (brand && typeof brand === 'string' && brand !== 'all') {
    const brands = brand.split(',').map(b => b.trim().toLowerCase());
    products = products.filter(p => brands.includes(p.brand.toLowerCase()));
  }

  // Price range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) {
      products = products.filter(p => (p.discountPrice || p.price) >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) {
      products = products.filter(p => (p.discountPrice || p.price) <= max);
    }
  }

  // Rating filter
  if (rating) {
    const minRating = parseFloat(rating as string);
    if (!isNaN(minRating)) {
      products = products.filter(p => p.rating >= minRating);
    }
  }

  // Availability filter
  if (availability === 'in_stock') {
    products = products.filter(p => p.stockQuantity > 0);
  }

  // Featured / Deals filter
  if (featured === 'true') {
    products = products.filter(p => p.featured);
  }
  if (dealsOnly === 'true') {
    products = products.filter(p => p.discountPrice && p.discountPrice < p.price);
  }

  // Sorting
  switch (sortBy) {
    case 'newest':
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'popularity':
      products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      break;
    case 'price_low':
      products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      break;
    case 'price_high':
      products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Default: featured first then newest
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const total = products.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = products.slice(startIndex, startIndex + limitNum);

  res.json({
    products: paginated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

router.get('/products/deals', (req: Request, res: Response) => {
  const products = db.get('products')
    .filter(p => p.status === 'active' && p.discountPrice && p.discountPrice < p.price)
    .slice(0, 10);
  res.json(products);
});

router.get('/products/new-arrivals', (req: Request, res: Response) => {
  const products = db.get('products')
    .filter(p => p.status === 'active' && p.isNewArrival)
    .slice(0, 8);
  res.json(products);
});

router.get('/products/bestsellers', (req: Request, res: Response) => {
  const products = db.get('products')
    .filter(p => p.status === 'active' && p.isBestSeller)
    .slice(0, 8);
  res.json(products);
});

router.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const products = db.get('products');
  const product = products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Find related products in same category
  const related = products
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId && p.status === 'active')
    .slice(0, 4);

  res.json({ product, related });
});

// Product Reviews
router.get('/products/:idOrSlug/reviews', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const reviews = db.get('reviews') || [];
  const productReviews = reviews.filter(
    (r) => (r.productId === idOrSlug || r.status === 'approved') && r.productId === idOrSlug
  );
  res.json(productReviews);
});

router.post('/products/:idOrSlug/reviews', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const { userName, userEmail, rating, comment, title } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const reviews = db.get('reviews') || [];
  const newReview = {
    id: `rev-${Date.now()}`,
    productId: idOrSlug,
    userId: 'usr-guest',
    userName: userName || 'Verified Buyer',
    userEmail: userEmail || '',
    rating: Number(rating) || 5,
    title: title || '',
    comment,
    verifiedPurchase: true,
    status: 'approved' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  db.set('reviews', reviews);

  // Update product average rating
  const products = db.get('products');
  const prodIndex = products.findIndex((p) => p.id === idOrSlug);
  if (prodIndex !== -1) {
    const prodReviews = reviews.filter((r) => r.productId === idOrSlug);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    products[prodIndex].rating = parseFloat(avgRating.toFixed(1));
    products[prodIndex].reviewCount = prodReviews.length;
    db.set('products', products);
  }

  res.status(201).json(newReview);
});

// Admin Product CRUD
router.post('/products', (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.name || !productData.categoryId || productData.price === undefined) {
    return res.status(400).json({ error: 'Name, Category and Price are required' });
  }

  const products = db.get('products');
  const categories = db.get('categories');
  const category = categories.find(c => c.id === productData.categoryId);

  const slug = (productData.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

  const newProduct: Product = {
    id: uid('prod'),
    name: productData.name,
    slug: productData.slug || slug,
    description: productData.description || '',
    shortDescription: productData.shortDescription || '',
    categoryId: productData.categoryId,
    categoryName: category?.name || 'General',
    subCategory: productData.subCategory || '',
    brand: productData.brand || 'Generic',
    sku: productData.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
    price: parseFloat(productData.price),
    discountPrice: productData.discountPrice ? parseFloat(productData.discountPrice) : undefined,
    stockQuantity: parseInt(productData.stockQuantity, 10) || 0,
    status: productData.status || 'active',
    featured: !!productData.featured,
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 0,
    images: productData.images && productData.images.length > 0 ? productData.images : [productData.featuredImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    featuredImage: productData.featuredImage || (productData.images && productData.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    variations: productData.variations || [],
    specifications: productData.specifications || [],
    weight: productData.weight || '',
    tags: productData.tags || [],
    isNewArrival: !!productData.isNewArrival,
    isBestSeller: !!productData.isBestSeller,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  db.set('products', products);

  // Update category product count
  if (category) {
    category.productCount = (category.productCount || 0) + 1;
    db.set('categories', categories);
  }

  res.status(201).json(newProduct);
});

router.put('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const products = db.get('products');
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const categories = db.get('categories');
  const category = categories.find(c => c.id === (updates.categoryId || products[index].categoryId));

  products[index] = {
    ...products[index],
    ...updates,
    categoryName: category?.name || products[index].categoryName,
    price: updates.price !== undefined ? parseFloat(updates.price) : products[index].price,
    discountPrice: updates.discountPrice !== undefined ? (updates.discountPrice ? parseFloat(updates.discountPrice) : undefined) : products[index].discountPrice,
    stockQuantity: updates.stockQuantity !== undefined ? parseInt(updates.stockQuantity, 10) : products[index].stockQuantity,
    updatedAt: new Date().toISOString()
  };

  db.set('products', products);
  res.json(products[index]);
});

router.delete('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let products = db.get('products');
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products = products.filter(p => p.id !== id);
  db.set('products', products);

  // Update category product count
  const categories = db.get('categories');
  const cat = categories.find(c => c.id === product.categoryId);
  if (cat && cat.productCount && cat.productCount > 0) {
    cat.productCount -= 1;
    db.set('categories', categories);
  }

  res.json({ message: 'Product deleted successfully', id });
});

router.post('/products/:id/duplicate', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = db.get('products');
  const original = products.find(p => p.id === id);
  if (!original) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const duplicated: Product = {
    ...original,
    id: uid('prod'),
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
    sku: `${original.sku}-COPY`,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.unshift(duplicated);
  db.set('products', products);
  res.status(201).json(duplicated);
});

// ----------------------------------------------------
// 3. CATEGORIES
// ----------------------------------------------------
router.get('/categories', (req: Request, res: Response) => {
  const categories = db.get('categories');
  const products = db.get('products');

  // Recalculate dynamic product counts
  const enriched = categories.map(c => ({
    ...c,
    productCount: products.filter(p => p.categoryId === c.id && p.status === 'active').length
  }));

  res.json(enriched);
});

router.post('/categories', (req: Request, res: Response) => {
  const { name, image, description, parentCategoryId, subcategories, iconName, featured } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const categories = db.get('categories');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCategory: Category = {
    id: uid('cat'),
    name,
    slug,
    image: image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    iconName: iconName || 'Tag',
    description: description || '',
    parentCategoryId: parentCategoryId || null,
    subcategories: subcategories || [],
    productCount: 0,
    featured: !!featured
  };

  categories.push(newCategory);
  db.set('categories', categories);
  res.status(201).json(newCategory);
});

router.put('/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const categories = db.get('categories');
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  categories[index] = { ...categories[index], ...updates };
  db.set('categories', categories);
  res.json(categories[index]);
});

router.delete('/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let categories = db.get('categories');
  categories = categories.filter(c => c.id !== id);
  db.set('categories', categories);
  res.json({ message: 'Category removed successfully', id });
});

// ----------------------------------------------------
// 4. COUPONS & DISCOUNTS
// ----------------------------------------------------
router.get('/coupons', (req: Request, res: Response) => {
  const coupons = db.get('coupons');
  res.json(coupons);
});

router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupons = db.get('coupons');
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim());

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }
  if (coupon.status !== 'active') {
    return res.status(400).json({ error: 'This coupon is inactive' });
  }
  if (new Date(coupon.expiryDate).getTime() < new Date().getTime()) {
    return res.status(400).json({ error: 'This coupon has expired' });
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Coupon usage limit reached' });
  }
  if (subtotal < coupon.minimumPurchase) {
    return res.status(400).json({
      error: `Minimum order amount of GH₵ ${coupon.minimumPurchase} required for this coupon`
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.value) / 100;
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
  } else {
    discountAmount = coupon.value;
  }

  res.json({
    valid: true,
    coupon,
    discountAmount: Math.min(discountAmount, subtotal)
  });
});

router.post('/coupons', (req: Request, res: Response) => {
  const couponData = req.body;
  if (!couponData.code || !couponData.value) {
    return res.status(400).json({ error: 'Coupon code and value are required' });
  }

  const coupons = db.get('coupons');
  const existing = coupons.find(c => c.code.toUpperCase() === couponData.code.toUpperCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'A coupon with this code already exists' });
  }

  const newCoupon: Coupon = {
    id: uid('cpn'),
    code: couponData.code.toUpperCase().trim(),
    discountType: couponData.discountType || 'percentage',
    value: parseFloat(couponData.value),
    minimumPurchase: parseFloat(couponData.minimumPurchase) || 0,
    maximumDiscount: couponData.maximumDiscount ? parseFloat(couponData.maximumDiscount) : undefined,
    startDate: couponData.startDate || new Date().toISOString().split('T')[0],
    expiryDate: couponData.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usageLimit: parseInt(couponData.usageLimit, 10) || 100,
    usageCount: 0,
    status: couponData.status || 'active'
  };

  coupons.unshift(newCoupon);
  db.set('coupons', coupons);
  res.status(201).json(newCoupon);
});

router.put('/coupons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const coupons = db.get('coupons');
  const index = coupons.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  coupons[index] = { ...coupons[index], ...updates };
  db.set('coupons', coupons);
  res.json(coupons[index]);
});

router.delete('/coupons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let coupons = db.get('coupons');
  coupons = coupons.filter(c => c.id !== id);
  db.set('coupons', coupons);
  res.json({ message: 'Coupon deleted', id });
});

// ----------------------------------------------------
// 5. ORDERS & CHECKOUT
// ----------------------------------------------------
router.post('/orders', (req: Request, res: Response) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    deliveryAddress,
    deliveryMethod,
    paymentMethod,
    couponCode,
    paymentReference
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }
  if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
    return res.status(400).json({ error: 'Customer and delivery information are required' });
  }

  const products = db.get('products');
  const settings = db.get('settings');

  // Validate stock quantities & calculate subtotal
  let subtotal = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.name || item.productId} no longer exists` });
    }
    if (product.stockQuantity < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
      });
    }
    subtotal += (item.price || product.discountPrice || product.price) * item.quantity;
  }

  // Calculate discount if coupon applied
  let discount = 0;
  if (couponCode) {
    const coupons = db.get('coupons');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && coupon.status === 'active') {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
      } else {
        discount = coupon.value;
      }
      coupon.usageCount += 1;
      db.set('coupons', coupons);
    }
  }

  // Delivery Fee
  let deliveryFee = settings.standardDeliveryFee;
  if (deliveryMethod === 'express') {
    deliveryFee = settings.expressDeliveryFee;
  } else if (deliveryMethod === 'store_pickup') {
    deliveryFee = 0;
  } else if (subtotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  // Tax
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * settings.taxRate;
  const total = Number((taxableAmount + deliveryFee + tax).toFixed(2));

  // Decrement inventory stock
  for (const item of items) {
    const productIndex = products.findIndex(p => p.id === item.productId);
    if (productIndex !== -1) {
      products[productIndex].stockQuantity = Math.max(0, products[productIndex].stockQuantity - item.quantity);
      products[productIndex].salesCount = (products[productIndex].salesCount || 0) + item.quantity;
    }
  }
  db.set('products', products);

  // Generate unique order number
  const orderNumber = generateOrderNumber();
  const orderId = uid('ord');
  const now = new Date().toISOString();

  // Create Order Record
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    userId: userId || undefined,
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    discount,
    couponCode: couponCode || undefined,
    deliveryFee,
    deliveryMethod: deliveryMethod || 'standard',
    tax: Number(tax.toFixed(2)),
    total,
    paymentMethod: paymentMethod || 'mtn_momo',
    paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'successful',
    paymentReference: paymentReference || `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    orderStatus: paymentMethod === 'cash_on_delivery' ? 'Order Placed' : 'Payment Confirmed',
    deliveryAddress,
    estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    trackingNumber: `TRK-${orderNumber}`,
    timeline: [
      { status: 'Order Placed', time: now, note: 'Order received in online store system' },
      ...(paymentMethod !== 'cash_on_delivery'
        ? [{ status: 'Payment Confirmed' as OrderStatus, time: now, note: `Payment verified via ${paymentMethod}` }]
        : [])
    ],
    createdAt: now,
    updatedAt: now
  };

  const orders = db.get('orders');
  orders.unshift(newOrder);
  db.set('orders', orders);

  // Create Payment Transaction Record
  const payments = db.get('payments');
  const newPayment: PaymentTransaction = {
    id: uid('pay'),
    orderId,
    orderNumber,
    transactionReference: newOrder.paymentReference || '',
    customerName,
    customerEmail,
    amount: total,
    currency: settings.currency,
    paymentMethod,
    provider: paymentMethod === 'mtn_momo' ? 'MTN MoMo Ghana' : paymentMethod === 'paystack' ? 'Paystack' : paymentMethod,
    status: newOrder.paymentStatus,
    createdAt: now
  };
  payments.unshift(newPayment);
  db.set('payments', payments);

  // Create notifications for customer & admin
  const notifications = db.get('notifications');
  if (userId) {
    notifications.unshift({
      id: uid('notif'),
      userId,
      target: 'customer',
      title: 'Order Confirmed! 🎉',
      message: `Your order #${orderNumber} for GH₵ ${total} has been confirmed.`,
      type: 'order',
      read: false,
      link: `/account/orders`,
      createdAt: now
    });
  }

  // Admin notification
  notifications.unshift({
    id: uid('notif'),
    target: 'admin',
    title: `New Order #${orderNumber}`,
    message: `${customerName} placed an order for GH₵ ${total} via ${paymentMethod}.`,
    type: 'order',
    read: false,
    link: `/admin/orders`,
    createdAt: now
  });
  db.set('notifications', notifications);

  res.status(201).json(newOrder);
});

router.get('/orders', (req: Request, res: Response) => {
  const { userId, status, search } = req.query;
  let orders = db.get('orders');

  if (userId) {
    orders = orders.filter(o => o.userId === userId);
  }

  if (status && status !== 'all') {
    orders = orders.filter(o => o.orderStatus.toLowerCase() === (status as string).toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q)
    );
  }

  res.json(orders);
});

router.get('/orders/:idOrNumber', (req: Request, res: Response) => {
  const { idOrNumber } = req.params;
  const orders = db.get('orders');
  const order = orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber || o.trackingNumber === idOrNumber);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

router.put('/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Order status is required' });
  }

  const orders = db.get('orders');
  const index = orders.findIndex(o => o.id === id || o.orderNumber === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const now = new Date().toISOString();
  const currentOrder = orders[index];

  currentOrder.orderStatus = status as OrderStatus;
  if (status === 'Delivered') {
    currentOrder.paymentStatus = 'successful';
  } else if (status === 'Cancelled') {
    // Return stock
    const products = db.get('products');
    for (const item of currentOrder.items) {
      const pIndex = products.findIndex(p => p.id === item.productId);
      if (pIndex !== -1) {
        products[pIndex].stockQuantity += item.quantity;
      }
    }
    db.set('products', products);
  }

  currentOrder.timeline.push({
    status: status as OrderStatus,
    time: now,
    note: note || `Status updated to ${status}`
  });
  currentOrder.updatedAt = now;

  db.set('orders', orders);

  // Send notification to customer
  if (currentOrder.userId) {
    const notifications = db.get('notifications');
    notifications.unshift({
      id: uid('notif'),
      userId: currentOrder.userId,
      target: 'customer',
      title: `Order Update #${currentOrder.orderNumber}`,
      message: `Your order status changed to: ${status}.`,
      type: 'order',
      read: false,
      link: '/account/orders',
      createdAt: now
    });
    db.set('notifications', notifications);
  }

  res.json(currentOrder);
});

// ----------------------------------------------------
// 6. REVIEWS
// ----------------------------------------------------
router.get('/reviews', (req: Request, res: Response) => {
  const { productId, status } = req.query;
  let reviews = db.get('reviews');

  if (productId) {
    reviews = reviews.filter(r => r.productId === productId);
  }
  if (status && status !== 'all') {
    reviews = reviews.filter(r => r.status === status);
  }

  res.json(reviews);
});

router.post('/reviews', (req: Request, res: Response) => {
  const { productId, userId, userName, rating, title, comment } = req.body;
  if (!productId || !rating || !title || !comment) {
    return res.status(400).json({ error: 'Product, rating, title and review comment are required' });
  }

  const products = db.get('products');
  const product = products.find(p => p.id === productId);

  const reviews = db.get('reviews');
  const newReview: Review = {
    id: uid('rev'),
    productId,
    productName: product?.name || 'Product',
    userId: userId || 'usr-anon',
    userName: userName || 'Verified Customer',
    userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'VC')}`,
    rating: Number(rating),
    title,
    comment,
    status: 'approved', // Auto approved for demo
    verifiedPurchase: true,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  db.set('reviews', reviews);

  // Recalculate product rating
  if (product) {
    const productReviews = reviews.filter(r => r.productId === productId && r.status === 'approved');
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Number(avg.toFixed(1));
    product.reviewCount = productReviews.length;
    db.set('products', products);
  }

  res.status(201).json(newReview);
});

router.put('/reviews/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const reviews = db.get('reviews');
  const review = reviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.status = status;
  db.set('reviews', reviews);
  res.json(review);
});

router.delete('/reviews/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let reviews = db.get('reviews');
  reviews = reviews.filter(r => r.id !== id);
  db.set('reviews', reviews);
  res.json({ message: 'Review deleted', id });
});

// ----------------------------------------------------
// 7. BANNERS
// ----------------------------------------------------
router.get('/banners', (req: Request, res: Response) => {
  const banners = db.get('banners');
  res.json(banners);
});

router.post('/banners', (req: Request, res: Response) => {
  const bannerData = req.body;
  const banners = db.get('banners');
  const newBanner: Banner = {
    id: uid('bnr'),
    title: bannerData.title || 'Special Promotion',
    subtitle: bannerData.subtitle,
    highlight: bannerData.highlight,
    message: bannerData.message,
    image: bannerData.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80',
    buttonText: bannerData.buttonText || 'Shop Now',
    destinationUrl: bannerData.destinationUrl || '/shop',
    position: bannerData.position || 'hero',
    status: bannerData.status || 'active',
    order: banners.length + 1
  };

  banners.push(newBanner);
  db.set('banners', banners);
  res.status(201).json(newBanner);
});

router.put('/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const banners = db.get('banners');
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  banners[index] = { ...banners[index], ...updates };
  db.set('banners', banners);
  res.json(banners[index]);
});

router.delete('/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let banners = db.get('banners');
  banners = banners.filter(b => b.id !== id);
  db.set('banners', banners);
  res.json({ message: 'Banner removed', id });
});

// ----------------------------------------------------
// 8. ADDRESSES
// ----------------------------------------------------
router.get('/addresses', (req: Request, res: Response) => {
  const { userId } = req.query;
  let addresses = db.get('addresses');
  if (userId) {
    addresses = addresses.filter(a => a.userId === userId);
  }
  res.json(addresses);
});

router.post('/addresses', (req: Request, res: Response) => {
  const addr = req.body;
  const addresses = db.get('addresses');

  if (addr.isDefault) {
    addresses.forEach(a => {
      if (a.userId === addr.userId) a.isDefault = false;
    });
  }

  const newAddress: DeliveryAddress = {
    id: uid('addr'),
    userId: addr.userId,
    name: addr.name,
    phone: addr.phone,
    email: addr.email,
    country: addr.country || 'Ghana',
    region: addr.region || 'Greater Accra',
    city: addr.city || 'Accra',
    address: addr.address,
    landmark: addr.landmark,
    deliveryInstructions: addr.deliveryInstructions,
    isDefault: addr.isDefault || addresses.filter(a => a.userId === addr.userId).length === 0
  };

  addresses.push(newAddress);
  db.set('addresses', addresses);
  res.status(201).json(newAddress);
});

router.put('/addresses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const addresses = db.get('addresses');
  const index = addresses.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Address not found' });
  }

  if (updates.isDefault) {
    addresses.forEach(a => {
      if (a.userId === addresses[index].userId) a.isDefault = false;
    });
  }

  addresses[index] = { ...addresses[index], ...updates };
  db.set('addresses', addresses);
  res.json(addresses[index]);
});

router.delete('/addresses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let addresses = db.get('addresses');
  addresses = addresses.filter(a => a.id !== id);
  db.set('addresses', addresses);
  res.json({ message: 'Address removed', id });
});

// ----------------------------------------------------
// 9. NOTIFICATIONS
// ----------------------------------------------------
router.get('/notifications', (req: Request, res: Response) => {
  const { userId, target } = req.query;
  let notifications = db.get('notifications');

  if (target === 'admin') {
    notifications = notifications.filter(n => n.target === 'admin' || n.target === 'all');
  } else if (userId) {
    notifications = notifications.filter(n => n.userId === userId || n.target === 'customer' || n.target === 'all');
  }

  res.json(notifications);
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notifications = db.get('notifications');
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    db.set('notifications', notifications);
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// 10. PAYMENTS LOG (ADMIN)
// ----------------------------------------------------
router.get('/payments', (req: Request, res: Response) => {
  const payments = db.get('payments');
  res.json(payments);
});

// ----------------------------------------------------
// 11. STORE SETTINGS
// ----------------------------------------------------
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.get('settings');
  res.json(settings);
});

router.put('/settings', (req: Request, res: Response) => {
  const updates = req.body;
  const current = db.get('settings');
  const updated = { ...current, ...updates };
  db.set('settings', updated);
  res.json(updated);
});

// ----------------------------------------------------
// 12. ADMIN ANALYTICS & REPORTS
// ----------------------------------------------------
router.get('/admin/analytics', (req: Request, res: Response) => {
  const orders = db.get('orders');
  const products = db.get('products');
  const users = db.get('users').filter(u => u.role === 'customer');
  const payments = db.get('payments');
  const categories = db.get('categories');

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'successful')
    .reduce((sum, o) => sum + o.total, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const revenueToday = orders
    .filter(o => o.paymentStatus === 'successful' && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  const thisMonthStr = todayStr.substring(0, 7);
  const revenueThisMonth = orders
    .filter(o => o.paymentStatus === 'successful' && o.createdAt.startsWith(thisMonthStr))
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Order Placed' || o.orderStatus === 'Payment Confirmed').length;
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Packed' || o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stockQuantity <= 0).length;
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;

  // Sales trend (Daily / Monthly)
  const salesByDayMap: Record<string, { date: string; revenue: number; orders: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    salesByDayMap[d] = { date: d.substring(5), revenue: 0, orders: 0 };
  }
  orders.forEach(o => {
    const day = o.createdAt.split('T')[0];
    if (salesByDayMap[day]) {
      salesByDayMap[day].revenue += o.total;
      salesByDayMap[day].orders += 1;
    }
  });

  const salesTrend = Object.values(salesByDayMap);

  // Orders by Status distribution
  const orderStatusStats = [
    { name: 'Pending', count: pendingOrders, color: '#f59e0b' },
    { name: 'Processing', count: processingOrders, color: '#3b82f6' },
    { name: 'Delivered', count: completedOrders, color: '#10b981' },
    { name: 'Cancelled', count: cancelledOrders, color: '#ef4444' }
  ];

  // Category sales breakdown
  const categorySales = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const catProductIds = new Set(catProducts.map(p => p.id));
    let catRevenue = 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        if (catProductIds.has(item.productId)) {
          catRevenue += item.total;
        }
      });
    });
    return {
      name: cat.name,
      value: catRevenue,
      productCount: catProducts.length
    };
  }).filter(c => c.value > 0 || c.productCount > 0);

  // Top selling products
  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      image: p.featuredImage,
      salesCount: p.salesCount || 0,
      revenue: (p.salesCount || 0) * (p.discountPrice || p.price),
      stock: p.stockQuantity
    }));

  // Payment methods breakdown
  const paymentMethodsBreakdown = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    metrics: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      revenueToday: Number(revenueToday.toFixed(2)),
      revenueThisMonth: Number(revenueThisMonth.toFixed(2)),
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers: users.length,
      totalProducts,
      outOfStock,
      lowStock
    },
    salesTrend,
    orderStatusStats,
    categorySales,
    topProducts,
    paymentMethodsBreakdown,
    recentOrders: orders.slice(0, 5),
    lowStockProducts: products.filter(p => p.stockQuantity <= 5)
  });
});

// ----------------------------------------------------
// 13. ADMIN CUSTOMERS & INVENTORY
// ----------------------------------------------------
router.get('/admin/customers', (req: Request, res: Response) => {
  const users = db.get('users').filter(u => u.role === 'customer');
  const orders = db.get('orders');

  const customerStats = users.map(user => {
    const userOrders = orders.filter(o => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase());
    const totalSpent = userOrders
      .filter(o => o.paymentStatus === 'successful')
      .reduce((sum, o) => sum + o.total, 0);

    const { passwordHash, ...userWithoutPass } = user;
    return {
      ...userWithoutPass,
      orderCount: userOrders.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastOrderDate: userOrders.length > 0 ? userOrders[0].createdAt : null
    };
  });

  res.json(customerStats);
});

// ----------------------------------------------------
// 14. PAYSTACK & GHANA PAYMENT GATEWAY INTEGRATIONS
// ----------------------------------------------------
router.post('/payments/paystack/initialize', (req: Request, res: Response) => {
  const { email, amount, orderId, paymentMethod, phone, channel } = req.body;
  if (!email || !amount) {
    return res.status(400).json({ error: 'Email and amount are required' });
  }

  const reference = `NVM-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const amountInPesewas = Math.round(parseFloat(amount) * 100);

  // Return standard Paystack initialization payload
  res.json({
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: `https://checkout.paystack.com/novamart-demo-${reference}`,
      access_code: `acc_${reference}`,
      reference,
      currency: 'GHS',
      amount: amountInPesewas,
      channels: channel ? [channel] : ['card', 'mobile_money'],
      mobileMoneyPrompt: {
        network: paymentMethod === 'mtn_momo' ? 'MTN' : paymentMethod === 'telecel_cash' ? 'Telecel (Vodafone)' : 'AT Money',
        phone: phone || '0240000000',
        instructions: `Please approve the prompt of GH₵ ${parseFloat(amount).toFixed(2)} on your mobile device.`
      }
    }
  });
});

router.post('/payments/paystack/verify', (req: Request, res: Response) => {
  const { reference, orderId } = req.body;
  if (!reference) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  const orders = db.get('orders');
  const payments = db.get('payments');
  const order = orders.find(o => o.paymentReference === reference || o.id === orderId || o.orderNumber === orderId);

  if (order) {
    order.paymentStatus = 'successful';
    order.orderStatus = 'Payment Confirmed';
    order.timeline.push({
      status: 'Payment Confirmed',
      time: new Date().toISOString(),
      note: `Verified via Paystack Ghana (Ref: ${reference})`
    });
    db.set('orders', orders);

    // Record or update payment record
    const existingPayment = payments.find(p => p.transactionReference === reference);
    if (!existingPayment) {
      payments.unshift({
        id: uid('pay'),
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        amount: order.total,
        currency: 'GHS',
        paymentMethod: order.paymentMethod,
        status: 'successful',
        transactionReference: reference,
        provider: 'Paystack Ghana',
        createdAt: new Date().toISOString()
      });
      db.set('payments', payments);
    }
  }

  res.json({
    status: true,
    message: 'Payment verified successfully',
    data: {
      reference,
      status: 'success',
      gateway_response: 'Successful',
      currency: 'GHS',
      paid_at: new Date().toISOString()
    }
  });
});

router.post('/webhooks/paystack', (req: Request, res: Response) => {
  const event = req.body;
  console.log('📡 [Paystack Webhook Received]:', event.event, event.data?.reference);

  if (event.event === 'charge.success') {
    const reference = event.data?.reference;
    const orders = db.get('orders');
    const order = orders.find(o => o.paymentReference === reference);
    if (order && order.paymentStatus !== 'successful') {
      order.paymentStatus = 'successful';
      order.orderStatus = 'Payment Confirmed';
      order.timeline.push({
        status: 'Payment Confirmed',
        time: new Date().toISOString(),
        note: 'Paystack webhook automated confirmation'
      });
      db.set('orders', orders);
    }
  }

  res.status(200).json({ received: true });
});

// ----------------------------------------------------
// 15. SMS & NOTIFICATIONS DISPATCHER
// ----------------------------------------------------
router.post('/notifications/send-sms', (req: Request, res: Response) => {
  const { phone, message, orderNumber, type } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const simulatedId = `sms-${Date.now()}`;

  console.log(`📱 [SMS DISPATCHED to ${phone}]: ${message} (Delivery OTP: ${otpCode})`);

  res.json({
    success: true,
    messageId: simulatedId,
    recipient: phone,
    otpCode,
    status: 'Delivered',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 16. BULK CSV TOOLS & INVENTORY RESTOCK
// ----------------------------------------------------
router.post('/admin/products/restock', (req: Request, res: Response) => {
  const { productId, quantity = 50 } = req.body;
  const products = db.get('products');
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index].stockQuantity += parseInt(quantity, 10);
  products[index].status = 'active';
  products[index].updatedAt = new Date().toISOString();
  db.set('products', products);

  res.json({ success: true, product: products[index] });
});

router.post('/admin/products/bulk-import', (req: Request, res: Response) => {
  const { products: newProductsList } = req.body;
  if (!Array.isArray(newProductsList) || !newProductsList.length) {
    return res.status(400).json({ error: 'Invalid product list for import' });
  }

  const products = db.get('products');
  let importedCount = 0;

  for (const item of newProductsList) {
    if (!item.name || !item.price) continue;
    const newProd: Product = {
      id: uid('prod'),
      name: item.name,
      slug: (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: item.brand || 'Original',
      description: item.description || item.name,
      shortDescription: item.shortDescription || item.name,
      price: parseFloat(item.price) || 100,
      discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : undefined,
      stockQuantity: parseInt(item.stockQuantity, 10) || 10,
      categoryId: item.categoryId || 'cat-phones',
      categoryName: item.categoryName || 'General',
      featuredImage: item.featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      images: [item.featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      featured: !!item.featured,
      specifications: [],
      isNewArrival: true,
      isBestSeller: false,
      rating: 5,
      reviewCount: 0,
      tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : ['imported', 'deals'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.unshift(newProd);
    importedCount++;
  }

  db.set('products', products);
  res.json({ success: true, importedCount });
});

// ----------------------------------------------------
// 17. VENDOR MANAGEMENT (FULL CRUD)
// ----------------------------------------------------
router.get('/vendors', (req: Request, res: Response) => {
  const { status } = req.query;
  let vendors = db.get('vendors');
  if (status && status !== 'all') {
    vendors = vendors.filter((v: any) => v.status === status);
  }
  const products = db.get('products');
  const orders = db.get('orders');
  const enriched = vendors.map((v: any) => {
    const vProds = products.filter((p: any) => p.vendorId === v.id);
    let totalRevenue = v.totalRevenue || 0;
    orders.forEach((o: any) => {
      o.items.forEach((item: any) => {
        if (item.vendorId === v.id) totalRevenue += item.total;
      });
    });
    return { ...v, totalProducts: vProds.length || v.totalProducts || 0, totalRevenue: Math.max(v.totalRevenue || 0, totalRevenue) };
  });
  res.json(enriched);
});

router.get('/vendors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const vendors = db.get('vendors');
  const vendor = vendors.find((v: any) => v.id === id || v.userId === id || v.slug === id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  res.json(vendor);
});

router.post('/vendors', (req: Request, res: Response) => {
  const data = req.body;
  const vendors = db.get('vendors');
  const users = db.get('users');

  const vendorId = uid('vend');
  const userId = uid('usr-seller');

  const newUser = {
    id: userId,
    firstName: data.ownerFirstName || data.ownerName?.split(' ')[0] || 'Seller',
    lastName: data.ownerLastName || data.ownerName?.split(' ')[1] || '',
    email: data.email,
    phone: data.phone,
    role: 'vendor' as const,
    vendorId,
    vendorStoreName: data.storeName,
    profileImage: data.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.storeName)}`,
    passwordHash: data.password || 'seller123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(newUser);
  db.set('users', users);

  const newVendor = {
    id: vendorId,
    userId,
    storeName: data.storeName,
    slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    ownerName: data.ownerName || `${data.ownerFirstName} ${data.ownerLastName}`,
    email: data.email,
    phone: data.phone,
    category: data.category || 'General',
    description: data.description || '',
    logo: data.logo || '',
    banner: data.banner || '',
    country: data.country || 'Ghana',
    countryCode: data.countryCode || 'GH',
    address: data.address || '',
    city: data.city || 'Accra',
    status: 'active',
    commissionRate: data.commissionRate || 10,
    payoutDetails: data.payoutDetails || { method: 'mtn_momo', accountName: '', accountNumber: '' },
    rating: 5.0,
    reviewCount: 0,
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    balance: 0,
    pendingBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  vendors.unshift(newVendor);
  db.set('vendors', vendors);
  res.status(201).json({ vendor: newVendor, user: { ...newUser, passwordHash: undefined } });
});

router.put('/vendors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const vendors = db.get('vendors');
  const idx = vendors.findIndex((v: any) => v.id === id || v.userId === id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  vendors[idx] = { ...vendors[idx], ...updates, updatedAt: new Date().toISOString() };
  db.set('vendors', vendors);
  res.json({ vendor: vendors[idx] });
});

router.put('/vendors/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const vendors = db.get('vendors');
  const idx = vendors.findIndex((v: any) => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  vendors[idx].status = 'active';
  vendors[idx].updatedAt = new Date().toISOString();
  db.set('vendors', vendors);
  const notifications = db.get('notifications');
  notifications.unshift({
    id: uid('notif'), userId: vendors[idx].userId, target: 'customer',
    title: 'Vendor Account Approved! 🎉',
    message: `Your store "${vendors[idx].storeName}" has been approved. You can now start listing products.`,
    type: 'system', read: false, createdAt: new Date().toISOString()
  });
  db.set('notifications', notifications);
  res.json({ vendor: vendors[idx] });
});

router.put('/vendors/:id/suspend', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const vendors = db.get('vendors');
  const idx = vendors.findIndex((v: any) => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  vendors[idx].status = 'suspended';
  vendors[idx].updatedAt = new Date().toISOString();
  db.set('vendors', vendors);
  res.json({ vendor: vendors[idx] });
});

router.delete('/vendors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let vendors = db.get('vendors');
  vendors = vendors.filter((v: any) => v.id !== id);
  db.set('vendors', vendors);
  res.json({ success: true, message: 'Vendor removed' });
});

router.get('/vendors/:id/products', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = db.get('products').filter((p: any) => p.vendorId === id);
  res.json({ products });
});

router.post('/vendors/:id/products', (req: Request, res: Response) => {
  const { id } = req.params;
  const productData = req.body;
  const products = db.get('products');
  const vendors = db.get('vendors');
  const vendor = vendors.find((v: any) => v.id === id);

  const newProd = {
    id: uid('prod'),
    name: productData.name,
    slug: (productData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
    description: productData.description || '',
    shortDescription: productData.shortDescription || '',
    categoryId: productData.categoryId || 'cat-phones',
    brand: productData.brand || vendor?.storeName || 'Generic',
    vendorId: id,
    vendorName: vendor?.storeName || 'Vendor',
    sku: productData.sku || `VND-${Math.floor(1000 + Math.random() * 9000)}`,
    price: parseFloat(productData.price) || 100,
    discountPrice: productData.discountPrice ? parseFloat(productData.discountPrice) : undefined,
    stockQuantity: parseInt(productData.stockQuantity, 10) || 10,
    status: productData.status || 'active',
    featured: !!productData.featured,
    rating: 5.0,
    reviewCount: 0,
    images: productData.images || [productData.featuredImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    featuredImage: productData.featuredImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    specifications: productData.specifications || [],
    tags: productData.tags || [],
    isNewArrival: true,
    isBestSeller: false,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.unshift(newProd);
  db.set('products', products);
  if (vendor) {
    const vIdx = vendors.findIndex((v: any) => v.id === id);
    if (vIdx !== -1) { vendors[vIdx].totalProducts = (vendors[vIdx].totalProducts || 0) + 1; db.set('vendors', vendors); }
  }
  res.status(201).json({ product: newProd });
});

router.put('/vendors/:vendorId/products/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const updates = req.body;
  const products = db.get('products');
  const idx = products.findIndex((p: any) => p.id === productId);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
  db.set('products', products);
  res.json({ product: products[idx] });
});

router.delete('/vendors/:vendorId/products/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  let products = db.get('products');
  products = products.filter((p: any) => p.id !== productId);
  db.set('products', products);
  res.json({ success: true });
});

router.get('/vendors/:id/orders', (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = db.get('orders').filter((o: any) => o.items.some((item: any) => item.vendorId === id || !item.vendorId));
  res.json(orders);
});

router.get('/vendors/:id/stats', (req: Request, res: Response) => {
  const { id } = req.params;
  const vendors = db.get('vendors');
  const products = db.get('products');
  const vendor = vendors.find((v: any) => v.id === id || v.userId === id);
  const vProds = products.filter((p: any) => p.vendorId === (vendor?.id || id));
  const lowStock = vProds.filter((p: any) => p.stockQuantity < 5).length;
  const commissionRate = vendor?.commissionRate || 10;
  const grossRevenue = vendor?.totalRevenue || 18450;
  const commissionPaid = (grossRevenue * commissionRate) / 100;
  res.json({
    grossRevenue, netEarnings: grossRevenue - commissionPaid, commissionPaid,
    ordersCount: vendor?.totalSales || 48, productsCount: vProds.length || vendor?.totalProducts || 12,
    lowStockCount: lowStock, rating: vendor?.rating || 4.8, reviewCount: vendor?.reviewCount || 64,
    balance: vendor?.balance || 3450, pendingBalance: vendor?.pendingBalance || 1200
  });
});

// Vendor Payouts
router.get('/vendors/:id/payouts', (req: Request, res: Response) => {
  const { id } = req.params;
  const payouts = db.get('payouts');
  res.json(payouts.filter((p: any) => p.vendorId === id));
});

router.post('/vendors/:id/payouts', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, payoutDetails, notes } = req.body;
  const vendors = db.get('vendors');
  const vIdx = vendors.findIndex((v: any) => v.id === id || v.userId === id);
  const vendor = vendors[vIdx];
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  if ((vendor.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient available balance' });

  const payouts = db.get('payouts');
  const newPayout = {
    id: uid('pay'),
    vendorId: vendor.id,
    vendorName: vendor.storeName,
    amount,
    status: 'pending',
    payoutDetails: payoutDetails || vendor.payoutDetails,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  payouts.unshift(newPayout);
  db.set('payouts', payouts);

  vendors[vIdx].balance = Math.max(0, (vendors[vIdx].balance || 0) - amount);
  vendors[vIdx].pendingBalance = (vendors[vIdx].pendingBalance || 0) + amount;
  db.set('vendors', vendors);
  res.status(201).json({ payout: newPayout });
});

// Admin payout management
router.get('/admin/vendor-payouts', (req: Request, res: Response) => {
  const { status } = req.query;
  let payouts = db.get('payouts');
  if (status && status !== 'all') payouts = payouts.filter((p: any) => p.status === status);
  res.json(payouts);
});

router.put('/admin/vendor-payouts/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { transactionRef } = req.body;
  const payouts = db.get('payouts');
  const idx = payouts.findIndex((p: any) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Payout not found' });

  payouts[idx].status = 'completed';
  payouts[idx].transactionRef = transactionRef || `REF-${Date.now()}`;
  payouts[idx].processedAt = new Date().toISOString();
  db.set('payouts', payouts);

  // Update vendor balances
  const vendors = db.get('vendors');
  const vIdx = vendors.findIndex((v: any) => v.id === payouts[idx].vendorId);
  if (vIdx !== -1) {
    vendors[vIdx].pendingBalance = Math.max(0, (vendors[vIdx].pendingBalance || 0) - payouts[idx].amount);
    db.set('vendors', vendors);
  }
  res.json({ payout: payouts[idx] });
});

router.put('/admin/vendor-payouts/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const payouts = db.get('payouts');
  const idx = payouts.findIndex((p: any) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Payout not found' });

  payouts[idx].status = 'rejected';
  payouts[idx].notes = reason || 'Rejected by admin';
  payouts[idx].processedAt = new Date().toISOString();
  db.set('payouts', payouts);

  // Return balance to vendor
  const vendors = db.get('vendors');
  const vIdx = vendors.findIndex((v: any) => v.id === payouts[idx].vendorId);
  if (vIdx !== -1) {
    vendors[vIdx].balance = (vendors[vIdx].balance || 0) + payouts[idx].amount;
    vendors[vIdx].pendingBalance = Math.max(0, (vendors[vIdx].pendingBalance || 0) - payouts[idx].amount);
    db.set('vendors', vendors);
  }
  res.json({ payout: payouts[idx] });
});

// Order Return Requests
router.post('/orders/:id/return-request', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, items, refundPreference, additionalNotes } = req.body;
  const orders = db.get('orders');
  const order = orders.find((o: any) => o.id === id || o.orderNumber === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const returnRequests = db.get('returnRequests') || [];
  const newRequest = {
    id: uid('ret'),
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: items || order.items,
    reason,
    refundPreference: refundPreference || 'original_method',
    additionalNotes: additionalNotes || '',
    status: 'pending',
    refundAmount: order.total,
    createdAt: new Date().toISOString()
  };
  returnRequests.unshift(newRequest);
  db.set('returnRequests', returnRequests);

  // Notify admin
  const notifications = db.get('notifications');
  notifications.unshift({
    id: uid('notif'), target: 'admin',
    title: `Return Request #${order.orderNumber}`,
    message: `${order.customerName} requested a return for order #${order.orderNumber}. Reason: ${reason}`,
    type: 'order', read: false, link: '/admin/orders', createdAt: new Date().toISOString()
  });
  db.set('notifications', notifications);
  res.status(201).json({ returnRequest: newRequest });
});

router.get('/admin/return-requests', (req: Request, res: Response) => {
  const returnRequests = db.get('returnRequests') || [];
  res.json(returnRequests);
});

router.put('/admin/return-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNote, refundAmount } = req.body;
  const returnRequests = db.get('returnRequests') || [];
  const idx = returnRequests.findIndex((r: any) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Return request not found' });
  returnRequests[idx] = { ...returnRequests[idx], status, adminNote, refundAmount: refundAmount || returnRequests[idx].refundAmount, processedAt: new Date().toISOString() };
  db.set('returnRequests', returnRequests);
  if (status === 'approved' && returnRequests[idx].customerId) {
    const notifications = db.get('notifications');
    notifications.unshift({
      id: uid('notif'), userId: returnRequests[idx].customerId, target: 'customer',
      title: 'Return Request Approved ✅',
      message: `Your return request for order #${returnRequests[idx].orderNumber} has been approved. Refund will be processed within 3-5 business days.`,
      type: 'order', read: false, createdAt: new Date().toISOString()
    });
    db.set('notifications', notifications);
  }
  res.json({ returnRequest: returnRequests[idx] });
});

// Loyalty Points
router.get('/users/:id/loyalty', (req: Request, res: Response) => {
  const { id } = req.params;
  const loyalty = db.get('loyalty') || [];
  const userPoints = loyalty.filter((l: any) => l.userId === id);
  const balance = userPoints.filter((l: any) => l.type === 'earn').reduce((s: number, l: any) => s + l.points, 0)
    - userPoints.filter((l: any) => l.type === 'redeem').reduce((s: number, l: any) => s + l.points, 0);
  res.json({ balance, history: userPoints.slice(0, 20) });
});

router.post('/users/:id/loyalty/redeem', (req: Request, res: Response) => {
  const { id } = req.params;
  const { points } = req.body;
  const loyalty = db.get('loyalty') || [];
  const userPoints = loyalty.filter((l: any) => l.userId === id);
  const balance = userPoints.filter((l: any) => l.type === 'earn').reduce((s: number, l: any) => s + l.points, 0)
    - userPoints.filter((l: any) => l.type === 'redeem').reduce((s: number, l: any) => s + l.points, 0);
  if (balance < points) return res.status(400).json({ error: 'Insufficient loyalty points' });
  loyalty.unshift({ id: uid('lty'), userId: id, type: 'redeem', points, description: 'Points redeemed at checkout', createdAt: new Date().toISOString() });
  db.set('loyalty', loyalty);
  const discountAmount = points / 10; // 10 points = GH₵ 1
  res.json({ success: true, pointsRedeemed: points, discountAmount });
});

// Audit Log
router.get('/admin/audit-log', (req: Request, res: Response) => {
  const log = db.get('auditLog') || [];
  res.json(log.slice(0, 100));
});

// ----------------------------------------------------
// 18. GEMINI AI SHOPPING ASSISTANT & STYLIST
// ----------------------------------------------------
router.post('/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const products = db.get('products').filter(p => p.status === 'active');
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const catalogSummary = products.slice(0, 40).map(p => 
        `[${p.id}] ${p.name} | Category: ${p.categoryName} | Price: GH₵ ${p.discountPrice || p.price} | Brand: ${p.brand}`
      ).join('\n');

      const systemPrompt = `You are NovaAI, the elite, multi-task shopping copilot and concierge for NovaMart (West Africa's Premier Online Superstore across Ghana 🇬🇭 and Nigeria 🇳🇬).

You have full authority to assist users with:
1. Store & Platform Inquiries: Explain what NovaMart is, verified multi-vendor marketplace, authenticity guarantee.
2. Product Recommendations & Comparisons: Search, compare specifications, and recommend items based on budget and intent.
3. Order Tracking: Explain dispatch timelines, courier tracking, and return policies.
4. Discounts & Coupons: Share the active WELCOME10 coupon (10% off).
5. Seller Onboarding: Guide merchants on how to become a verified vendor.
6. Payments & Logistics: Mobile Money (MTN, Telecel), Cards, Bank Transfers, COD, and express 24-48h delivery.

Catalog Snapshot:
${catalogSummary}

Format responses with crisp markdown, bullet points, and emojis. Always be welcoming and proactive with actionable suggestions.`;

      let replyText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
          ]
        });
        replyText = response.text || '';
      } catch (sdkErr: any) {
        console.warn('SDK call error, attempting direct REST fallback:', sdkErr?.message || sdkErr);
        // Direct REST fallback
        const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }]
          })
        });
        const restJson: any = await restRes.json();
        replyText = restJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      const matchedProducts = products.filter(p => 
        replyText.toLowerCase().includes(p.name.toLowerCase().slice(0, 15)) ||
        replyText.includes(p.id)
      ).slice(0, 3);

      return res.json({
        success: true,
        source: 'gemini',
        text: replyText,
        products: matchedProducts.length > 0 ? matchedProducts : undefined
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, using enhanced local engine:', err?.message || err);
    }
  }

  // Enhanced multi-intent local intelligence engine
  const q = message.toLowerCase().trim();

  // 1. About the site / Platform overview
  if (q.includes('about this site') || q.includes('about us') || q.includes('what is this site') || q.includes('tell me about this site') || q.includes('what is novamart') || q.includes('who owns') || q.includes('what do you sell')) {
    return res.json({
      success: true,
      source: 'local-smart',
      text: `🇬🇭🇳🇬 **Welcome to NovaMart!**\n\n**NovaMart** is West Africa's premier multi-vendor online superstore and marketplace serving Ghana and Nigeria.\n\n### 🌟 What We Offer:\n• 📱 **Tech & Electronics**: Genuine smartphones, high-performance laptops, noise-cancelling audio, and accessories.\n• 🍳 **Home & Kitchen**: Premium air fryers, portable blenders, heavy-duty pressure washers, and smart home appliances.\n• 👗 **Fashion & Accessories**: Genuine full-grain leather belts, footwear, and apparel.\n• ✨ **Beauty & Niche Fragrances**: Authentic Extrait de Parfum, pocket travel atomizers, and skincare.\n• 🏃 **Health & Fitness**: Digital blood pressure monitors, snatch waist trainers, and wellness essentials.\n\n### 🛡️ Why Shop With Us?\n• **100% Authenticity Guarantee**: Every single item is QC-inspected.\n• **Express Nationwide Delivery**: 24–48h delivery to Accra/Kumasi and Lagos/Abuja.\n• **Flexible Payments**: MTN MoMo, Telecel Cash, NIP Bank Transfer, Debit Cards & Cash on Delivery.\n• **7-Day Hassle-Free Returns**.\n\nHow can I help you shop today? Try asking for deals, tracking an order, or finding a gift!`
    });
  }

  // 2. Greetings
  if (['hi', 'hello', 'hey', 'hey there', 'good morning', 'good afternoon', 'good evening', 'how are you', 'whats up'].includes(q)) {
    return res.json({
      success: true,
      source: 'local-smart',
      text: `Hello there! 👋 Welcome to **NovaMart**. How can I help you today?\n\nI can assist you with:\n• 🔍 Finding top-rated products & deals\n• 🛒 Adding items directly to your bag\n• 📦 Tracking your active orders in real-time\n• 🏷️ Providing active discount codes (like \`WELCOME10\`)\n• 🚚 Delivery & payment options across Ghana & Nigeria\n\nWhat would you like to explore?`
    });
  }

  // 3. Become a Seller / Vendor
  if (q.includes('seller') || q.includes('vendor') || q.includes('sell on') || q.includes('merchant') || q.includes('open store')) {
    return res.json({
      success: true,
      source: 'local-smart',
      text: `🏪 **Sell on NovaMart Marketplace!**\n\nJoin hundreds of verified merchants reaching over 50,000+ active shoppers across Ghana and Nigeria.\n\n### 🚀 Seller Benefits:\n• **Zero Setup Fee**: Launch your online storefront in under 5 minutes.\n• **Integrated Logistics**: We handle rider dispatch and nationwide cash-on-delivery.\n• **Fast Payouts**: Automated weekly payouts directly to your MoMo or Bank Account.\n• **Vendor Dashboard**: Real-time sales analytics, inventory manager, and customer review center.\n\n👉 Click **"Become a Seller"** in the top navigation bar or footer to register your store today!`
    });
  }

  // 4. Contact / Customer Support
  if (q.includes('contact') || q.includes('support') || q.includes('phone') || q.includes('help desk') || q.includes('customer service') || q.includes('call') || q.includes('email')) {
    return res.json({
      success: true,
      source: 'local-smart',
      text: `📞 **NovaMart Customer Care & Concierge**\n\nOur support team is available **Monday to Saturday (8:00 AM – 8:00 PM)**:\n\n• **Ghana Hotline**: +233 (0) 302 998 844\n• **Nigeria Hotline**: +234 (0) 1 888 3920\n• **WhatsApp Support**: +233 55 123 4567\n• **Email**: support@novamart.gh\n• **HQ Address**: Nova Plaza, Airport Commercial Area, Accra, Ghana\n\nYou can also message me directly anytime for instant answers!`
    });
  }

  // 5. Gifts & Recommendations
  if (q.includes('gift') || q.includes('recommend') || q.includes('present') || q.includes('birthday') || q.includes('wedding')) {
    const giftItems = products.filter(p => ['prod-baccarat-rouge-540', 'prod-sony-wh1000xm5', 'prod-leather-belts', 'prod-portable-blender'].includes(p.id));
    return res.json({
      success: true,
      source: 'local-smart',
      text: `🎁 **Curated Gift Recommendations for You:**\n\nHere are our top-rated, crowd-pleaser gifts guaranteed to impress:\n1. 🌟 **Baccarat Rouge 540 Extrait (70ml)**: Iconic luxury perfume with Egyptian Jasmine & Ambergris.\n2. 🎧 **Sony WH-1000XM5 ANC Headphones**: World-class wireless audio with 30hr battery.\n3. 👔 **Genuine Leather 3-Piece Belt Set**: Handcrafted full-grain leather gift box.\n4. 🥤 **Portable USB Rechargeable Blender**: Healthy on-the-go smoothies in seconds.`,
      products: giftItems.length > 0 ? giftItems : products.slice(0, 3)
    });
  }

  // 6. Product Matching
  const stopWords = ['can', 'you', 'tell', 'me', 'about', 'this', 'site', 'show', 'the', 'what', 'are', 'is', 'a', 'an', 'in', 'for', 'with', 'and'];
  const keywords = q.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));

  const matched = keywords.length > 0 ? products.filter(p => {
    const text = `${p.name} ${p.categoryName} ${p.brand} ${(p.tags || []).join(' ')}`.toLowerCase();
    return keywords.some(w => text.includes(w));
  }).slice(0, 3) : [];

  return res.json({
    success: true,
    source: 'local-smart',
    text: matched.length > 0
      ? `Here are top recommendations from our active store catalog matching **"${keywords.join(' ')}"**:`
      : `I am your **NovaMart Shopping Assistant** and can help with anything in our store! 🛍️\n\nYou can ask me to:\n• 🔍 Find products by category or brand\n• 🛒 Add items directly to your cart\n• 📦 Track your orders\n• 🏷️ Apply discounts and coupons\n• 🚚 Explain delivery and payment options\n\nWhat are you looking for today?`,
    products: matched.length > 0 ? matched : undefined
  });
});


export default router;
