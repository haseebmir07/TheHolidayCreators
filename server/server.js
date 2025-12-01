// server.js — Final fixed version (no app.options("*", ...))
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

connectDB();
cloudinary;

const app = express();

/* ------------------------------------
   CORS SETUP (allowlist + safe preflight)
------------------------------------ */
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://theholidaycreators.com",
  "https://theholidaycreators-1.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, webhook providers)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed for this origin."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Use CORS middleware (it will handle preflight automatically in most cases)
app.use(cors(corsOptions));

// Add a small, explicit preflight handler to safely answer OPTIONS requests
// This avoids calling app.options('*', ...) which in your environment triggered path-to-regexp.
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // If the request included an Origin header, echo it if allowed (same logic as cors)
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Access-Control-Allow-Methods", corsOptions.methods.join(","));
      res.setHeader("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
      if (corsOptions.credentials) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      return res.sendStatus(204);
    } else {
      return res.sendStatus(403);
    }
  }
  next();
});

/* ------------------------------------
   RAW BODY ROUTES (Stripe & Razorpay) - BEFORE express.json()
------------------------------------ */

// Stripe Webhook (raw body required)
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => stripeWebhooks(req, res)
);

// Razorpay Webhook (raw body required)
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      req.rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
      req.body = JSON.parse(req.rawBody || "{}");
    } catch (err) {
      // fallback: leave req.body as whatever it is
    }
    return razorpayWebhookHandler(req, res);
  }
);

/* ------------------------------------
   Normal JSON parsing, middleware, routes
------------------------------------ */
app.use(express.json());
app.use(clerkMiddleware());

// Clerk webhook (Svix)
app.use("/api/clerk", clerkWebhooks);

// Basic health
app.get("/", (req, res) => res.send("API is working"));

// Main routes
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

/* ------------------------------------
   Error handling
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  const message = err && err.message ? err.message : "Server error";
  res.status(500).json({ success: false, message });
});

/* ------------------------------------
   Start server
------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
