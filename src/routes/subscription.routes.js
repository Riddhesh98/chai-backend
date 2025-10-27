import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//  Toggle subscription (subscribe/unsubscribe)
router.post("/toggle/:channelId", verifyJWT, toggleSubscription);

//  Get all subscribers of a specific channel
router.get("/channel/:channelId/subscribers", verifyJWT, getUserChannelSubscribers);

//  Get all channels a specific user has subscribed to
router.get("/user/:subscriberId/channels", verifyJWT, getSubscribedChannels);

export default router;
