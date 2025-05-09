import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { log } from "./vite";
import path from "path";
import fs from "fs";
import { users, categories, products, orders, orderItems, cartItems } from "@shared/schema";

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export async function createTables() {
  try {
    log("Starting database schema creation", "database");

    // Create a postgres client for migration
    const migrationClient = postgres(connectionString, { max: 1 });

    // Create the database instance
    const db = drizzle(migrationClient);

    // Create tables directly using schema definitions
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

      `CREATE TABLE IF NOT EXISTS "order_items" (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER NOT NULL,
        "productId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total TEXT NOT NULL,
        CONSTRAINT fk_order FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "cart_items" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "productId" INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        "createdAt" TIMESTAMP
      )`,

      // Create session table for connect-pg-simple
      `CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )`
    ];

    // Execute each query
    for (const query of queries) {
      await migrationClient.unsafe(query);
      log(`Executed query: ${query.slice(0, 60)}...`, "database");
    }

    log("Database schema created successfully", "database");

    // Close the migration client
    await migrationClient.end();

    return true;
  } catch (error) {
    log(`Error creating database schema: ${error}`, "error");
    return false;
  }
}