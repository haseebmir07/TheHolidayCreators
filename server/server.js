// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import connectDB from "./configs/db.js";
// import { clerkMiddleware } from "@clerk/express";
// import userRouter from "./routes/userRoutes.js";
// import hotelRouter from "./routes/hotelRoutes.js";
// import roomRouter from "./routes/roomRoutes.js";
// import bookingRouter from "./routes/bookingRoutes.js";
// import clerkWebhooks from "./controllers/clerkWebhooks.js";
// import { cloudinary } from "./configs/cloudinary.js";
// import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
// import ownerRoutes from "./routes/ownerRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";

// connectDB();
// cloudinary;

// const app = express();
// app.use(
//   cors({
//     origin: "http://localhost:5173",          // exact origin, not '*'
//     credentials: true,                         // allow cookies/credentials
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// ); // Enable Cross-Origin Resource Sharing

// // API to listen to Stripe Webhooks
// app.post("/api/stripe",express.raw({ type: "application/json" }),stripeWebhooks);

// // Middleware to parse JSON
// app.use(express.json());
// app.use(clerkMiddleware());

// // API to listen to Clerk Webhooks
// app.use("/api/clerk", clerkWebhooks);

// app.get("/", (req, res) => res.send("API is working"));
// app.use("/api/user", userRouter);
// app.use("/api/hotels", hotelRouter);
// app.use("/api/rooms", roomRouter);
// app.use("/api/bookings", bookingRouter);
// app.use("/api/owner", ownerRoutes);
// app.use("/api/admin", adminRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { cloudinary } from "./configs/cloudinary.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// ⭐ NEW IMPORT (Razorpay Webhook Handler)
import { razorpayWebhookHandler } from "./controllers/bookingController.js";

import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();
cloudinary;

const app = express();

app.use(
  cors({
    origin: "https://theholidaycreators.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -----------------------------
// ⭐ STRIPE WEBHOOK (raw body)
// -----------------------------
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// -----------------------------
// ⭐ RAZORPAY WEBHOOK (raw body)
// -----------------------------
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      req.rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
      req.body = JSON.parse(req.rawBody || "{}");
    } catch (err) {
      // fallback
    }
    return razorpayWebhookHandler(req, res);
  }
);

// -----------------------------
// Now enable JSON parsing
// -----------------------------
app.use(express.json());
app.use(clerkMiddleware());

// Clerk Webhooks
app.use("/api/clerk", clerkWebhooks);

// Main Routes
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
