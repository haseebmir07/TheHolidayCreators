// controllers/adminRoomsController.js
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { cloudinary } from "../configs/cloudinary.js"; // use same cloudinary config used by owner controller

/**
 * POST /api/admin/hotels/:hotelId/rooms
 * Create room for hotel with multipart images (field name: images)
 * Route should be mounted with multer memoryStorage: upload.array('images')
 */
// helper inside controller file
function normalizeOffers(input) {
  // Accepts:
  // - JSON string of array of objects [{title, subtitle, iconKey}]
  // - JSON string of array of strings ["Wifi","Kitchen"]
  // - comma-separated string "Wifi, Kitchen"
  // - already an array (strings or objects)
  if (!input) return [];

  // if array already
  if (Array.isArray(input)) {
    return input.map((it) => {
      if (!it) return null;
      if (typeof it === "string") return { title: it.trim(), subtitle: "", iconKey: "" };
      // object
      return { title: (it.title || "").toString().trim(), subtitle: (it.subtitle || "").toString().trim(), iconKey: (it.iconKey || "").toString().trim() };
    }).filter(Boolean);
  }

  // if JSON string
  if (typeof input === "string") {
    // try parse JSON first
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return normalizeOffers(parsed);
    } catch (e) {
      // not JSON -> treat as comma-separated string
      const arr = input.split(",").map(s => s.trim()).filter(Boolean);
      return arr.map(t => ({ title: t, subtitle: "", iconKey: "" }));
    }
  }

  return [];
}


function parseOfferings(input) {
  if (!input && input !== "") return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {}
    return input.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
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
    const { hotelId, roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // basic fields
    if (typeof req.body.roomType !== "undefined") room.roomType = req.body.roomType;
    if (typeof req.body.pricePerNight !== "undefined") room.pricePerNight = Number(req.body.pricePerNight) || 0;
    if (typeof req.body.isAvailable !== "undefined") room.isAvailable = req.body.isAvailable === "true" || req.body.isAvailable === true;

    // description & offerings
    if (typeof req.body.description !== "undefined") room.description = req.body.description;
    if (typeof req.body.whatThisPlaceOffers !== "undefined") room.whatThisPlaceOffers = normalizeOffers(req.body.whatThisPlaceOffers);

    // amenities
    if (typeof req.body.amenities !== "undefined") {
      if (typeof req.body.amenities === "string") {
        try { room.amenities = JSON.parse(req.body.amenities); }
        catch (e) { room.amenities = req.body.amenities.split(",").map(s=>s.trim()).filter(Boolean); }
      } else if (Array.isArray(req.body.amenities)) room.amenities = req.body.amenities;
    }

    // removeImages handling
    if (typeof req.body.removeImages !== "undefined") {
      let removeArr = [];
      if (typeof req.body.removeImages === "string") {
        try { removeArr = JSON.parse(req.body.removeImages); } catch (e) { removeArr = req.body.removeImages.split(",").map(s=>s.trim()).filter(Boolean); }
      } else if (Array.isArray(req.body.removeImages)) removeArr = req.body.removeImages;
      if (removeArr.length) room.images = (room.images || []).filter(u => !removeArr.includes(u));
    }

    // handle new file uploads (req.files) — adapt to your upload middleware (multer memory)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // if you use multer memory storage:
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const r = await cloudinary.uploader.upload(dataUri, { folder: "rooms" });
        if (r?.secure_url) room.images.push(r.secure_url);
      }
    }

    await room.save();
    return res.json({ success: true, room });
  } catch (err) {
    console.error("updateAdminRoomWithImages error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

