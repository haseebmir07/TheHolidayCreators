// server.js — Enhanced diagnostic (replace current server.js and restart)
// It will inspect ALL args passed to route registration methods and print any
// string that looks like a URL (contains "http://" or "https://"), plus a stack.

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

// helper to produce short preview
function preview(val) {
  try {
    if (typeof val === "string") {
      return val.length > 200 ? val.slice(0, 200) + "...(truncated)" : val;
    }
    if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`;
    if (Array.isArray(val)) return `[Array length=${val.length}]`;
    return JSON.stringify(val);
  } catch (e) {
    return String(val);
  }
}

// New, strict wrapper that inspects ALL args for URL-like strings
const methodsToWrap = ["use", "get", "post", "put", "patch", "delete", "all", "options"];

methodsToWrap.forEach((m) => {
  const original = app[m].bind(app);
  app[m] = function (...args) {
    try {
      console.log(`[route-register] app.${m} called — argsCount: ${args.length}`);
      // Inspect ALL args
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        // If string and contains http(s) -> print full forensic data and exit
        if (typeof a === "string" && (a.includes("http://") || a.includes("https://"))) {
          console.error("========================================");
          console.error("OFFENDING ROUTE ARGUMENT DETECTED");
          console.error(`app.${m} — argument index: ${i}`);
          console.error("Full offending value:");
          console.error(">>> BEGIN FULL VALUE >>>");
          console.error(a);
          console.error("<<< END FULL VALUE <<<");
          console.error("Preview of all args:");
          args.forEach((x, idx) => console.error(`  [${idx}] ${preview(x)}`));
          console.error("Caller's stack (where app." + m + " was invoked):");
          console.error(new Error().stack);
          console.error("========================================");
          // Exit so logs are clear and we can inspect
          process.exit(1);
        }
        // Also log non-URL strings that look suspicious (contain ':' before a slash)
        if (typeof a === "string" && a.includes(":") && a.includes("/")) {
          // e.g., "https://..." or other colon-containing strings
          console.warn(`[route-register] suspicious string arg [${i}]: ${preview(a)}`);
        }
      }

      // If no suspicious args, still log a short summary for traceability
      const first = args[0];
      console.log(`[route-register] app.${m} firstArgPreview: ${preview(first)}`);

      return original(...args);
    } catch (err) {
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

// Apply CORS middleware (this will trigger app.use wrapper)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // this line previously triggered the crash

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

const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
