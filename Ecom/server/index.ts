import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { setupDatabase } from "./setup-db";
import { createAdminUser } from "./create-admin";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to create database tables using our setup script
async function createDatabaseSchema() {
  try {
    log('Creating database schema...');
    
    // Use our database setup script that uses snake_case column names
    const success = await setupDatabase();
    
    if (success) {
      log('Database schema created successfully');
      return true;
    } else {
      log('Failed to create database schema', 'error');
      return false;
    }
  } catch (error) {
    log(`Error creating database schema: ${error}`, 'error');
    return false;
  }
}

(async () => {
  try {
    // Determine which storage is being used
    const storageType = storage.constructor.name;
    log(`Using ${storageType} for data storage`);
    
    // Create the database schema if it doesn't exist
    await createDatabaseSchema();

    // Ensure the admin user exists
    try {
      await createAdminUser();
      log('Admin user created/updated successfully');
    } catch (adminError) {
      log(`Error creating/updating admin user: ${adminError}`, 'error');
    }

    // Initialize demo data if needed
    if ('initDemoData' in storage) {
      try {
        await (storage as any).initDemoData();
        log('Demo data initialized successfully');
      } catch (demoDataError) {
        log(`Error initializing demo data: ${demoDataError}`, 'error');
      }
    }
  } catch (error) {
    log(`Error during initialization: ${error}`, 'error');
    process.exit(1); // Exit if we can't set up storage properly
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();