import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { Request, Response } from "express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
export async function registerRoutes(app: Express): Promise<Server> {
  try {
    await connectDB();
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/departments", departmentRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/verification", verificationRoutes);
    app.use("/api/topics", topicRoutes);
    app.use("/api/calendar", calendarRoutes);
    setupSwagger(app);
    
    app.get("/", (req: Request, res: Response) => {
      res.status(200).json({ 
        message: "Student Information System API",
        version: "1.0.0",
        status: "running",
        endpoints: {
          health: "/api/health",
          docs: "/api-docs",
          auth: "/api/auth",
          users: "/api/users",
          topics: "/api/topics",
          chat: "/api/chat",
          departments: "/api/departments",
          calendar: "/api/calendar"
        }
      });
    });
    
    // API health check endpoint
    app.get("/api/health", (req: Request, res: Response) => {
      res.status(200).json({ 
        status: "ok", 
        message: "API is running",
        timestamp: new Date().toISOString()
      });
    });
    
    // Error handling
    app.use(notFound);
    app.use(errorHandler);
    
    const httpServer = createServer(app);
    
    return httpServer;
  } catch (error) {
    console.error("Error registering routes:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
} 