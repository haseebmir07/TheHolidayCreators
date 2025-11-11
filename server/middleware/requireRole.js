// server/middleware/requireRole.js
import { getAuth } from "@clerk/express";
import Clerk from "@clerk/clerk-sdk-node";

export const requireRole = (neededRole) => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not signed in" });
      }

      // Pull role from Clerk (source of truth)
      const clerkUser = await Clerk.users.getUser(userId);
      const role = clerkUser.publicMetadata?.role;

      if (role !== neededRole) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" });
      }

      // (optional) mirror to DB for convenience
      req.userRole = role;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
};
