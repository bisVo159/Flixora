import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!title || title.trim() === ""){
        throw new ApiError(400, "Playlist title is required");
    }
    if(!description || description.trim() === ""){
        throw new ApiError(400, "Playlist description is required");
    }
    const playlist = await Playlist.create({title, description, owner: userId});

    res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID");
    }
    const playlists = await Playlist.find({owner: userId})
    .populate("videos")
    .populate("owner", "username fullName avatar");

    res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "username fullName avatar");

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const [video, playlist] = await Promise.all([
        Video.findById(videoId),
        Playlist.findById(playlistId)
    ]);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video already exists in the playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const [video, playlist] = await Promise.all([
        Video.findById(videoId),
        Playlist.findById(playlistId)
    ]);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video does not exist in the playlist");
    }
    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {title, description} = req.body
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!title || title.trim() === ""){
        throw new ApiError(400, "Playlist title is required");
    }
    if(!description || description.trim() === ""){
        throw new ApiError(400, "Playlist description is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    playlist.title = title.trim();
    playlist.description = description.trim();
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};