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

// RAZORPAY webhook handler
import { razorpayWebhookHandler } from "./controllers/bookingController.js";

import ownerRoutes from "./routes/ownerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();
cloudinary;

const app = express();

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
    return callback(new Error("CORS policy: This origin is not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------- helper to safely register routes ----------
function safeRegister(method, pathOrHandler, handlerMaybe) {
  // method: "use" or "get" etc.
  // support both app.use(path, handler) and app.use(handler)
  try {
    if (typeof pathOrHandler === "string") {
      // validate the path - must start with '/' or be '*' or a RegExp
      const isPathLike =
        pathOrHandler === "*" ||
        pathOrHandler.startsWith("/") ||
        pathOrHandler instanceof RegExp;
      if (!isPathLike) {
        throw new Error(
          `Invalid route path detected for app.${method}(): "${pathOrHandler}". Route paths must start with "/" (or be "*"/RegExp).`
        );
      }
      // register with the app
      app[method](pathOrHandler, handlerMaybe);
      console.log(`Registered app.${method}("${pathOrHandler}")`);
    } else {
      // pathOrHandler is actually the handler (no path supplied)
      app[method](pathOrHandler);
      console.log(`Registered app.${method}(<handler>)`);
    }
  } catch (err) {
    // give a verbose message so you can find which import is wrong
    console.error("Failed to register route:", {
      method,
      pathOrHandlerSnippet:
        typeof pathOrHandler === "string"
          ? pathOrHandler
          : pathOrHandler && pathOrHandler.name
          ? pathOrHandler.name
          : String(pathOrHandler),
      error: err.stack || err.message,
    });
    // rethrow so the process still exits (or comment the next line to continue)
    throw err;
  }
}
// -------------------------------------------------------

// webhook raw handlers must be registered BEFORE express.json()
safeRegister("post", "/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// razorpay raw handler (same)
safeRegister(
  "post",
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

// now enable JSON parsing
app.use(express.json());

// Clerk middleware
safeRegister("use", clerkMiddleware());

// Clerk webhooks
safeRegister("use", "/api/clerk", clerkWebhooks);

// Main routes (safeRegister will validate path strings)
safeRegister("get", "/", (req, res) => res.send("API is working"));
safeRegister("use", "/api/user", userRouter);
safeRegister("use", "/api/hotels", hotelRouter);
safeRegister("use", "/api/rooms", roomRouter);
safeRegister("use", "/api/bookings", bookingRouter);
safeRegister("use", "/api/owner", ownerRoutes);
safeRegister("use", "/api/admin", adminRoutes);

// global uncaught exception handler (helpful in prod logs)
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err && err.stack ? err.stack : err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
