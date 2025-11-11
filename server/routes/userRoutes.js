import express from "express";
import { requireAuth } from "@clerk/express";
import { syncClerkUser, getUserData, storeRecentSearchedCities } from "../controllers/userController.js";

const userRouter = express.Router();

// upsert the signed-in user into Mongo with default role "user"
userRouter.post("/sync", requireAuth(), syncClerkUser);

// signed-in endpoints
userRouter.get("/", requireAuth(), getUserData);
userRouter.post("/store-recent-search", requireAuth(), storeRecentSearchedCities);

export default userRouter;
