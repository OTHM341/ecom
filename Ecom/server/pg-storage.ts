import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  CartItem, InsertCartItem,
  users, categories, products, orders, orderItems, cartItems
} from "@shared/schema";
import { IStorage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { eq, and, desc, sql, asc } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
// We'll check for this in the constructor instead of throwing immediately
// This allows for proper fallback to MongoDB if DATABASE_URL is not set

// Create the postgres client only if we have a connection string
const client = connectionString ? postgres(connectionString) : null;

// Create the database instance
const db = drizzle(client);

// Setup PostgreSQL session store
const PostgresSessionStore = connectPgSimple(session);

export class PostgresStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set. Cannot initialize PostgreSQL storage.");
    }

    // Create a session store with PostgreSQL
    const PostgresSessionStore = connectPgSimple(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: connectionString,
      },
      createTableIfMissing: true,
    });

    console.log("PostgreSQL storage initialized");
  }

  // Initialize database schema and tables
  async initializeDatabase() {
    try {
      // Execute table creation queries directly
      const queries = [
        `CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "isAdmin" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          "imageUrl" TEXT,
          slug TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price TEXT NOT NULL,
          "compareAtPrice" TEXT,
          "imageUrl" TEXT NOT NULL,
          "imageUrls" TEXT[],
          "categoryId" INTEGER,
          inventory INTEGER,
          "isFeatured" BOOLEAN DEFAULT FALSE,
          "isNew" BOOLEAN DEFAULT FALSE,
          "isBestSeller" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL,
          status TEXT NOT NULL,
          "subTotal" NUMERIC NOT NULL,
          tax NUMERIC NOT NULL,
          total NUMERIC NOT NULL,
          "shippingAddress" JSONB NOT NULL,
          "billingAddress" JSONB NOT NULL,
          "paymentMethod" TEXT NOT NULL,
          "paymentIntentId" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          "orderId" INTEGER NOT NULL,
          "productId" INTEGER NOT NULL,
          name TEXT NOT NULL,
          price TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          total TEXT NOT NULL,
          CONSTRAINT fk_order FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL,
          "productId" INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          "createdAt" TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        )`
      ];

      for (const query of queries) {
        try {
          await client.unsafe(query);
        } catch (error: any) {
          // Skip if table already exists
          if (error.code !== '42P07') {
            throw error;
          }
        }
      }

      console.log("Database tables created successfully");
      return true;
    } catch (error) {
      console.error("Error initializing database:", error);
      return false;
    }
  }

  // Helper methods
  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Use direct SQL with quoted column names to handle case sensitivity
      const result = await client.unsafe(`
        SELECT * FROM users WHERE "username" = $1 LIMIT 1
      `, [username]);

      if (result.length === 0) {
        return undefined;
      }

      // The column names in the database are already in camelCase
      const user: User = {
        id: result[0].id,
        username: result[0].username,
        password: result[0].password,
        email: result[0].email,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        isAdmin: result[0].isAdmin,
        createdAt: result[0].createdAt
      };

      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided
    let userData = { ...insertUser };
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    // The database already uses camelCase column names
    const dbUser = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: userData.isAdmin,
      createdAt: new Date()
    };

    try {
      // Use direct SQL with quoted column names and parameterized queries
      const result = await client.unsafe(`
        INSERT INTO users ("username", "password", "email", "firstName", "lastName", "isAdmin", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `, [
        dbUser.username, 
        dbUser.password, 
        dbUser.email,
        dbUser.firstName || null,
        dbUser.lastName || null,
        dbUser.isAdmin || false
      ]);

      // The database already uses camelCase, no mapping needed
      const user: User = {
        id: result[0].id,
        username: result[0].username,
        password: result[0].password,
        email: result[0].email,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        isAdmin: result[0].isAdmin,
        createdAt: result[0].createdAt
      };

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    try {
      // Use direct SQL with quoted table name to avoid case sensitivity issues
      console.log("Attempting to fetch categories from PostgreSQL");
      const result = await client.unsafe(`SELECT * FROM "categories" ORDER BY "id" ASC`);
      console.log(`Retrieved ${result.length} categories`);

      // Map the result to make sure it follows the Category type structure
      const categories: Category[] = result.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        slug: row.slug
      }));

      return categories;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      console.log(`Attempting to fetch category with ID: ${id}`);
      // Use direct SQL with quoted identifiers
      const result = await client.unsafe(`
        SELECT * FROM "categories" WHERE "id" = $1 LIMIT 1
      `, [id]);

      if (result.length === 0) {
        console.log(`No category found with ID: ${id}`);
        return undefined;
      }

      // Map the result to ensure it matches the Category type
      const category: Category = {
        id: result[0].id,
        name: result[0].name,
        description: result[0].description,
        imageUrl: result[0].imageUrl,
        slug: result[0].slug
      };

      console.log(`Found category: ${category.name}`);
      return category;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
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
      console.log("Fetching products with options:", options);

      // Start building the SQL query
      let sqlQuery = `SELECT * FROM "products" WHERE 1=1`;
      const params: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (options.categoryId) {
        sqlQuery += ` AND "categoryId" = $${paramIndex}`;
        params.push(options.categoryId);
        paramIndex++;
      }

      if (options.isFeatured) {
        sqlQuery += ` AND "isFeatured" = $${paramIndex}`;
        params.push(true);
        paramIndex++;
      }

      if (options.isBestSeller) {
        sqlQuery += ` AND "isBestSeller" = $${paramIndex}`;
        params.push(true);
        paramIndex++;
      }

      // Order by id descending
      sqlQuery += ` ORDER BY "id" DESC`;

      // Apply pagination
      if (options.page && options.limit) {
        const offset = (options.page - 1) * options.limit;
        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(options.limit, offset);
      } else if (options.limit) {
        sqlQuery += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
      }

      // Execute the query
      console.log("Executing SQL query:", sqlQuery);
      const result = await client.unsafe(sqlQuery, params);
      console.log(`Retrieved ${result.length} products`);

      // Map the results to ensure they match the Product type
      const mappedProducts: Product[] = result.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        imageUrl: row.imageUrl,
        imageUrls: row.imageUrls,
        categoryId: row.categoryId, 
        inventory: row.inventory,
        isNew: row.isNew,
        isFeatured: row.isFeatured,
        isBestSeller: row.isBestSeller,
        createdAt: row.createdAt
      }));

      return mappedProducts;
    } catch (error) {
      console.error("Error getting products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  async getProductById(id: number): Promise<Product | undefined> {
    try {
      console.log(`Attempting to fetch product with ID: ${id}`);
      // Use direct SQL with quoted table and column names
      const result = await client.unsafe(`
        SELECT * FROM "products" WHERE "id" = $1 LIMIT 1
      `, [id]);

      if (result.length === 0) {
        console.log(`No product found with ID: ${id}`);
        return undefined;
      }

      // Map the result to ensure it matches the Product type
      const row = result[0];
      const product: Product = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        imageUrl: row.imageUrl,
        imageUrls: row.imageUrls,
        categoryId: row.categoryId, 
        inventory: row.inventory,
        isNew: row.isNew,
        isFeatured: row.isFeatured,
        isBestSeller: row.isBestSeller,
        createdAt: row.createdAt
      };

      console.log(`Found product: ${product.name}`);
      return product;
    } catch (error) {
      console.error("Error getting product by id:", error);
      return undefined;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    // Add creation timestamp
    const productData = { 
      ...insertProduct,
      createdAt: new Date()
    };

    const result = await db.insert(products).values(productData).returning();
    return result[0];
  }

  async updateProduct(id: number, updateProduct: InsertProduct): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(updateProduct)
      .where(eq(products.id, id))
      .returning();

    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    // First get all cart items for the user
    const cartItemsList = await db.select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));

    // Then get the products for each cart item
    const result: (CartItem & { product: Product })[] = [];

    for (const item of cartItemsList) {
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
    // Check if the item already exists in the cart
    const existingItem = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      ))
      .limit(1);

    let cartItem: CartItem;

    if (existingItem.length > 0) {
      // Update the existing item
      const updatedItem = await db.update(cartItems)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();

      cartItem = updatedItem[0];
    } else {
      // Create a new cart item
      const newItem = await db.insert(cartItems)
        .values({
          userId,
          productId,
          quantity,
          createdAt: new Date()
        })
        .returning();

      cartItem = newItem[0];
    }

    // Get the product details
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...cartItem,
      product
    };
  }

  async updateCartItem(userId: number, itemId: number, quantity: number): Promise<(CartItem & { product: Product }) | undefined> {
    // Verify the cart item belongs to the user
    const existingItem = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, userId)
      ))
      .limit(1);

    if (existingItem.length === 0) {
      return undefined;
    }

    // Update the cart item
    const updatedItem = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId))
      .returning();

    if (updatedItem.length === 0) {
      return undefined;
    }

    // Get the product details
    const product = await this.getProductById(updatedItem[0].productId);
    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...updatedItem[0],
      product
    };
  }

  async removeFromCart(userId: number, itemId: number): Promise<boolean> {
    const result = await db.delete(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.userId, userId)
      ))
      .returning();

    return result.length > 0;
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    // Get the order
    const orderResult = await db.select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (orderResult.length === 0) {
      return undefined;
    }

    const order = orderResult[0];

    // Get all order items
    const orderItemsList = await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    // For each order item, get the product
    const items: (OrderItem & { product: Product })[] = [];

    for (const item of orderItemsList) {
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
    // Add creation timestamp
    const orderData = {
      ...insertOrder,
      createdAt: new Date()
    };

    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    return result[0];
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }

  // Initialize demo data for first run
  async initDemoData(): Promise<void> {
    try {
      // First make sure the database tables exist
      await this.initializeDatabase();

      // Check if there are any users
      let existingUsers;
      try {
        // Directly use SQL query with double quotes for table names to avoid case sensitivity issues
        const result = await client.unsafe(`SELECT * FROM "users" LIMIT 1`);
        existingUsers = result;
      } catch (error) {
        console.error("Failed to check for existing users:", error);
        return;
      }

      if (existingUsers.length === 0) {
        console.log("Initializing demo data...");

        // Create admin user using parameterized query with quoted column names
        const adminPasswordHash = await this.hashPassword("admin123");
        await client.unsafe(`
          INSERT INTO "users" ("username", "password", "email", "firstName", "lastName", "isAdmin", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, ['admin', adminPasswordHash, 'admin@example.com', 'Admin', 'User', true]);

        // Get the created admin user with parameterized query
        const adminUsers = await client.unsafe(`SELECT * FROM "users" WHERE "username" = $1 LIMIT 1`, ['admin']);
        const adminUser = adminUsers[0];

        console.log(`Created admin user with password hash: ${adminUser.password}`);

        // Create categories
        const categoryData = [
          { name: "Electronics", description: "Latest gadgets and devices", imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1470&q=80", slug: "electronics" },
          { name: "Clothing", description: "Fashion and apparel", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1471&q=80", slug: "clothing" },
          { name: "Home & Kitchen", description: "Home appliances and kitchenware", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1470&q=80", slug: "home-kitchen" },
          { name: "Beauty", description: "Skincare and cosmetics", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1480&q=80", slug: "beauty" },
          { name: "Sports", description: "Sports equipment and gear", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1470&q=80", slug: "sports" },
          { name: "Books", description: "Books and literature", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1470&q=80", slug: "books" },
          { name: "Home & Garden", description: "Garden tools and outdoor living", imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1470&q=80", slug: "home-garden" }
        ];

        const createdCategories = [];

        for (const category of categoryData) {
          // Direct SQL insert for categories with quoted column names and parameterized queries
          await client.unsafe(`
            INSERT INTO "categories" ("name", "description", "imageUrl", "slug")
            VALUES ($1, $2, $3, $4)
          `, [
            category.name,
            category.description,
            category.imageUrl,
            category.slug
          ]);

          // Get the created category with parameterized query
          const categories = await client.unsafe(`SELECT * FROM "categories" WHERE "slug" = $1 LIMIT 1`, [category.slug]);
          createdCategories.push(categories[0]);
        }

        // Create products for each category
        const productsData = [
          {
            name: "Smartphone X",
            description: "Latest smartphone with advanced features",
            price: "999.99",
            imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2027&q=80",
            categoryId: 1,
            inventory: 50,
            isFeatured: true,
            isNew: true
          },
          {
            name: "Smartwatch Pro",
            description: "Track your health and stay connected",
            price: "299.99",
            imageUrl: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            categoryId: 1,
            inventory: 30,
            isFeatured: true
          },
          {
            name: "Designer T-Shirt",
            description: "Comfortable and stylish t-shirt",
            price: "49.99",
            imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1430&q=80",
            categoryId: 2,
            inventory: 100,
            isBestSeller: true
          },
          {
            name: "Coffee Maker",
            description: "Brew the perfect cup of coffee",
            price: "129.99",
            imageUrl: "https://images.unsplash.com/photo-1606483956061-46a898dce538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            categoryId: 3,
            inventory: 25,
            isFeatured: true,
            isBestSeller: true
          },
          {
            name: "Skin Serum",
            description: "Revitalize your skin with this premium serum",
            price: "79.99",
            imageUrl: "https://images.unsplash.com/photo-1601612628452-9e99ced43524?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            categoryId: 4,
            inventory: 45,
            isNew: true
          },
          {
            name: "Yoga Mat",
            description: "Premium yoga mat for your practice",
            price: "39.99",
            imageUrl: "https://images.unsplash.com/photo-1599447292180-45fd84092ef4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            categoryId: 5,
            inventory: 60,
            isFeatured: true
          },
          {
            name: "Bestselling Novel",
            description: "The latest bestseller everyone's talking about",
            price: "19.99",
            imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1498&q=80",
            categoryId: 6,
            inventory: 80,
            isBestSeller: true
          }
        ];

        for (const product of productsData) {
          // Direct SQL insert for products with quoted column names and parameterized queries
          await client.unsafe(`
            INSERT INTO "products" (
              "name", "description", "price", "imageUrl", "categoryId", "inventory",
              "isFeatured", "isNew", "isBestSeller", "createdAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            product.name,
            product.description,
            product.price,
            product.imageUrl,
            product.categoryId,
            product.inventory,
            product.isFeatured || false,
            product.isNew || false,
            product.isBestSeller || false
          ]);
        }

        console.log("Demo data initialized successfully");
      } else {
        console.log("Demo data already exists");
      }
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }
}