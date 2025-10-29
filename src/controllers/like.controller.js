import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

    // A small utility function to check for valid ObjectIds
const validateObjectId = (id, paramName) => {
    if (!isValidObjectId(id)) {
      throw new ApiError(400, `Invalid ${paramName}`);
    }
  };


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const loggedInUser= req.user?._id;

    if(!user){
        throw new ApiError(401, "Unauthorized");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError (400, "Invalid videoId");
    }

    const isLiked = await Like.findOne({video: videoId, likedBy: loggedInUser});

    if(isLiked){
        //unlike
        await Like.findByIdAndDelete(isLiked._id);
        return res
                .status(200)
                .json(new ApiResponse(200, null , "Video unliked successfully"));
    }

    //like
    const newLike = await Like.create({
        video: videoId,
        likedBy: loggedInUser
    })

    return res
            .status(200)
            .json(new ApiResponse(200, newLike , "Video liked successfully"));


    

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const loggedInUser= req.user?._id;

    if(!loggedInUser){
        throw new ApiError(401, "Unauthorized");
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError (400, "Invalid commentId");
    }

    const isliked = await Like.findOne({comment: commentId, likedBy: loggedInUser});

    if(isliked){
        //unlike
        await Like.findByIdAndDelete(isliked._id);
        return res
                .status(200)
                .json(new ApiResponse(200, null , "Comment unliked successfully"));
    }

    //like
    const newLike = await Like.create({
        comment: commentId,
        likedBy: loggedInUser
    })

    return res
            .status(200)
            .json(new ApiResponse(200, newLike , "Comment liked successfully"));



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");
    const isLiked = await Like.findOne({ likedBy: req.user._id, tweet: tweetId });
    if (isLiked) {
      await Like.deleteOne({ likedBy: req.user._id, tweet: tweetId });
      return res
        .status(200)
        .json(new ApiResponse(200, { liked: false }, "Unliked tweet"));
    }
    await Like.create({ likedBy: req.user._id, tweet: tweetId });
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: true }, "Liked tweet"));
  });

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const loggedInUser= req.user?._id;
    if(!loggedInUser){
        throw new ApiError(401, "Unauthorized");
    }
    const likedVideos = await Like.find({
        likedBy: loggedInUser,
        video: { $exists: true, $ne: null }
      })
        .populate({
          path: "video",
          populate: {
            path: "owner", // if your Video model references a User as 'owner'
            select: "username email avatar"
          },
        })
        .sort({ createdAt: -1 }) // optional: newest likes first
        .select("-comment -tweet -__v"); // hide irrelevant fields

    if(!likedVideos || likedVideos.length === 0){
        return res
                .status(200)
                .json(new ApiResponse(200, [], "No liked videos found"));
    }

    return res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}