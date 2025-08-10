require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const DatabaseConfig = require("./src/config/database");
const messageRoutes = require("./src/routes/messages");

class WhatsAppServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });
    this.port = process.env.PORT || 5000;
    this.database = new DatabaseConfig();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      })
    );

    // Body parser middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Socket.IO middleware for routes
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });

    // Request logging
    if (process.env.NODE_ENV !== "production") {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // API routes
    this.app.get("/", (req, res) => {
      res.json({
        message: "Welcome to the WhatsApp Web Clone API",
      });
    });

    this.app.use("/api/messages", messageRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error("Server Error:", error);
      res.status(500).json({
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : error.message,
      });
    });
  }

  setupSocketIO() {
    this.io.on("connection", (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      socket.on("join_conversation", (waId) => {
        socket.join(`conversation_${waId}`);
        console.log(`📱 User ${socket.id} joined conversation ${waId}`);
      });

      socket.on("leave_conversation", (waId) => {
        socket.leave(`conversation_${waId}`);
        console.log(`📱 User ${socket.id} left conversation ${waId}`);
      });

      socket.on("disconnect", () => {
        console.log(`👤 User disconnected: ${socket.id}`);
      });
    });
  }

  async start() {
    try {
      // Connect to database
      await this.database.connect();

      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();
      this.setupSocketIO();

      // Start server
      this.server.listen(this.port, () => {
        console.log(
          `🚀 WhatsApp Web Clone Server running on port ${this.port}`
        );
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`📡 WebSocket support enabled`);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => this.shutdown());
      process.on("SIGINT", () => this.shutdown());
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log("🔄 Shutting down server...");

    try {
      await this.database.disconnect();
      this.server.close(() => {
        console.log("✅ Server shut down successfully");
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new WhatsAppServer();
server.start();
