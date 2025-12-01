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


// server.js (FULL file - replace your existing server.js)
// server.js (defensive version - paste/replace your current server.js)
// server.js (FULL file - replace your current server.js)
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

// DB & Cloud Init
connectDB();
cloudinary;

const app = express();

/* ------------------------------------
   CORS SETUP (fixed & safe)
------------------------------------ */
const allowedOrigins = [
  "https://theholidaycreators.com",
  "https://theholidaycreators-1.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server calls
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed for this origin."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// apply cors
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ------------------------------------
   RAW BODY ROUTES (Stripe & Razorpay)
   MUST COME BEFORE express.json()
------------------------------------ */

// Stripe Webhook (RAW)
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => stripeWebhooks(req, res)
);

// Razorpay Webhook (RAW)
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      req.rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
      req.body = JSON.parse(req.rawBody || "{}");
    } catch (err) {}
    return razorpayWebhookHandler(req, res);
  }
);

/* ------------------------------------
   NORMAL JSON ROUTES
------------------------------------ */
app.use(express.json());

// Clerk auth middleware
app.use(clerkMiddleware());

// Clerk → Svix Webhook handler
app.use("/api/clerk", clerkWebhooks);

/* ------------------------------------
   MAIN API ROUTES
------------------------------------ */
app.get("/", (req, res) => res.send("API is working"));

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

/* ------------------------------------
   GLOBAL ERROR CATCHER
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ success: false, message: err.message || "Server error" });
});

/* ------------------------------------
   SERVER START
------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
