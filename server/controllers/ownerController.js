// server/controllers/ownerController.js
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { getAuth } from "@clerk/express";
import { cloudinary } from "../configs/cloudinary.js";

/**
 * GET /api/owner/hotels
 * List hotels for signed-in owner
 */
export const getOwnerHotels = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success:false, message:"Not signed in" });

    const hotels = await Hotel.find({ owner: userId }).lean();
    res.json({ success: true, hotels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * POST /api/owner/hotels
 * Create a new hotel for owner
 */
export const createOwnerHotel = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success:false, message:"Not signed in" });

    const { name, address, contact, city } = req.body;
    const hotel = await Hotel.create({ name, address, contact, city, owner: userId });
    res.json({ success: true, hotel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * PUT /api/owner/hotels/:id
 * Update hotel (owner only)
 */
export const updateOwnerHotel = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success:false, message:"Not signed in" });

    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ success:false, message:"Hotel not found" });
    if (String(hotel.owner) !== userId) return res.status(403).json({ success:false, message:"Forbidden" });

    const updates = req.body;
    Object.assign(hotel, updates);
    await hotel.save();

    res.json({ success: true, hotel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * DELETE /api/owner/hotels/:id
 */
export const deleteOwnerHotel = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ success:false, message:"Hotel not found" });
    if (String(hotel.owner) !== userId) return res.status(403).json({ success:false, message:"Forbidden" });

    // remove hotel and optionally its rooms
    await Room.deleteMany({ hotel: id });
    await hotel.deleteOne();

    res.json({ success: true, message: "Hotel deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * GET /api/owner/hotels/:id/rooms
 * List rooms for a hotel (owner only)
 */
export const getHotelRooms = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params; // hotel id
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ success:false, message:"Hotel not found" });
    if (String(hotel.owner) !== userId) return res.status(403).json({ success:false, message:"Forbidden" });

    const rooms = await Room.find({ hotel: id }).lean();
    res.json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * POST /api/owner/hotels/:id/rooms
 * Add room to hotel
 */
export const addRoomToHotel = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params; // hotel id

    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
    if (String(hotel.owner) !== userId) return res.status(403).json({ success: false, message: "Forbidden" });

    // parse text fields (multipart forms give strings)
    const { roomType = "", pricePerNight = "0", isAvailable = "true" } = req.body;

    // amenities may be sent as JSON string
    let amenities = [];
    if (req.body.amenities) {
      try { amenities = JSON.parse(req.body.amenities); } catch (e) { amenities = []; }
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      // Upload sequentially (simple) — ok for small number of files
      for (const file of req.files) {
        // convert buffer -> data URI
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: "rooms", // optional folder
          resource_type: "image",
        });

        uploadedImages.push(uploadRes.secure_url);
      }
    }

    const room = await Room.create({
      hotel: id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities,
      images: uploadedImages,
      isAvailable: isAvailable === "true" || isAvailable === true,
    });

    return res.json({ success: true, room });
  } catch (err) {
    console.error("addRoomToHotel error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * PUT /api/owner/rooms/:roomId
 * Update room
 */
export const updateRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success:false, message:"Room not found" });

    const hotel = await Hotel.findById(room.hotel);
    if (!hotel || String(hotel.owner) !== userId) return res.status(403).json({ success:false, message:"Forbidden" });

    Object.assign(room, req.body);
    await room.save();

    res.json({ success: true, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * DELETE /api/owner/rooms/:roomId
 */
export const deleteRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success:false, message:"Room not found" });

    const hotel = await Hotel.findById(room.hotel);
    if (!hotel || String(hotel.owner) !== userId) return res.status(403).json({ success:false, message:"Forbidden" });

    await room.deleteOne();
    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};
