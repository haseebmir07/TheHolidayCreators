import express from "express";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole.js";
import {
  getAdminOverview,
  getAdminBookings,
  updateAdminBooking,
  getAdminHotels,
  updateAdminHotel,
  deleteAdminHotel,
  getAdminHotelRooms,
  updateAdminRoom,
  deleteAdminRoom,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
    setBookingPaid,
    cancelBooking,
    createAdminRoom,
} from "../controllers/adminController.js";


import {
  createAdminRoomWithImages,
  // uploadImagesForAdminRoom,
  updateAdminRoomWithImages,
} from "../controllers/adminRoomsController.js";


import { upload } from "../utils/uploadHelpers.js";

import multer from "multer";
// const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Clerk auth + role check
router.use(requireAuth());
router.use(requireRole("admin"));

// Overview
router.get("/overview", getAdminOverview);

// Bookings management
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id", updateAdminBooking);

// Hotels
router.get("/hotels", getAdminHotels);
router.delete("/hotels/:hotelId/rooms/:roomId", deleteAdminRoom);
router.get("/hotels/:id/rooms", getAdminHotelRooms);

// Rooms
router.post("/hotels/:hotelId/rooms", upload.array("images", 8), createAdminRoomWithImages);
router.post("/rooms", createAdminRoom);
// router.post("/rooms/:roomId/images", upload.array("images", 8), uploadImagesForAdminRoom);
router.put("/hotels/:hotelId/rooms/:roomId", upload.array("images", 8), updateAdminRoomWithImages);

router.put("/rooms/:roomId", updateAdminRoom);
router.delete("/rooms/:roomId", deleteAdminRoom);


// Users management
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateAdminUserRole);
router.delete("/users/:id", deleteAdminUser);

router.patch("/bookings/:id/pay", setBookingPaid);
router.patch("/bookings/:id/cancel", cancelBooking);
router.post("/rooms", createAdminRoom);


export default router;
