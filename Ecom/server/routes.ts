import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, generateAdminPasswordHash } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
// Remove PayPal integration temporarily
// import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

// Using our own simple payment processor
console.log("Using internal payment processing system");

// We now import the generateAdminPasswordHash function from auth.ts
// This ensures we use the same password hash logic everywhere

export async function registerRoutes(app: Express): Promise<Server> {
  // Special route to create/reset admin user for testing - for development only
  app.get("/api/create-test-admin", async (req, res) => {
    try {
      // Generate admin password hash 
      const adminPasswordHash = await generateAdminPasswordHash();
      console.log("Generated admin password hash:", adminPasswordHash);

      // Check if admin already exists
      const existingAdmin = await storage.getUserByUsername("admin");

      if (existingAdmin) {
        // For in-memory storage, we can directly modify the user
        existingAdmin.password = adminPasswordHash;
        console.log("Updated existing admin password");
      } else {
        // Create new admin user
        const adminUser = await storage.createUser({
          username: "admin",
          email: "admin@oanshop.com",
          password: adminPasswordHash,
          firstName: "Admin",
          lastName: "User",
          isAdmin: true
        });
        console.log("Created new admin user with ID:", adminUser.id);
      }

      res.json({ message: "Admin user created/updated successfully" });
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Setup authentication routes
  setupAuth(app);

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategoryById(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, bestseller, page = "1", limit = "12" } = req.query;

      const options = {
        categoryId: category ? parseInt(category as string) : undefined,
        isFeatured: featured === "true",
        isBestSeller: bestseller === "true",
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const products = await storage.getProducts(options);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Products by category endpoint
  app.get("/api/categories/:id/products", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { page = "1", limit = "12" } = req.query;

      const options = {
        categoryId: categoryId,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const products = await storage.getProducts(options);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products for category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productData);

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const productId = parseInt(req.params.id);
      const success = await storage.deleteProduct(productId);

      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart endpoints
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid product data" });
      }

      const cartItem = await storage.addToCart(req.user.id, parseInt(productId), parseInt(quantity));
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:itemId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { quantity } = req.body;
      const itemId = parseInt(req.params.itemId);

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItem(req.user.id, itemId, parseInt(quantity));

      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:itemId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const itemId = parseInt(req.params.itemId);
      const success = await storage.removeFromCart(req.user.id, itemId);

      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Orders endpoints
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      let orders;
      if (req.user.isAdmin) {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getUserOrders(req.user.id);
      }
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the user has access to this order
      if (!req.user.isAdmin && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Simple internal payment processing endpoint
  // Payment verification endpoint
  app.get("/api/payment/:transactionId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { transactionId } = req.params;

      // Find order by payment ID
      const orders = await storage.getAllOrders();
      const order = orders.find(o => o.paymentId === transactionId);

      if (order) {
        return res.json({
          success: true,
          status: "succeeded",
          orderId: order.id
        });
      } else {
        return res.json({
          success: false,
          status: "pending",
          message: "No order found for this transaction"
        });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ 
        success: false,
        error: `Payment verification failed: ${message}` 
      });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { amount, shippingAddress, cartItems } = req.body;

      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      console.log(`Processing payment for amount: ${amount}`);
      
      // Generate a simple payment transaction ID
      const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      
      // In a real system, we would validate payment information here
      // For this demo, we'll just simulate a successful payment
      
      console.log(`Generated transaction ID: ${transactionId}`);

      // If we received shipping address and cart items, create an order immediately
      if (shippingAddress && cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        try {
          // Create the order
          const newOrder = await storage.createOrder({
            userId: req.user.id,
            status: "processing",
            total: amount.toString(),
            shippingAddress: JSON.stringify(shippingAddress),
            paymentId: transactionId
          });

          // Add order items
          let orderItemsAdded = 0;
          for (const item of cartItems) {
            try {
              await storage.createOrderItem({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              });
              orderItemsAdded++;
            } catch (itemError) {
              console.error(`Failed to create order item for product ${item.productId}:`, itemError);
            }
          }

          console.log(`Created order ${newOrder.id} with ${orderItemsAdded} items`);

          // Send back the transaction details with the order ID
          return res.json({ 
            success: true,
            paymentIntentId: transactionId,
            status: "succeeded",
            amount: amount,
            currency: "usd",
            message: "Payment processed and order created successfully",
            orderId: newOrder.id
          });
        } catch (orderError) {
          console.error("Error creating order during payment:", orderError);
          
          // Payment succeeded but order creation failed
          return res.json({ 
            success: true,
            paymentIntentId: transactionId,
            status: "succeeded",
            amount: amount,
            currency: "usd",
            message: "Payment processed successfully but order creation failed",
            error: "Order processing failed. Please contact support."
          });
        }
      } else {
        // Just process the payment without creating an order
        // Send back the transaction details to the client
        res.json({ 
          success: true,
          paymentIntentId: transactionId,
          status: "succeeded",
          amount: amount,
          currency: "usd",
          message: "Payment processed successfully"
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ 
        success: false,
        message: `Payment failed: ${message}` 
      });
    }
  });

  // Create order after successful payment
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { 
        total, 
        subTotal, 
        tax, 
        shippingAddress, 
        billingAddress,
        paymentMethod,
        paymentIntentId,
        items 
      } = req.body;

      console.log("Creating order with data:", { 
        userId: req.user.id, 
        total, 
        subTotal, 
        tax,
        paymentMethod,
        itemsCount: items?.length || 0,
        paymentIntentId: paymentIntentId || 'none'
      });

      // Validate required fields
      if (!total || !subTotal || !shippingAddress || !paymentMethod) {
        console.error("Missing required order fields:", { total, subTotal, shippingAddress, paymentMethod });
        return res.status(400).json({ message: "Missing required order fields" });
      }

      // Validate items
      if (!items || !items.length) {
        console.error("No items in order");
        return res.status(400).json({ message: "Order must contain at least one item" });
      }

      // Create the order - no cart dependency
      const newOrder = await storage.createOrder({
        userId: req.user.id,
        status: "processing",
        total: total.toString(),
        subTotal: subTotal.toString(),
        tax: tax.toString(),
        shippingAddress,
        billingAddress,
        paymentMethod: "card", // Explicitly set payment method
        paymentIntentId
      });

      console.log(`Order created successfully with ID: ${newOrder.id}`);

      // Add order items directly from the request payload, not from cart
      let orderItemsAdded = 0;
      for (const item of items) {
        try {
          console.log(`Adding order item: Product ID: ${item.productId}, Qty: ${item.quantity}`);

          // Verify the product exists
          const product = await storage.getProductById(parseInt(item.productId));
          if (!product) {
            console.error(`Product not found: ${item.productId}`);
            continue;
          }

          await storage.createOrderItem({
            orderId: newOrder.id,
            productId: parseInt(item.productId),
            name: item.name || product.name,
            price: item.price.toString(),
            quantity: parseInt(item.quantity),
            total: item.total.toString()
          });

          orderItemsAdded++;
        } catch (itemError) {
          console.error(`Failed to add order item: ${itemError.message}`, item);
          // Continue with other items
        }
      }

      console.log(`Successfully added ${orderItemsAdded} items to order ${newOrder.id}`);

      // We've now decoupled order creation from cart - the frontend is responsible for clearing the cart
      // This avoids the "Cart item not found" error as we're no longer dependent on cart state

      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).json({ message: `Failed to create order: ${error.message}` });
    }
  });

  // PayPal integration routes (temporarily disabled)
  /*
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  */

  const httpServer = createServer(app);
  return httpServer;
}