// server/controllers/roomController.js
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * parseOfferings helper (same behavior)
 */
function parseOfferings(input) {
  if (!input && input !== "") return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {
      // fallback
    }
    return input.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

// API to create a new room for a hotel
// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) return res.json({ success: false, message: "No Hotel found" });

    // upload images to cloudinary
    const uploadImages = (req.files || []).map(async (file) => {
      // if file.path exists (disk storage) use that, else if buffer exists use data uri
      if (file.path) {
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
      } else if (file.buffer) {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const response = await cloudinary.uploader.upload(dataUri);
        return response.secure_url;
      } else {
        return null;
      }
    });

    // Wait for all uploads to complete
    const images = (await Promise.all(uploadImages)).filter(Boolean);

    // parse amenities safely (stringified JSON or comma list)
    let amenitiesArr = [];
    if (amenities) {
      if (typeof amenities === "string") {
        try {
          amenitiesArr = JSON.parse(amenities);
        } catch (e) {
          amenitiesArr = amenities.split(",").map(s => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(amenities)) amenitiesArr = amenities;
    }

    // parse description and whatThisPlaceOffers if provided in body (owner flow might send them)
    const description = typeof req.body.description !== "undefined" ? req.body.description : "";
    const whatThisPlaceOffers = parseOfferings(req.body.whatThisPlaceOffers);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: amenitiesArr,
      images,
      description,
      whatThisPlaceOffers,
    });

    res.json({ success: true, message: "Package created successfully" });
  } catch (error) {
    console.error("createRoom error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms
// GET /api/rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner', 
          select: 'image',
        },
      }).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms for a specific hotel
// GET /api/rooms/owner
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    console.log(error);
    
    res.json({ success: false, message: error.message });
  }
};

// API to toggle availability of a room
// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({ success: true, message: "Room availability Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
