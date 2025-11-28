// server/controllers/adminController.js
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { users } from "@clerk/clerk-sdk-node";

/**
 * Small helper to parse whatThisPlaceOffers from various client formats:
 * - JSON stringified array (from multipart FormData)
 * - actual array (from JSON body)
 * - comma separated string "Wifi, Pool"
 */
function parseOfferings(input) {
  if (!input && input !== "") return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {
      // not JSON, fall back to comma split
    }
    return input.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * GET /api/admin/overview
 * High-level stats for admin dashboard
 */
export const getAdminOverview = async (req, res) => {
    try {
        const [totalUsers, totalHotels, totalRooms, totalBookings, revenueAgg] =
            await Promise.all([
                User.countDocuments(),
                Hotel.countDocuments(),
                Room.countDocuments(),
                Booking.countDocuments(),
                Booking.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
            ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        res.json({
            success: true,
            overview: {
                totalUsers,
                totalHotels,
                totalRooms,
                totalBookings,
                totalRevenue,
            },
        });
    } catch (err) {
        console.error("getAdminOverview error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/admin/bookings
 * List latest bookings for admin
 */
export const getAdminBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate("user", "username email image")
            .populate("room", "roomType pricePerNight")
            .populate("hotel", "name city address")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({ success: true, bookings });
    } catch (err) {
        console.error("getAdminBookings error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PATCH /api/admin/bookings/:id
 * Update booking status or payment flag
 */
export const updateAdminBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (status) booking.status = status;
        if (typeof isPaid === "boolean") booking.isPaid = isPaid;

        await booking.save();

        res.json({ success: true, booking });
    } catch (err) {
        console.error("updateAdminBooking error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/admin/hotels
 * List all hotels with owner info
 */
export const getAdminHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({})
            .populate("owner", "username email image role")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, hotels });
    } catch (err) {
        console.error("getAdminHotels error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/admin/hotels/:id
 * Update hotel details (admin override)
 */
export const updateAdminHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        Object.assign(hotel, updates);
        await hotel.save();

        res.json({ success: true, hotel });
    } catch (err) {
        console.error("updateAdminHotel error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/admin/hotels/:id
 * Delete hotel + its rooms (and optionally bookings)
 */
export const deleteAdminHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        // delete its rooms
        await Room.deleteMany({ hotel: id });

        // optionally also delete bookings tied to this hotel
        await Booking.deleteMany({ hotel: id });

        await hotel.deleteOne();

        res.json({ success: true, message: "Hotel and related rooms/bookings deleted" });
    } catch (err) {
        console.error("deleteAdminHotel error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/admin/hotels/:id/rooms
 * List rooms for a specific hotel
 */
export const getAdminHotelRooms = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        const rooms = await Room.find({ hotel: id }).lean();
        res.json({ success: true, hotel, rooms });
    } catch (err) {
        console.error("getAdminHotelRooms error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/admin/rooms/:roomId
 * Update room details (admin)
 *
 * This handler will accept:
 * - JSON body (regular update)
 * - multipart FormData (files + fields). If FormData contains 'whatThisPlaceOffers' as JSON string, it will be parsed.
 */
export const updateAdminRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // If request body includes whatThisPlaceOffers, parse it safely
        if (typeof req.body.whatThisPlaceOffers !== "undefined") {
          room.whatThisPlaceOffers = parseOfferings(req.body.whatThisPlaceOffers);
        }

        // description
        if (typeof req.body.description !== "undefined") room.description = req.body.description;

        // amenities: accept stringified JSON or comma-separated
        if (typeof req.body.amenities !== "undefined") {
          if (typeof req.body.amenities === "string") {
            try {
              room.amenities = JSON.parse(req.body.amenities);
            } catch (e) {
              room.amenities = req.body.amenities.split(",").map(s => s.trim()).filter(Boolean);
            }
          } else if (Array.isArray(req.body.amenities)) {
            room.amenities = req.body.amenities;
          }
        }

        // non-destructive assign for other simple fields
        const allowed = ["roomType", "pricePerNight", "isAvailable"];
        allowed.forEach((field) => {
          if (typeof req.body[field] !== "undefined") {
            if (field === "pricePerNight") room[field] = Number(req.body[field]) || 0;
            else if (field === "isAvailable") room[field] = req.body[field] === "true" || req.body[field] === true;
            else room[field] = req.body[field];
          }
        });

        // NOTE: image handling (if using multipart) is handled in adminRoomsController (createAdminRoomWithImages / updateAdminRoomWithImages).
        // This UPDATE route (generic) does not attempt to process files here to avoid breaking existing flow.

        await room.save();

        res.json({ success: true, room });
    } catch (err) {
        console.error("updateAdminRoom error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/admin/rooms/:roomId
 * Delete a room (admin)
 */
export const deleteAdminRoom = async (req, res) => {
    try {
        // note: route may include hotelId as first param in some routes; we rely on roomId
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        await Booking.deleteMany({ room: roomId });
        await room.deleteOne();

        res.json({ success: true, message: "Room and its bookings deleted" });
    } catch (err) {
        console.error("deleteAdminRoom error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * GET /api/admin/users
 * List all users
 */
export const getAdminUsers = async (req, res) => {
    try {
        const usersList = await User.find({})
            .select("_id username email image role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, users: usersList });
    } catch (err) {
        console.error("getAdminUsers error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/admin/users/:id/role
 * Update user role: user / hotelOwner / admin
 */
export const updateAdminUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["user", "hotelOwner", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.role = role;
        await users.updateUser(user._id, {
            publicMetadata: { role },
        });

        res.json({ success: true, user });
    } catch (err) {
        console.error("updateAdminUserRole error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user (simple version – does not clean up all dependent data)
 */
export const deleteAdminUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.deleteOne();

        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        console.error("deleteAdminUser error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const setBookingPaid = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.isPaid = true;
        booking.status = "confirmed";
        await booking.save();

        res.json({ success: true, message: "Marked as paid", booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.status = "cancelled";
        booking.isPaid = false;
        await booking.save();

        res.json({ success: true, message: "Booking cancelled", booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/admin/hotels/:id/only
export const deleteHotelOnly = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Hotel id required" });

    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    // Delete hotel document only
    await Hotel.deleteOne({ _id: id });

    // Detach hotel reference from rooms that belonged to this hotel.
    // We set hotel to null so rooms remain in DB but are not linked to a removed hotel.
    await Room.updateMany({ hotel: id }, { $set: { hotel: null } });

    return res.json({ success: true, message: "Hotel deleted (rooms preserved, hotel reference cleared)" });
  } catch (err) {
    console.error("deleteHotelOnly error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * Create admin room (simple JSON fallback) - keep original behavior but accept description & offerings
 * POST /api/admin/rooms
 */
export const createAdminRoom = async (req, res) => {
    try {
        const { hotelId, roomType, pricePerNight, amenities, images, description, whatThisPlaceOffers } = req.body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        // parse amenities & offerings safely
        let amenitiesArr = [];
        if (amenities) {
          if (typeof amenities === "string") {
            try { amenitiesArr = JSON.parse(amenities); } catch (e) { amenitiesArr = amenities.split(",").map(s=>s.trim()).filter(Boolean); }
          } else if (Array.isArray(amenities)) amenitiesArr = amenities;
        }

        const offeringsArr = parseOfferings(whatThisPlaceOffers);

        const newRoom = await Room.create({
            hotel: hotelId,
            roomType,
            pricePerNight: Number(pricePerNight) || 0,
            amenities: amenitiesArr,
            images: images || [],
            description: description || "",
            whatThisPlaceOffers: offeringsArr,
        });

        res.json({ success: true, room: newRoom });
    } catch (err) {
        console.error("createAdminRoom error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
