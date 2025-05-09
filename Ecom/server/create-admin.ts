import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

async function createAdminUser() {
  try {
    console.log("Checking for admin user...");
    
    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, "admin")
    });

    // Generate admin password hash
    const adminPasswordHash = await hashPassword("admin");
    
    if (existingAdmin) {
      // Update existing admin user
      console.log("Admin user exists, updating password...");
      
      await db.update(users)
        .set({ 
          password: adminPasswordHash,
          isAdmin: true 
        })
        .where(eq(users.username, "admin"));
        
      console.log("Admin user password updated successfully");
    } else {
      // Create new admin user
      console.log("Admin user does not exist, creating...");
      
      await db.insert(users).values({
        username: "admin",
        email: "admin@example.com",
        password: adminPasswordHash,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      
      console.log("Admin user created successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to create admin user:", error);
    return false;
  }
}

export { createAdminUser };