// controllers/adminRoomsController.js
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { cloudinary } from "../configs/cloudinary.js"; // use same cloudinary config used by owner controller

/**
 * POST /api/admin/hotels/:hotelId/rooms
 * Create room for hotel with multipart images (field name: images)
 * Route should be mounted with multer memoryStorage: upload.array('images')
 */



export const createAdminRoomWithImages = async (req, res) => {
  try {
    // debug: check req.files shape if needed
    // console.log("createAdminRoomWithImages req.files:", Array.isArray(req.files) ? req.files.map(f => ({ originalname: f.originalname, hasBuffer: !!f.buffer })) : req.files);

    const { hotelId } = req.params;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    const { roomType, pricePerNight, description, amenities, isAvailable } = req.body;
    // amenities might be a JSON string (from FormData) or an array
    const amenitiesArr = typeof amenities === "string"
      ? (amenities ? JSON.parse(amenities) : [])
      : (amenities || []);

    const room = await Room.create({
      hotel: hotelId,
      roomType,
      pricePerNight: Number(pricePerNight) || 0,
      description: description || "",
      amenities: amenitiesArr,
      isAvailable: isAvailable === "true" || isAvailable === true,
      images: [],
    });

    // Upload files (expect memoryStorage -> file.buffer)
    if (req.files && req.files.length) {
      const uploadedUrls = [];
      for (const file of req.files) {
        if (!file) continue;
        // create data URI from buffer (same logic as owner)
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: `rooms/${room._id}`,
          resource_type: "image",
        });
        uploadedUrls.push(uploadRes.secure_url);
      }
      if (uploadedUrls.length) {
        room.images = uploadedUrls;
        await room.save();
      }
    }

    return res.json({ success: true, room });
  } catch (err) {
    console.error("createAdminRoomWithImages error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};
/**
 * PUT /api/admin/hotels/:hotelId/rooms/:roomId
 * Update room with multipart support: accepts fields + files + removeImages JSON array
 * Route must be mounted with multer memoryStorage: upload.array('images')
 */
export const updateAdminRoomWithImages = async (req, res) => {
  try {
    // debug:
    // console.log("updateAdminRoomWithImages - req.files:", Array.isArray(req.files) ? req.files.map(f=>({originalname:f.originalname,hasBuffer:!!f.buffer})) : req.files);

    const { hotelId, roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Optionally verify the room belongs to hotelId (safety)
    if (room.hotel && String(room.hotel) !== String(hotelId)) {
      // This could be a bad request or you may ignore — here we return 400
      return res.status(400).json({ success: false, message: "Room does not belong to hotel" });
    }

    // Update scalar fields from req.body (multipart sends strings)
    const { roomType, pricePerNight, description, amenities, isAvailable, removeImages } = req.body;

    if (typeof roomType !== "undefined") room.roomType = roomType;
    if (typeof pricePerNight !== "undefined") room.pricePerNight = Number(pricePerNight) || 0;
    if (typeof description !== "undefined") room.description = description;
    if (typeof isAvailable !== "undefined") room.isAvailable = isAvailable === "true" || isAvailable === true;
    if (typeof amenities !== "undefined") {
      try {
        room.amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch (e) {
        // fallback: comma-separated string
        room.amenities = typeof amenities === "string"
          ? amenities.split(",").map(s => s.trim()).filter(Boolean)
          : [];
      }
    }

    // Handle removeImages (stringified JSON or CSV)
    if (removeImages) {
      let removeArr = removeImages;
      if (typeof removeImages === "string") {
        try { removeArr = JSON.parse(removeImages); } catch (e) { removeArr = [removeImages]; }
      }
      if (Array.isArray(removeArr) && removeArr.length) {
        room.images = (room.images || []).filter((u) => !removeArr.includes(u));
        // OPTIONAL: delete the actual images from Cloudinary here if you track public_ids
      }
    }

    // Upload any new files (memory buffer -> data URI)
    if (req.files && req.files.length) {
      const uploaded = [];
      for (const file of req.files) {
        if (!file) continue;
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: `rooms/${room._id}`,
          resource_type: "image",
        });
        uploaded.push(uploadRes.secure_url);
      }
      if (uploaded.length) {
        room.images = [...(room.images || []), ...uploaded];
      }
    }

    await room.save();
    return res.json({ success: true, room });
  } catch (err) {
    console.error("updateAdminRoomWithImages error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};
