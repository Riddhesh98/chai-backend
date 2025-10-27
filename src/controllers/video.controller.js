import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Video} from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query,sortBy = 'createdAt', 
        sortType = 'desc',  userId } = req.query

      //TODO: get all videos based on query, sort, pagination

    // Convert page & limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
        
    const filter = {}

    if (query) {
        filter.title = { $regex: query, $options: 'i' }
    }

    if (userId) {
        filter.owner = userId
    }

    const Videos = Video.aggregate([
        {
            $match: filter
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'ownerInfo'
        } 
        },
        {
            $unwind: {
                path: '$ownerInfo',
                preserveNullAndEmptyArrays: true
            } 

        }
    ]);

    const options = {
        page: pageNumber,
        limit: limitNumber,
        sort: { [sortBy]: sortType === 'asc' ? 1 : -1 }
    };

    const result = await Video.aggregatePaginate(Videos, options);

   return res
        .status(200)
        .json(new ApiResponse(true,  result , "Videos fetched successfully"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400, "Title and description are required");
    }


    if(!req.files || !req.files.videoFile || !req.files.thumbnail){
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoLocalPath = req.file.videoFile[0].path;
    const thumbnailLocalPath = req.file.thumbnail[0].path;

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(500, "Error in uploading files");
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    const video = videoUpload.url;
    
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    const thumbnail = thumbnailUpload.url;
    
    const newVideo = await Video.create({
        title,
        description,
        isPublished,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user._id,
       

})

    return res
        .status(201)
        .json(new ApiResponse(true, newVideo, "Video published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
     if(!videoId){
        throw new ApiError(400, "Video ID is required");
     }

     const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            },
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
            },
        },
        {
            $unwind : "$ownerInfo"
        },
        {
            $project:{
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
              "ownerInfo.fullName": 1,
                "ownerInfo.username": 1,
                "ownerInfo.avatar": 1,
                "ownerInfo.coverImage": 1
        
            }
        }


     ])

     if(!video){
        throw new ApiError(404, "Video not found");
     }

        return res
            .status(200)
            .json(new ApiResponse(true, video, "Video fetched successfully"));


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new ApiError(400, "Video ID is required");
    }

    const { title, description } = req.body

    // if(!title && !description){
    //     throw new ApiError(400, "At least one field (title or description) is required to update");
    // }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    const videoFileUrl = videoFileLocalPath ? (await uploadOnCloudinary(videoFileLocalPath)).url : null
    const thumbnailUrl = thumbnailLocalPath ? (await uploadOnCloudinary(thumbnailLocalPath)).url : null

    //from frontend we will take all value else old value will be there
    const updateData = {}
    if(title) updateData.title = title
    if(description) updateData.description = description
    if(videoFileUrl) updateData.videoFile = videoFileUrl
    if(thumbnailUrl) updateData.thumbnail = thumbnailUrl
    
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData
        },
        { new: true }

        
    )

    if(!video){
        throw new ApiError(404, "update you want there details is not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(true, video, "Video updated successfully"));
        


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400, "Video ID is required");
    }

   const result = await Video.findByIdAndDelete(videoId)

    if(!result){
        throw new ApiError(404, "Video is not deleted,please try again later");    
    }

    return res
        .status(200)
        .json(new ApiResponse(true, null, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }


    )

    if(!video){
        throw new ApiError(404, "Something went wrong for toggle publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(true, video, "Video publish status toggled successfully") );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}