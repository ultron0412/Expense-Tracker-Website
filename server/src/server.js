const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/env");

let server;

async function start() {
  await connectDB();
  server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

