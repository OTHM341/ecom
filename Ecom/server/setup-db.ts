import { pool, db } from './db';
import { users, categories, products, orders, orderItems, cartItems } from '@shared/schema';
import { hashPassword } from './auth';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Check if tables exist
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    const tableExists = result.rows && result.rows[0] && result.rows[0].exists;

    if (tableExists) {
      console.log('Tables already exist, skipping creation');
      return true;
    }

    // Create tables in the correct order
    console.log('Creating tables...');

    // Users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await db.execute(sql`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        slug TEXT NOT NULL UNIQUE
      )
    `);

    // Products table
    await db.execute(sql`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        compare_at_price NUMERIC(10, 2),
        image_url TEXT NOT NULL,
        image_urls TEXT[],
        category_id INTEGER REFERENCES categories(id),
        inventory INTEGER DEFAULT 0,
        rating NUMERIC(2, 1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_new BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        is_best_seller BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await db.execute(sql`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        total NUMERIC(10, 2) NOT NULL,
        sub_total NUMERIC(10, 2) NOT NULL,
        tax NUMERIC(10, 2) NOT NULL,
        shipping_address JSONB NOT NULL,
        billing_address JSONB NOT NULL,
        payment_intent_id TEXT,
        payment_method TEXT DEFAULT 'card',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await db.execute(sql`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        name TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        total NUMERIC(10, 2) NOT NULL
      )
    `);

    // Cart items table
    await db.execute(sql`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');

    // Insert demo data
    console.log('Inserting demo data...');

    // Create admin user
    const adminPassword = await hashPassword('admin');
    await db.execute(sql`
      INSERT INTO users (username, email, password, is_admin) 
      VALUES ('admin', 'admin@example.com', ${adminPassword}, true)
    `);

    // Create test user
    const userPassword = await hashPassword('password');
    await db.execute(sql`
      INSERT INTO users (username, email, password, first_name, last_name) 
      VALUES ('user', 'user@example.com', ${userPassword}, 'Test', 'User')
    `);

    // Insert categories
    await db.execute(sql`
      INSERT INTO categories (name, description, image_url, slug)
      VALUES 
        ('Electronics', 'Latest gadgets and devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1470&q=80', 'electronics'),
        ('Clothing', 'Fashion and apparel', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1471&q=80', 'clothing'),
        ('Home & Kitchen', 'Home appliances and kitchenware', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1470&q=80', 'home-kitchen'),
        ('Beauty', 'Luxury beauty and skincare products', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1480&q=80', 'beauty'),
        ('Beauty', 'Skincare and cosmetics', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1480&q=80', 'beauty'),
        ('Sports', 'Sports equipment and gear', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1470&q=80', 'sports'),
        ('Books', 'Books and literature', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1470&q=80', 'books'),
        ('Home & Garden', 'Garden tools and outdoor living', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1470&q=80', 'home-garden')
    `);

    // Insert products
    await db.execute(sql`
      INSERT INTO products (
        name, description, price, compare_at_price, image_url, 
        category_id, inventory, is_featured, is_best_seller
      ) 
      VALUES 
        (
          'Smartphone X', 
          'The latest smartphone with advanced features', 
          799.99, 
          899.99, 
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80',
          1, 
          50, 
          true, 
          true
        ),
        (
          'Premium Skincare Set',
          'Luxury skincare collection with serum and moisturizer',
          129.99,
          159.99,
          'https://images.unsplash.com/photo-1570554886111-e80aef089295?auto=format&fit=crop&w=1400&q=80',
          4,
          45,
          true,
          true
        ),
        (
          'Professional Tennis Racket',
          'High-performance tennis racket for professionals',
          199.99,
          249.99,
          'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1400&q=80',
          5,
          30,
          true,
          false
        ),
        (
          'Classic Literature Collection',
          'Set of timeless classic novels',
          89.99,
          99.99,
          'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80',
          6,
          50,
          true,
          true
        ),
        (
          'Garden Tool Set',
          'Complete set of essential garden tools',
          149.99,
          179.99,
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
          7,
          25,
          true,
          false
        ),
        (
          'Luxury Skincare Set',
          'Premium skincare collection with serum, moisturizer, and face mask',
          129.99,
          159.99,
          'https://images.unsplash.com/photo-1570554886111-e80aef089295?auto=format&fit=crop&w=1400&q=80',
          4,
          45,
          true,
          true
        ),
        (
          'Professional Basketball',
          'Official size and weight basketball with superior grip',
          49.99,
          59.99,
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80',
          5,
          100,
          false,
          true
        ),
        (
          'Bestselling Novel Collection',
          'Set of award-winning contemporary fiction books',
          89.99,
          99.99,
          'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80',
          6,
          30,
          true,
          false
        ),
        (
          'Garden Tool Set',
          'Complete set of essential gardening tools with storage bag',
          79.99,
          99.99,
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
          7,
          25,
          true,
          true
        ),
        (
          'Anti-Aging Cream',
          'Advanced formula with retinol and hyaluronic acid',
          59.99,
          69.99,
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1400&q=80',
          4,
          60,
          true,
          false
        ),
        (
          'Yoga Mat Set',
          'Premium yoga mat with blocks and strap',
          45.99,
          54.99,
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80',
          5,
          80,
          true,
          false
        ),
        (
          'Classic Literature Set',
          'Collection of timeless literary masterpieces',
          69.99,
          79.99,
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=80',
          6,
          40,
          false,
          true
        ),
        (
          'Indoor Plant Collection',
          'Set of 3 easy-care indoor plants with decorative pots',
          99.99,
          119.99,
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=80',
          7,
          20,
          true,
          false
        ),
        (
          'Premium Face Serum',
          'Advanced anti-aging serum with vitamin C and hyaluronic acid',
          79.99,
          89.99,
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=80',
          4,
          35,
          true,
          true
        ),
        (
          'Pro Tennis Racket',
          'Professional grade tennis racket with advanced string pattern',
          159.99,
          189.99,
          'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1400&q=80',
          5,
          25,
          true,
          true
        ),
        (
          'Mystery Novel Collection',
          'Set of bestselling mystery novels from top authors',
          49.99,
          59.99,
          'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=1400&q=80',
          6,
          50,
          true,
          false
        ),
        (
          'Garden Furniture Set',
          'Elegant outdoor furniture set with table and chairs',
          299.99,
          349.99,
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1400&q=80',
          7,
          15,
          true,
          true
        ),
        (
          'Natural Face Mask Set',
          'Organic clay and charcoal face masks for deep cleansing',
          34.99,
          39.99,
          'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1400&q=80',
          4,
          40,
          true,
          false
        ),
        (
          'Running Shoes',
          'Lightweight performance running shoes with cushioned soles',
          89.99,
          99.99,
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80',
          5,
          65,
          true,
          true
        ),
        (
          'Science Fiction Collection',
          'Best-selling sci-fi novels from renowned authors',
          59.99,
          69.99,
          'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&w=1400&q=80',
          6,
          55,
          false,
          true
        ),
        (
          'Garden Tool Collection',
          'Complete set of premium gardening tools',
          129.99,
          149.99,
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
          7,
          30,
          true,
          false
        )
    `);

    console.log('Demo data inserted successfully');
    console.log('Database setup completed');

    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

// In ESM modules, we can't check require.main === module
// Instead, we'll export the function for use in index.ts

export { setupDatabase };