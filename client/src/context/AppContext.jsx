// ------------------------
// Imports
// ------------------------
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

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { cloudinary } from "./configs/cloudinary.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";


// ------------------------
// Connect DB + Cloudinary
// ------------------------
connectDB();
cloudinary;


// ------------------------
// Express App
// ------------------------
const app = express();


// ------------------------
// Dynamic CORS Config
// ------------------------
const CLIENT_URL = process.env.CLIENT_URL || ""; // Optional strict mode

function originAllowed(origin) {
  if (!origin) return true; // allow curl/postman/server-to-server
  if (CLIENT_URL && origin === CLIENT_URL) return true; // strict allow
  if (origin.endsWith(".onrender.com")) return true; // allow all Render frontend subdomains
  return false;
}

app.use(express.json());

// Main CORS middleware
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = originAllowed(origin);
      cb(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options(
  "*",
  cors({
    origin: (origin, cb) => cb(null, originAllowed(origin)),
    credentials: true,
  })
);


// ------------------------
// Request Logger (Very useful for Render debugging)
// ------------------------
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Origin: ${
      req.headers.origin || "none"
    }`
  );
  next();
});


// ------------------------
// Stripe Webhooks — MUST COME BEFORE express.json()
// ------------------------
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);


// ------------------------
// Clerk Webhooks
// ------------------------
app.post("/api/clerk", clerkWebhooks);


// ------------------------
// Clerk Authentication Middleware
// ------------------------
app.use(clerkMiddleware());


// ------------------------
// REAL API Routes
// ------------------------
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);


// ------------------------
// Health Check
// ------------------------
app.get("/_health", (req, res) => {
  res.json({ status: "ok" });
});


// ------------------------
// Start Server
// ------------------------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`⭐ Server running on port ${port}`);
});
