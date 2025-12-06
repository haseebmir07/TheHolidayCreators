// server/routes/adminRoutes.js
import express from "express";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole.js";

import {
  getAdminOverview,
  getAdminBookings,
  updateAdminBooking,
  // HOTELS
  createAdminHotel,
  getAdminHotels,
  updateAdminHotel,
  deleteAdminHotel,
  deleteHotelOnly,
  getAdminHotelRooms,
  // ROOMS
  updateAdminRoom,
  deleteAdminRoom,
  createAdminRoom,
  // USERS
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  // BOOKING STATUS
  setBookingPaid,
  cancelBooking,
} from "../controllers/adminController.js";

import {
  createAdminRoomWithImages,
  updateAdminRoomWithImages,
} from "../controllers/adminRoomsController.js";

import { upload } from "../utils/uploadHelpers.js";

const router = express.Router();

// Auth + admin role
router.use(requireAuth());
router.use(requireRole("admin"));

// Overview
router.get("/overview", getAdminOverview);

// Bookings
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id", updateAdminBooking);
router.patch("/bookings/:id/pay", setBookingPaid);
router.patch("/bookings/:id/cancel", cancelBooking);

// Hotels
router.get("/hotels", getAdminHotels);
router.post("/hotels", createAdminHotel);
router.put("/hotels/:id", updateAdminHotel);
router.delete("/hotels/:id", deleteAdminHotel);

// Optional: delete only hotel, keep rooms
router.delete("/hotels/:id/only", deleteHotelOnly);

// Hotel rooms list
router.get("/hotels/:id/rooms", getAdminHotelRooms);

// Rooms (with images)
router.post(
  "/hotels/:hotelId/rooms",
  upload.array("images", 8),
  createAdminRoomWithImages
);
router.put(
  "/hotels/:hotelId/rooms/:roomId",
  upload.array("images", 8),
  updateAdminRoomWithImages
);

// Rooms (JSON-only fallback)
router.post("/rooms", createAdminRoom);
router.put("/rooms/:roomId", updateAdminRoom);
router.delete("/rooms/:roomId", deleteAdminRoom);

// Users
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateAdminUserRole);
router.delete("/users/:id", deleteAdminUser);

export default router;
