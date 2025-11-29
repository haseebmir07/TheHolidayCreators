// server/routes/bookingRoutes.js
import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getUserBookings,
  getHotelBookings,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { deleteBooking } from "../controllers/bookingController.js";


const router = express.Router();

// check availability
router.post("/check-availability", checkAvailabilityAPI);

// create booking (protected)
router.post("/book", protect, createBooking);

// get user bookings
router.get("/user", protect, getUserBookings);

// get hotel-owner bookings
router.get("/hotel", protect, getHotelBookings);

// Razorpay: create order
router.post("/razorpay/order", protect, createRazorpayOrder);

// Razorpay: verify payment
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// Delete booking
router.delete("/:id", protect, deleteBooking);


export default router;
