import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NuraChatAI API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", chatRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected with Database");
  } catch (error) {
    console.error("Failed to connect with Database", error);
    process.exit(1);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "Frontend", "dist")));

  app.get("/*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "Frontend", "dist", "index.html"),
    );
  });
}

// Self-ping function to keep server awake on Render
const startSelfPing = () => {
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;

  if (RENDER_EXTERNAL_URL && process.env.NODE_ENV === "production") {
    console.log("🔄 Starting self-ping service to prevent server sleep...");

    const pingInterval = setInterval(
      async () => {
        try {
          const response = await fetch(`${RENDER_EXTERNAL_URL}/health`);
          if (response.ok) {
            console.log("✅ Self-ping successful - server kept awake");
          } else {
            console.log(
              "⚠️ Self-ping returned non-200 status:",
              response.status,
            );
          }
        } catch (error) {
          console.log("❌ Self-ping failed:", error.message);
        }
      },
      10 * 60 * 1000,
    ); // Ping every 14 minutes

    // Clear interval on server shutdown
    process.on("SIGTERM", () => {
      clearInterval(pingInterval);
    });

    process.on("SIGINT", () => {
      clearInterval(pingInterval);
    });
  } else if (process.env.NODE_ENV === "production") {
    console.log("⚠️ RENDER_EXTERNAL_URL not set - self-ping disabled");
  } else {
    console.log("🔧 Development mode - self-ping disabled");
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start self-ping after server is running
    startSelfPing();
  });
});
