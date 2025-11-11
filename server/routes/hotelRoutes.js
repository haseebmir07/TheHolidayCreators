import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole.js";
import { registerHotel, getAllHotels } from "../controllers/hotelController.js";

const router = Router();

// Only hotel owners can list/register a hotel
router.post("/", requireAuth(), requireRole("hotelOwner"), registerHotel);

// Anyone can view hotels
router.get("/", getAllHotels);

export default router;
