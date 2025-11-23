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
import ownerRoutes from "./routes/ownerRoutes.js";


connectDB();
cloudinary;

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",          // exact origin, not '*'
    credentials: true,                         // allow cookies/credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Enable Cross-Origin Resource Sharing

// API to listen to Stripe Webhooks
app.post("/api/stripe",express.raw({ type: "application/json" }),stripeWebhooks);

// Middleware to parse JSON
app.use(express.json());
app.use(clerkMiddleware());

// API to listen to Clerk Webhooks
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is working"));
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
