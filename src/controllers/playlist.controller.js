import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const user = req.user?._id;

    const newPlaylist = Playlist.create({
        name,
        description,
        owner: user
    })

    if(!newPlaylist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))

})



const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const playlists = await Playlist.find({owner: userId})

    if(!playlists) {
        throw new ApiError(404, "No playlists found for this user")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos").populate("owner", "username email")

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const loggedInUser= req.user?._id;
      // 1. Basic validation for ObjectIDs
        if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist ID or video ID")
        }
        
  // 2. Find the playlist and verify ownership
        const playlist = await Playlist.findById(playlistId)

        if(!playlist) {
            throw new ApiError(404, "Playlist not found")
        }


        if(playlist.owner.toString() !== loggedInUser.toString()) {
            throw new ApiError(403, "You are not authorized to add videos to this playlist")
        }

        // 3. Check if the video is already in the playlist

        if(playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video already exists in the playlist")
        }
        // 4. Add the video to the playlist

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $push: { videos: videoId } },
            { new: true } // { new: true } returns the updated document
          );

        return res
            .status(200)
            .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    const loggedInUser= req.user?._id;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== loggedInUser.toString()) {
        throw new ApiError(403, "You are not authorized to remove videos from this playlist")
    }

    if(!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video does not exist in the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true } // { new: true } returns the updated document
      );

      if(!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist")
      }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
    


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const loggedInUser= req.user?._id;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== loggedInUser.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

   const result= await Playlist.findByIdAndDelete(playlistId)

    if(!result) {
     throw new ApiError(500, "Failed to delete playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const loggedInUser= req.user?._id;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== loggedInUser.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const updatedData = {}
    if(name) updatedData.name = name
    if(description) updatedData.description = description

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updatedData },
        { new: true } // { new: true } returns the updated document
      );

      if(!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist")
      }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
        
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}