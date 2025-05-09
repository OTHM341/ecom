import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  CartItem, InsertCartItem 
} from '@shared/schema';
import { db } from './db';
import { eq, and, SQL, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { users, products, categories, orders, orderItems, cartItems } from '@shared/schema';
import * as session from 'express-session';
import PgSession from 'connect-pg-simple';
import { Pool } from '@neondatabase/serverless';
import * as bcrypt from 'bcrypt';

// The IStorage interface provides the contract for database operations
export interface IStorage {
  sessionStore: any; // Store for session management
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(options: {
    categoryId?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(userId: number, productId: number, quantity: number): Promise<CartItem & { product: Product }>;
  updateCartItem(userId: number, itemId: number, quantity: number): Promise<(CartItem & { product: Product }) | undefined>;
  removeFromCart(userId: number, itemId: number): Promise<boolean>;
  clearCart(userId: number): Promise<void>;
  
  // Order operations
  getAllOrders(): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Demo data (useful for testing and development)
  initDemoData(): Promise<void>;
}

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PgStore = PgSession(session);
    this.sessionStore = new PgStore({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
      tableName: 'session',
      createTableIfMissing: true,
    });
    console.log("PostgreSQL storage initialized");
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      return [];
    }
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return undefined;
    }
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const [category] = await db.insert(categories).values(insertCategory).returning();
      return category;
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  }
  
  // Product operations
  async getProducts(options: {
    categoryId?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    try {
      const { categoryId, isFeatured, isBestSeller, page = 1, limit = 12 } = options;
      const offset = (page - 1) * limit;
      
      let whereConditions: SQL[] = [];
      
      if (categoryId) {
        whereConditions.push(eq(products.categoryId, categoryId));
      }
      
      if (isFeatured) {
        whereConditions.push(eq(products.isFeatured, true));
      }
      
      if (isBestSeller) {
        whereConditions.push(eq(products.isBestSeller, true));
      }
      
      const query = db.select().from(products);
      
      if (whereConditions.length > 0) {
        for (const condition of whereConditions) {
          query.where(condition);
        }
      }
      
      return await query.limit(limit).offset(offset);
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error("Error in getProductById:", error);
      return undefined;
    }
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const [product] = await db.insert(products).values(insertProduct).returning();
      return product;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  }
  
  async updateProduct(id: number, updateProduct: InsertProduct): Promise<Product | undefined> {
    try {
      const [product] = await db
        .update(products)
        .set(updateProduct)
        .where(eq(products.id, id))
        .returning();
      return product;
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return undefined;
    }
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      return false;
    }
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    try {
      // Join cart items with products
      const result = await db
        .select({
          cartItem: cartItems,
          product: products
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, userId));
      
      // Transform the result to match the expected return type
      return result.map(row => ({
        ...row.cartItem,
        product: row.product
      }));
    } catch (error) {
      console.error("Error in getCartItems:", error);
      return [];
    }
  }
  
  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem & { product: Product }> {
    try {
      // Check if the item already exists in the cart
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ));
      
      let cartItem: CartItem;
      
      if (existingItem) {
        // Update existing item
        const [updatedItem] = await db
          .update(cartItems)
          .set({ quantity: existingItem.quantity + quantity })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
        cartItem = updatedItem;
      } else {
        // Create new item
        const [newItem] = await db
          .insert(cartItems)
          .values({ userId, productId, quantity })
          .returning();
        cartItem = newItem;
      }
      
      // Get the associated product
      const product = await this.getProductById(productId);
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      // Return cart item with product
      return { ...cartItem, product };
    } catch (error) {
      console.error("Error in addToCart:", error);
      throw error;
    }
  }
  
  async updateCartItem(userId: number, itemId: number, quantity: number): Promise<(CartItem & { product: Product }) | undefined> {
    try {
      // Check if the item exists and belongs to the user
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, userId)
        ));
      
      if (!existingItem) {
        return undefined;
      }
      
      // Update the item
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, itemId))
        .returning();
      
      // Get the associated product
      const product = await this.getProductById(updatedItem.productId);
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      // Return cart item with product
      return { ...updatedItem, product };
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return undefined;
    }
  }
  
  async removeFromCart(userId: number, itemId: number): Promise<boolean> {
    try {
      // Check if the item exists and belongs to the user
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, userId)
        ));
      
      if (!existingItem) {
        return false;
      }
      
      // Delete the item
      await db
        .delete(cartItems)
        .where(eq(cartItems.id, itemId));
      
      return true;
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      return false;
    }
  }
  
  async clearCart(userId: number): Promise<void> {
    try {
      await db
        .delete(cartItems)
        .where(eq(cartItems.userId, userId));
    } catch (error) {
      console.error("Error in clearCart:", error);
    }
  }
  
  // Order operations
  async getAllOrders(): Promise<Order[]> {
    try {
      return await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return [];
    }
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return [];
    }
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    try {
      // Get the order
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id));
      
      if (!order) {
        return undefined;
      }
      
      // Get order items with products
      const itemsWithProducts = await db
        .select({
          orderItem: orderItems,
          product: products
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, id));
      
      // Transform the result to match the expected return type
      const items = itemsWithProducts.map(row => ({
        ...row.orderItem,
        product: row.product
      }));
      
      // Return order with items
      return { ...order, items };
    } catch (error) {
      console.error("Error in getOrderById:", error);
      return undefined;
    }
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const [order] = await db
        .insert(orders)
        .values(insertOrder)
        .returning();
      
      return order;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const [updatedOrder] = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
      
      return updatedOrder;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return undefined;
    }
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const [orderItem] = await db
        .insert(orderItems)
        .values(insertOrderItem)
        .returning();
      
      return orderItem;
    } catch (error) {
      console.error("Error in createOrderItem:", error);
      throw error;
    }
  }
  
  // Demo data implementation
  async initDemoData(): Promise<void> {
    try {
      // Check if we already have data
      const [userCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      
      if (userCount.count > 0) {
        console.log("Database already has data, skipping initialization");
        return;
      }
      
      console.log("Initializing demo data...");
      
      // Create admin user with password "admin" using bcrypt directly
      const adminUser = await this.createUser({
        username: "admin",
        email: "admin@example.com",
        password: await bcrypt.hash("admin", 10),
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      
      console.log("Created admin user:", adminUser.id);
      
      // Create categories
      const categoryData = [
        { name: "Electronics", description: "Latest gadgets and devices", imageUrl: "/images/categories/electronics.jpg", slug: "electronics" },
        { name: "Clothing", description: "Fashion and apparel", imageUrl: "/images/categories/clothing.jpg", slug: "clothing" },
        { name: "Home & Kitchen", description: "Furnish your home", imageUrl: "/images/categories/home-kitchen.jpg", slug: "home-kitchen" }
      ];
      
      for (const category of categoryData) {
        await this.createCategory(category);
      }
      
      console.log("Created categories");
      
      // Create products
      const productData = [
        {
          name: "Smartphone X",
          description: "Latest smartphone with amazing features",
          price: "999.99",
          imageUrl: "/images/products/smartphone.jpg",
          categoryId: 1,
          inventory: 100,
          isFeatured: true,
          isBestSeller: true
        },
        {
          name: "Laptop Pro",
          description: "Powerful laptop for professionals",
          price: "1299.99",
          imageUrl: "/images/products/laptop.jpg",
          categoryId: 1,
          inventory: 50,
          isFeatured: true
        },
        {
          name: "Men's T-shirt",
          description: "Casual cotton t-shirt",
          price: "24.99",
          imageUrl: "/images/products/tshirt.jpg",
          categoryId: 2,
          inventory: 200,
          isBestSeller: true
        }
      ];
      
      for (const product of productData) {
        await this.createProduct(product);
      }
      
      console.log("Created products");
      console.log("Demo data initialization complete");
      
    } catch (error) {
      console.error("Error initializing demo data:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();