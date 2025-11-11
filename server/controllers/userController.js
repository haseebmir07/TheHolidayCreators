import User from "../models/User.js";
import { getAuth } from "@clerk/express";
import Clerk from "@clerk/clerk-sdk-node";

/**
 * POST /api/user/sync
 * Upsert the Clerk user into MongoDB.
 * Default role = "user" unless Clerk publicMetadata.role is set.
 */
export const syncClerkUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not signed in" });
    }

    const clerkUser = await Clerk.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role || "user";

    const user = await User.findByIdAndUpdate(
      userId,
      {
        _id: userId,
        username:
          clerkUser.username ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        image: clerkUser.imageUrl || "",
        role,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/user
 * Return the signed-in user's role and recentSearchedCities from MongoDB.
 */
export const getUserData = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not signed in" });
    }
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.json({ success: true, role: "user", recentSearchedCities: [] });
    }
    const { role, recentSearchedCities = [] } = user;
    res.json({ success: true, role, recentSearchedCities });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * POST /api/user/recent-searched-cities
 * Add a city to the user's recentSearchedCities (max 3).
 */
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not signed in" });
    }

    const { recentSearchedCity } = req.body;
    if (!recentSearchedCity) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const arr = user.recentSearchedCities || [];
    const next = [...arr.filter(c => c !== recentSearchedCity), recentSearchedCity].slice(-3);

    user.recentSearchedCities = next;
    await user.save();

    res.json({ success: true, message: "City added", recentSearchedCities: next });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
