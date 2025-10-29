import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} =  req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const   userId = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.find({owner: userId})
    .populate("owner", "username fullName avatar")
    .sort({createdAt: -1})

        if(tweets.length === 0){
        return res
        .status(200)
        .json(new ApiResponse(true, [], "No tweets found for this user"))

        
    }

    return res
    .status(200)
    .json(new ApiResponse(true, tweets, "User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {userId} = req.user._id
    const {content} = req.body
    const {tweetId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }
    if(!content){
        throw new ApiError(400, "Content is required")
    }
     await Tweet.updateOne(
        {owner: userId , _id: tweetId},
        {$set: {content}},
        {new: true}
     )  


    return  res
    .status(200)
    .json(new ApiResponse(true, null, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {userId} = req.user._id
    const {tweetId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }

 const tweet=   await Tweet.findOneAndDelete(
        {owner: userId , _id: tweetId}

 )
    

    if(!tweet){
        throw new ApiError(404, "Tweet not found or you are not authorized to delete this tweet")
    }


    return res
    .status(200)
    .json (new ApiResponse (true, null, "Tweet deleted successfully"))

})

    

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}