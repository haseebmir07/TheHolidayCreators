// ⭐ FINAL server.js — FULL WORKING VERSION (CORS FIXED + NO CRASHES)

import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import { razorpayWebhookHandler } from "./controllers/bookingController.js";

import { cloudinary } from "./configs/cloudinary.js";

// DB Init
connectDB();
cloudinary;

// -----------------------------------------------------------------------------
// ⭐ CORS SETUP (FINAL FIXED VERSION)
// -----------------------------------------------------------------------------

// Allowed frontend origins
const allowedOrigins = [
  "https://theholidaycreators.com",
  "https://www.theholidaycreators.com",
  "https://theholidaycreators-1.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ Blocked CORS origin:", origin);
    return callback(new Error("CORS not allowed for this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply cors
const app = express();
app.use(cors(corsOptions));

// ⭐ Safe handling of ALL OPTIONS preflight requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
      return res.status(204).end();
    }

    return res.status(403).end();
  }
  next();
});

// -----------------------------------------------------------------------------
// ⭐ RAW WEBHOOK ROUTES (must be BEFORE express.json())
// -----------------------------------------------------------------------------

// STRIPE WEBHOOK
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => stripeWebhooks(req, res)
);

// RAZORPAY WEBHOOK
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      req.rawBody =
        req.body instanceof Buffer ? req.body.toString("utf8") : "";
      req.body = JSON.parse(req.rawBody || "{}");
    } catch (err) {}

    return razorpayWebhookHandler(req, res);
  }
);

// -----------------------------------------------------------------------------
// ⭐ NORMAL ROUTES (after raw handlers)
// -----------------------------------------------------------------------------

app.use(express.json());
app.use(clerkMiddleware());

// Clerk webhook
app.use("/api/clerk", clerkWebhooks);

// Health check
app.get("/", (req, res) => res.send("API is working"));

// REST API ROUTES
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

// -----------------------------------------------------------------------------
// ⭐ GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  if (res.headersSent) return next(err);

  res.status(500).json({
    success: false,
    message: err?.message || "Server error",
  });
});

// -----------------------------------------------------------------------------
// ⭐ START SERVER
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);


