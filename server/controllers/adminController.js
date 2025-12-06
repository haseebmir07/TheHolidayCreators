// server/controllers/adminController.js
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { users } from "@clerk/clerk-sdk-node";

/* ---------------- Helper ---------------- */

function parseOfferings(input) {
  if (!input && input !== "") return [];
  if (Array.isArray(input))
    return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed))
        return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {
      // ignore JSON error, treat as comma-separated
    }
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/* ---------------- OVERVIEW & BOOKINGS ---------------- */

export const getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, totalHotels, totalRooms, totalBookings, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        Hotel.countDocuments(),
        Room.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
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

export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "username email image")
      .populate("room", "roomType pricePerNight fullPrice")
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

export const updateAdminBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isPaid } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
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

/* ---------------- HOTELS ---------------- */

/**
 * CREATE HOTEL (ADMIN)
 * Uses same required fields as owner flow (name, address, contact, city)
 * and ensures required `owner` is always set.
 */
export const createAdminHotel = async (req, res) => {
  try {
    const { name, address, contact, city, description } = req.body;

    // required fields from your Hotel schema / owner flow
    if (!name || !address || !contact || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, address, contact and city are required",
      });
    }

    // 1) Try to get owner from current Clerk user
    const clerkUserId = req.auth?.userId;
    let ownerUser = null;

    if (clerkUserId) {
      ownerUser = await User.findOne({ clerkId: clerkUserId });
    }

    // 2) Fallback: use any existing user (prefer hotelOwner, then admin, then anyone)
    if (!ownerUser) {
      ownerUser =
        (await User.findOne({ role: "hotelOwner" })) ||
        (await User.findOne({ role: "admin" })) ||
        (await User.findOne());
    }

    // 3) If still nothing, there is no user in DB
    if (!ownerUser) {
      return res.status(400).json({
        success: false,
        message:
          "No user found in database to assign as hotel owner. Please create at least one user first.",
      });
    }

    // 4) Create hotel with valid owner
    const hotel = await Hotel.create({
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
      city: city.trim(),
      description: description?.trim() || "",
      owner: ownerUser._id, // ✅ required field satisfied
    });

    return res.json({ success: true, hotel });
  } catch (err) {
    console.error("createAdminHotel error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create hotel",
    });
  }
};

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

export const updateAdminHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    Object.assign(hotel, updates);
    await hotel.save();

    res.json({ success: true, hotel });
  } catch (err) {
    console.error("updateAdminHotel error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAdminHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    await Room.deleteMany({ hotel: id });
    await Booking.deleteMany({ hotel: id });
    await hotel.deleteOne();

    res.json({
      success: true,
      message: "Hotel and related rooms/bookings deleted",
    });
  } catch (err) {
    console.error("deleteAdminHotel error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHotelOnly = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Hotel id required" });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    await Hotel.deleteOne({ _id: id });
    await Room.updateMany({ hotel: id }, { $set: { hotel: null } });

    return res.json({
      success: true,
      message: "Hotel deleted (rooms preserved, hotel reference cleared)",
    });
  } catch (err) {
    console.error("deleteHotelOnly error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getAdminHotelRooms = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    const rooms = await Room.find({ hotel: id }).lean();
    res.json({ success: true, hotel, rooms });
  } catch (err) {
    console.error("getAdminHotelRooms error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- ROOMS ---------------- */

export const updateAdminRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const {
      roomType,
      pricePerNight,
      fullPrice,
      isAvailable,
      amenities,
      description,
      whatThisPlaceOffers,
      images,
    } = req.body;

    if (roomType != null) room.roomType = roomType;
    if (pricePerNight != null)
      room.pricePerNight = Number(pricePerNight) || 0;
    if (fullPrice != null)
      room.fullPrice = Number(fullPrice) || room.pricePerNight;
    if (typeof isAvailable === "boolean") room.isAvailable = isAvailable;
    if (description != null) room.description = description;

    if (amenities != null) {
      let arr = [];
      if (typeof amenities === "string") {
        try {
          arr = JSON.parse(amenities);
        } catch (e) {
          arr = amenities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(amenities)) {
        arr = amenities;
      }
      room.amenities = arr;
    }

    if (whatThisPlaceOffers != null) {
      room.whatThisPlaceOffers = parseOfferings(whatThisPlaceOffers);
    }

    if (images != null && Array.isArray(images)) {
      room.images = images;
    }

    await room.save();
    res.json({ success: true, room });
  } catch (err) {
    console.error("updateAdminRoom error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAdminRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    await Booking.deleteMany({ room: roomId });
    await room.deleteOne();

    res.json({ success: true, message: "Room and its bookings deleted" });
  } catch (err) {
    console.error("deleteAdminRoom error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAdminRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomType,
      pricePerNight,
      fullPrice,
      amenities,
      images,
      description,
      whatThisPlaceOffers,
    } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    let amenitiesArr = [];
    if (amenities) {
      if (typeof amenities === "string") {
        try {
          amenitiesArr = JSON.parse(amenities);
        } catch (e) {
          amenitiesArr = amenities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(amenities)) {
        amenitiesArr = amenities;
      }
    }

    const offeringsArr = parseOfferings(whatThisPlaceOffers);

    const newRoom = await Room.create({
      hotel: hotelId,
      roomType,
      pricePerNight: Number(pricePerNight) || 0,
      fullPrice:
        fullPrice != null
          ? Number(fullPrice) || 0
          : Number(pricePerNight) || 0,
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

/* ---------------- USERS ---------------- */

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

export const updateAdminUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "hotelOwner", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.deleteOne();

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteAdminUser error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- BOOKING HELPERS ---------------- */

export const setBookingPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

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
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.status = "cancelled";
    booking.isPaid = false;
    await booking.save();

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
