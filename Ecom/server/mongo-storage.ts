import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  CartItem, InsertCartItem 
} from '@shared/schema';
import { IStorage } from './storage';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';
import session from 'express-session';
import connectMongo from 'connect-mongo';

// MongoStore for session management
export class MongoDBStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    try {
      const MongoStore = connectMongo;
      this.sessionStore = new MongoStore({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'oanshop',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        autoRemove: 'native'
      });
      
      console.log("MongoDB session store initialized");
    } catch (error) {
      console.error("Error initializing MongoDB session store:", error);
      // Create a minimal in-memory session store as fallback
      this.sessionStore = {
        get: (id, cb) => cb(null, null),
        set: (id, session, cb) => cb?.(null),
        destroy: (id, cb) => cb?.(null),
        all: (cb) => cb(null, []),
        touch: (id, session, cb) => cb?.(null)
      };
      console.log("Using in-memory session store fallback");
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = getDb();
    if (!db) {
      console.error("Cannot get user: MongoDB not connected");
      return undefined;
    }
    
    try {
      const user = await db.collection('users').findOne({ id });
      return user || undefined;
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = getDb();
    if (!db) {
      console.error("Cannot get user by username: MongoDB not connected");
      return undefined;
    }
    
    try {
      const user = await db.collection('users').findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = getDb();
    if (!db) {
      console.error("Cannot get user by email: MongoDB not connected");
      return undefined;
    }
    
    try {
      const user = await db.collection('users').findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const db = getDb();
    if (!db) {
      console.error("Cannot create user: MongoDB not connected");
      throw new Error("Database connection error");
    }
    
    try {
      // Check for existing users with the same username or email
      const existingUser = await db.collection('users').findOne({
        $or: [
          { username: insertUser.username },
          { email: insertUser.email }
        ]
      });
      
      if (existingUser) {
        const field = existingUser.username === insertUser.username ? 'username' : 'email';
        throw new Error(`User with this ${field} already exists`);
      }
      
      // Get the next ID
      const totalUsers = await db.collection('users').countDocuments();
      
      const user: User = {
        id: totalUsers + 1,
        username: insertUser.username,
        email: insertUser.email,
        password: insertUser.password,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        isAdmin: insertUser.isAdmin || false,
        createdAt: new Date()
      };
      
      await db.collection('users').insertOne(user);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    const db = getDb();
    return db.collection('categories').find().toArray() as Promise<Category[]>;
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const db = getDb();
    const category = await db.collection('categories').findOne({ id });
    return category || undefined;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const db = getDb();
    const totalCategories = await db.collection('categories').countDocuments();
    
    const category: Category = {
      id: totalCategories + 1,
      name: insertCategory.name,
      description: insertCategory.description || null,
      imageUrl: insertCategory.imageUrl || null,
      slug: insertCategory.slug
    };
    
    await db.collection('categories').insertOne(category);
    return category;
  }
  
  // Product operations
  async getProducts(options: {
    categoryId?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    const db = getDb();
    const { categoryId, isFeatured, isBestSeller, page = 1, limit = 12 } = options;
    
    const query: any = {};
    if (categoryId) query.categoryId = categoryId;
    if (isFeatured) query.isFeatured = isFeatured;
    if (isBestSeller) query.isBestSeller = isBestSeller;
    
    return db.collection('products')
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray() as Promise<Product[]>;
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const db = getDb();
    const product = await db.collection('products').findOne({ id });
    return product || undefined;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const db = getDb();
    const totalProducts = await db.collection('products').countDocuments();
    
    const product: Product = {
      id: totalProducts + 1,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      compareAtPrice: insertProduct.compareAtPrice || null,
      categoryId: insertProduct.categoryId || null,
      inventoryCount: insertProduct.inventoryCount || null,
      imageUrl: insertProduct.imageUrl,
      imageUrls: insertProduct.imageUrls || [],
      rating: insertProduct.rating || 0,
      isFeatured: insertProduct.isFeatured || false,
      isBestSeller: insertProduct.isBestSeller || false,
      isNew: insertProduct.isNew || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('products').insertOne(product);
    return product;
  }
  
  async updateProduct(id: number, updateProduct: InsertProduct): Promise<Product | undefined> {
    const db = getDb();
    const product = await this.getProductById(id);
    
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      name: updateProduct.name,
      description: updateProduct.description,
      price: updateProduct.price,
      compareAtPrice: updateProduct.compareAtPrice || null,
      categoryId: updateProduct.categoryId || null,
      inventoryCount: updateProduct.inventoryCount || null,
      imageUrl: updateProduct.imageUrl,
      imageUrls: updateProduct.imageUrls || [],
      rating: updateProduct.rating || 0,
      isFeatured: updateProduct.isFeatured || false,
      isBestSeller: updateProduct.isBestSeller || false,
      isNew: updateProduct.isNew || false,
      updatedAt: new Date()
    };
    
    await db.collection('products').updateOne({ id }, { $set: updatedProduct });
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.collection('products').deleteOne({ id });
    return result.deletedCount === 1;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const db = getDb();
    const cartItems = await db.collection('cart_items').find({ userId }).toArray() as CartItem[];
    
    const result: (CartItem & { product: Product })[] = [];
    
    for (const item of cartItems) {
      const product = await this.getProductById(item.productId);
      if (product) {
        result.push({
          ...item,
          product
        });
      }
    }
    
    return result;
  }
  
  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem & { product: Product }> {
    const db = getDb();
    
    // Check if the item already exists in the cart
    const existingItem = await db.collection('cart_items').findOne({ userId, productId });
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      const updatedItem: CartItem = {
        ...existingItem,
        quantity: newQuantity,
      };
      
      await db.collection('cart_items').updateOne(
        { id: existingItem.id },
        { $set: { quantity: newQuantity } }
      );
      
      const product = await this.getProductById(productId);
      return { ...updatedItem, product: product! };
    }
    
    // Create new cart item
    const totalCartItems = await db.collection('cart_items').countDocuments();
    
    const cartItem: CartItem = {
      id: totalCartItems + 1,
      userId,
      productId,
      quantity,
      createdAt: new Date()
    };
    
    await db.collection('cart_items').insertOne(cartItem);
    const product = await this.getProductById(productId);
    
    return { ...cartItem, product: product! };
  }
  
  async updateCartItem(userId: number, itemId: number, quantity: number): Promise<(CartItem & { product: Product }) | undefined> {
    const db = getDb();
    const cartItem = await db.collection('cart_items').findOne({ id: itemId, userId });
    
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = {
      ...cartItem,
      quantity
    };
    
    await db.collection('cart_items').updateOne(
      { id: itemId, userId },
      { $set: { quantity } }
    );
    
    const product = await this.getProductById(cartItem.productId);
    return { ...updatedItem, product: product! };
  }
  
  async removeFromCart(userId: number, itemId: number): Promise<boolean> {
    const db = getDb();
    const result = await db.collection('cart_items').deleteOne({ id: itemId, userId });
    return result.deletedCount === 1;
  }
  
  async clearCart(userId: number): Promise<void> {
    const db = getDb();
    await db.collection('cart_items').deleteMany({ userId });
  }
  
  // Order operations
  async getAllOrders(): Promise<Order[]> {
    const db = getDb();
    return db.collection('orders').find().sort({ createdAt: -1 }).toArray() as Promise<Order[]>;
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    const db = getDb();
    return db.collection('orders').find({ userId }).sort({ createdAt: -1 }).toArray() as Promise<Order[]>;
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const db = getDb();
    const order = await db.collection('orders').findOne({ id }) as Order;
    
    if (!order) return undefined;
    
    const orderItems = await db.collection('order_items').find({ orderId: id }).toArray() as OrderItem[];
    
    const items: (OrderItem & { product: Product })[] = [];
    
    for (const item of orderItems) {
      const product = await this.getProductById(item.productId);
      if (product) {
        items.push({
          ...item,
          product
        });
      }
    }
    
    return {
      ...order,
      items
    };
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const db = getDb();
    const totalOrders = await db.collection('orders').countDocuments();
    
    const order: Order = {
      id: totalOrders + 1,
      userId: insertOrder.userId,
      status: insertOrder.status,
      total: insertOrder.total,
      subTotal: insertOrder.subTotal,
      tax: insertOrder.tax,
      shippingAddress: insertOrder.shippingAddress,
      billingAddress: insertOrder.billingAddress,
      paymentIntentId: insertOrder.paymentIntentId || null,
      createdAt: new Date()
    };
    
    await db.collection('orders').insertOne(order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const db = getDb();
    const order = await db.collection('orders').findOne({ id });
    
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      status
    };
    
    await db.collection('orders').updateOne({ id }, { $set: { status } });
    return updatedOrder;
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const db = getDb();
    const totalOrderItems = await db.collection('order_items').countDocuments();
    
    const orderItem: OrderItem = {
      id: totalOrderItems + 1,
      orderId: insertOrderItem.orderId,
      productId: insertOrderItem.productId,
      name: insertOrderItem.name,
      price: insertOrderItem.price,
      quantity: insertOrderItem.quantity,
      total: insertOrderItem.total
    };
    
    await db.collection('order_items').insertOne(orderItem);
    return orderItem;
  }
  
  // Initialize with demo data
  async initDemoData(): Promise<void> {
    const db = getDb();
    
    // Create unique indexes
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Only initialize if collections are empty
    const usersCount = await db.collection('users').countDocuments();
    const categoriesCount = await db.collection('categories').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    
    if (usersCount > 0 && categoriesCount > 0 && productsCount > 0) {
      console.log('Database already has data, skipping initialization');
      return;
    }
    
    // Clean collections before initialization to prevent duplicates
    if (usersCount > 0) {
      console.log('Cleaning existing users collection');
      await db.collection('users').deleteMany({});
    }
    if (categoriesCount > 0) {
      console.log('Cleaning existing categories collection');
      await db.collection('categories').deleteMany({});
    }
    if (productsCount > 0) {
      console.log('Cleaning existing products collection');
      await db.collection('products').deleteMany({});
    }
    
    // Create admin user
    const adminPassword = '$2b$10$XmpPQc.MJ2K7CZ1RKCCmkeb0xLOu0HrtMXCNFtXzC9cqXi35ZRKNS.0b7cad3c';
    
    const adminUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword, // hashed password for 'admin123'
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(adminUser);
    
    // Create categories with high-quality local images
    const categories = [
      { 
        name: 'Electronics', 
        description: 'Electronic devices and accessories including smartphones, laptops, cameras, and audio equipment.', 
        slug: 'electronics',
        imageUrl: '/images/categories/electronics.jpg' 
      },
      { 
        name: 'Clothing', 
        description: 'Fashion items including clothes, shoes, and accessories for all seasons.', 
        slug: 'clothing',
        imageUrl: '/images/categories/clothing.jpg' 
      },
      { 
        name: 'Home & Kitchen', 
        description: 'Furniture, decor, kitchen appliances, and home improvement items.', 
        slug: 'home-kitchen',
        imageUrl: '/images/categories/home.jpg' 
      }
    ];
    
    for (let i = 0; i < categories.length; i++) {
      const categoryData = categories[i];
      const id = i + 1;
      const category: Category = { 
        ...categoryData, 
        id,
        description: categoryData.description,
        imageUrl: categoryData.imageUrl
      };
      await db.collection('categories').insertOne(category);
    }
    
    // Create products with high-quality local images
    const products = [
      {
        name: 'Premium Watch',
        description: 'Elegant watch with a genuine leather strap, scratch-resistant sapphire crystal, and water resistance up to 100 meters. Perfect for both casual and formal occasions.',
        price: '199.99',
        compareAtPrice: '249.99',
        categoryId: 1,
        inventory: 45,
        imageUrl: '/images/products/watch.jpg',
        imageUrls: ['/images/products/watch.jpg'],
        isFeatured: true,
        isBestSeller: true,
        isNew: false
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium audio drivers for an immersive listening experience.',
        price: '149.99',
        compareAtPrice: '199.99',
        categoryId: 1,
        inventory: 78,
        imageUrl: '/images/products/headphones.jpg',
        imageUrls: ['/images/products/headphones.jpg'],
        isFeatured: true,
        isBestSeller: false,
        isNew: true
      },
      {
        name: 'Flagship Smartphone',
        description: 'Latest flagship smartphone with 6.7" AMOLED display, 5G connectivity, 128GB storage, 8GB RAM, and a professional-grade camera system.',
        price: '799.99',
        compareAtPrice: '899.99',
        categoryId: 1,
        inventory: 50,
        imageUrl: '/images/products/smartphone.jpg',
        imageUrls: ['/images/products/smartphone.jpg'],
        isFeatured: true,
        isBestSeller: true,
        isNew: true
      },
      {
        name: 'Digital Camera',
        description: 'Professional digital mirrorless camera with 24.2MP sensor, 4K video recording, 5-axis image stabilization, and an intuitive touchscreen interface.',
        price: '599.99',
        compareAtPrice: '699.99',
        categoryId: 1,
        inventory: 25,
        imageUrl: '/images/products/camera.jpg',
        imageUrls: ['/images/products/camera.jpg'],
        isFeatured: true,
        isBestSeller: false,
        isNew: true
      },
      {
        name: 'Ultrabook Laptop',
        description: 'Ultra-thin, lightweight laptop with a powerful processor, 16GB RAM, 512GB SSD, vibrant display, and all-day battery life. Perfect for professionals and students.',
        price: '1099.99',
        compareAtPrice: '1299.99',
        categoryId: 1,
        inventory: 15,
        imageUrl: '/images/products/laptop.jpg',
        imageUrls: ['/images/products/laptop.jpg'],
        isFeatured: true,
        isBestSeller: true,
        isNew: false
      }
    ];
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const id = i + 1;
      const product: Product = { 
        ...productData, 
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('products').insertOne(product);
    }
    
    console.log('Demo data initialized successfully');
  }
}