import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { Request, Response } from "express";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import datasetRoutes from "./routes/dataset.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import scholarshipRoutes from "./routes/scholarship.routes.js";
import eventRoutes from "./routes/event.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Connect to database
    await connectDB();
    
    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/dataset", datasetRoutes);
    app.use("/api/departments", departmentRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/scholarships", scholarshipRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/upload", uploadRoutes);
    
    // Set up Swagger documentation
    setupSwagger(app);
    
    // API health check endpoint
    app.get("/api/health", (req: Request, res: Response) => {
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