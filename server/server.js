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
// server.js — Diagnostic mode (paste this entire file and restart the server)
// This will log each registration and clearly show any offending path string.

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

// --- small helper to pretty-print potentially large objects
function short(val) {
  try {
    if (typeof val === "string") {
      if (val.length > 240) return val.slice(0, 200) + "...(truncated)";
      return val;
    }
    if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`;
    return JSON.stringify(val);
  } catch (e) {
    return String(val);
  }
}

// --- Wrap registration methods to log arguments and detect invalid path strings
const methodsToWrap = ["use", "get", "post", "put", "patch", "delete", "all", "options"];

methodsToWrap.forEach((m) => {
  const original = app[m].bind(app);
  app[m] = function (...args) {
    try {
      // Log call summary
      const first = args[0];
      const snippet = short(first);
      console.log(`[route-register] app.${m} called — firstArg: ${snippet} — argsCount: ${args.length}`);

      // If the first arg is a string, ensure it looks like a path (starts with / or is '*')
      if (typeof first === "string") {
        if (!(first === "*" || first.startsWith("/") || first.startsWith("^"))) {
          // Print full diagnostic and throw a friendly error (instead of cryptic path-to-regexp)
          console.error("========================================");
          console.error("ERROR: Invalid route path detected during registration.");
          console.error(`Method: app.${m}`);
          console.error("Offending value (full):");
          console.error(">>> BEGIN OFFENDING VALUE >>>");
          console.error(first);
          console.error("<<< END OFFENDING VALUE <<<");
          console.error("Stack trace for where app." + m + " was called (this shows file/line):");
          console.error(new Error().stack);
          console.error("========================================");
          // exit so Render logs are clear
          process.exit(1);
        }
      }
      // proceed with original registration
      return original(...args);
    } catch (err) {
      // If something unexpected happens, log and rethrow
      console.error(`[route-register] failed registering app.${m}:`, err && err.stack ? err.stack : err);
      throw err;
    }
  };
});

// ------------------- CORS -------------------
const allowedOrigins = [
  "https://theholidaycreators.com",
  "https://theholidaycreators-1.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed for this origin."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ----------------- Raw webhook handlers (before express.json) -----------------
console.log("Registering raw webhook routes...");
app.post("/api/stripe", express.raw({ type: "application/json" }), (req, res) => stripeWebhooks(req, res));
app.post("/api/razorpay-webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    req.rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
    req.body = JSON.parse(req.rawBody || "{}");
  } catch (err) {}
  return razorpayWebhookHandler(req, res);
});

// ----------------- Normal JSON + Clerk -----------------
app.use(express.json());
app.use(clerkMiddleware());

console.log("Registering clerk webhook route...");
app.use("/api/clerk", clerkWebhooks);

// ----------------- Main routes -----------------
console.log("Registering main routes...");
app.get("/", (req, res) => res.send("API is working"));

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);

console.log("All route registrations attempted.");

// ----------------- Error handler & start -----------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: err && err.message ? err.message : "Server error" });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err && err.stack ? err.stack : err);
});

// Single PORT declaration
const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
