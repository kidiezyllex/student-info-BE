import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { connectDB } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Connect to database
    await connectDB();
    
    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    
    // Set up Swagger documentation
    setupSwagger(app);
    
    // API health check endpoint
    app.get("/api/health", (req, res) => {
      res.status(200).json({ 
        status: "ok", 
        message: "API is running"
      });
    });
    
    // Error handling
    app.use(notFound);
    app.use(errorHandler);
    
    const httpServer = createServer(app);
    
    return httpServer;
  } catch (error) {
    console.error("Error registering routes:", error);
    throw error;
  }
} 