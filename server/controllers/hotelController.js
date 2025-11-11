import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { getAuth } from "@clerk/express";
import Clerk from "@clerk/clerk-sdk-node";  // <-- correct import

export const registerHotel = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not signed in" });
    }

    const owner = userId;
    const { name, address, contact, city } = req.body;

    const existingHotel = await Hotel.findOne({ owner });
    if (existingHotel) {
      return res.json({
        success: false,
        message: "Hotel already registered for this account",
      });
    }

    let user = await User.findById(owner);

    if (!user) {
      const clerkUser = await Clerk.users.getUser(owner);  // ✅ Correct usage

      user = await User.create({
        _id: owner,
        username:
          clerkUser.username ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "unknown@example.com",
        image: clerkUser.imageUrl || "",
        role: "user",
        recentSearchedCities: [],
      });
    }

    // if (user.role !== "hotelOwner") {
    //   await User.findByIdAndUpdate(owner, { role: "hotelOwner" });
    // }

    await Hotel.create({ name, address, contact, city, owner });

    return res.json({
      success: true,
      message: "Hotel registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
// GET /api/hotels

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().lean(); // simple list
    return res.json({ success: true, hotels });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

