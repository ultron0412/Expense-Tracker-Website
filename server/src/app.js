const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const config = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const isProduction = config.nodeEnv === "production";

app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);

if (isProduction) {
  app.use((req, res, next) => {
    const forwardedProtoHeader = req.headers["x-forwarded-proto"];
    const forwardedProto = String(forwardedProtoHeader || "")
      .split(",")[0]
      .trim()
      .toLowerCase();

    if (forwardedProto && forwardedProto !== "https") {
      const forwardedHost = req.headers["x-forwarded-host"];
      const host = forwardedHost || req.headers.host;
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }

    return next();
  });
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (config.clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    const err = new Error("Origin not allowed by CORS policy");
    err.status = 403;
    err.expose = true;
    return callback(err);
  },
};

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

if (config.nodeEnv !== "test") {
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
}

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Expense tracker API is running",
    env: config.nodeEnv,
  });
});

app.get("/api/ready", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    return res.status(503).json({ ok: false, message: "Database not ready" });
  }
  return res.json({ ok: true, message: "Ready" });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
