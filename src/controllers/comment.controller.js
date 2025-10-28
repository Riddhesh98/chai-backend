import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const skip = (page - 1) * limit

    // const comments = await Comment.find({video: videoId})
    //                                 .skip(skip)
    //                                 .limit(parseInt(limit))
    //                                 .populate("user", "username avatar");


    const comments = await Comment.aggregate([
        {
            $match :{
                video: new mongoose.Types.ObjectId(videoId)

            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }

        },
        {
            $unwind : "$owner"
        },

        {
            $lookup:{
                   from:"videos",
                     localField: "video",
                     foreignField: "_id",
                     as: "videoInfo"          
            }


        }
        ,
        {
            $unwind : "$videoInfo"
        },
        {
            $project:{
                content:1,
                createdAt:1,
                updatedAt:1,
                
                "owner.username":1,
                "owner.avatar":1,
                "videoInfo._id":1,
                "videoInfo.title":1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        }


    ])

         if(!comments){
        throw new ApiError(404, "There is no comments for this video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const {content} = req.body

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(400, "Comment could not be created")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, comment, "Comment added successfully")
    )



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    
    const {commentId} = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError (400, "Invalid comment ID")
    }

    const {content} = req.body

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:  {
                content
            }
        },
        {new: true}
    )

    if(!comment){
        throw new ApiError(404, "there is an error in updating the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError (400, "Invalid comment ID")
    }
    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found or already deleted")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )
    


})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }