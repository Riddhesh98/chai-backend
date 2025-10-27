import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// A small utility function to check for valid ObjectIds
const validateObjectId = (id, paramName) => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${paramName}`);
  }
};

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId = req.user._id

    validateObjectId(channelId, "channelId");

    if (subscriberId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
        
    })
    if (existingSubscription) {
        await Subscription.deleteOne({
          channel: channelId,
          subscriber: subscriberId,
        });

        return res
        .status(200)
        .json(
          new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
      }
      // If no existing subscription, create a new one
      else {
        await Subscription.create({
          channel: channelId,
          subscriber: subscriberId,
        });
    
        return res
          .status(201) // Use 201 Created for a new resource
          .json(
            new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
          );
      }
 
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const subscribers =  await Subscription.find(
      {
        channel: channelId,
      }
    ).populate("subscriber", "username email avatar")
      .exec();   
    
      if(subscribers.length === 0){
        return res
        .status(200)
        .json(
          new ApiResponse(200, [], "No subscribers found for this channel")
        );
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
  
    })

  

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    const subscriptions = await Subscription.find(
      {
        subscriber: subscriberId,
      }
    ).populate("channel", "username email avatar")
      .exec();
    if(subscriptions.length === 0){
        return res
        .status(200)
        .json(
          new ApiResponse(200, [], "No subscriptions found for this user")
        );
      }

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"))
      

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}