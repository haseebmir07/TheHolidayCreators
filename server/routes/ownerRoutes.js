// server/routes/ownerRoutes.js
import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole.js";
import {
  getOwnerHotels,
  createOwnerHotel,
  updateOwnerHotel,
  deleteOwnerHotel,
  getHotelRooms,
  addRoomToHotel,
  updateRoom,
  deleteRoom
} from "../controllers/ownerController.js";
import multer from "multer";


const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// All endpoints require hotelOwner role
router.use(requireAuth());
router.use(requireRole("hotelOwner"));

router.get("/hotels", getOwnerHotels);
router.post("/hotels", createOwnerHotel);
router.put("/hotels/:id", updateOwnerHotel);
router.delete("/hotels/:id", deleteOwnerHotel);

// rooms under hotel
router.get("/hotels/:id/rooms", getHotelRooms);
router.post("/hotels/:id/rooms", upload.array("images", 8), addRoomToHotel);

// direct room operations
router.put("/rooms/:roomId", updateRoom);
router.delete("/rooms/:roomId", deleteRoom);

export default router;
