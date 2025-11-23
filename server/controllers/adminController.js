import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { users } from "@clerk/clerk-sdk-node";

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
 */
export const updateAdminRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        Object.assign(room, req.body);
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
        const users = await User.find({})
            .select("_id username email image role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, users });
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

export const createAdminRoom = async (req, res) => {
    try {
        const { hotelId, roomType, pricePerNight, amenities, images } = req.body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        const newRoom = await Room.create({ hotel: hotelId, roomType, pricePerNight, amenities, images });
        res.json({ success: true, room: newRoom });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


