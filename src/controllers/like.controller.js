import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const like = await Like.findOne({likedBy: userId, video: videoId});
    if(like){
        await like.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Video unliked successfully")
        );
    }else{
        await Like.create({likedBy: userId, video: videoId});
        return res.status(200).json(
            new ApiResponse(200, null, "Video liked successfully")
        );
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");
    }
    const like = await Like.findOne({likedBy: userId, comment: commentId});
    if(like){
        await like.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Comment unliked successfully")
        );
    }else{
        await Like.create({likedBy: userId, comment: commentId});
        return res.status(200).json(
            new ApiResponse(200, null, "Comment liked successfully")
        );
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID");
    }

    const like = await Like.findOne({likedBy: userId, tweet: tweetId});
    if(like){
        await like.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet unliked successfully")
        );
    }else{
        await Like.create({likedBy: userId, tweet: tweetId});
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet liked successfully")
        );
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    const likedVideos = await Like.find({likedBy: userId, video: { $exists: true,$ne: null }})
    .populate("video","_id title videoFile thumbnail");
    res.status(200).json(
        new ApiResponse(200, likedVideos.map(like => like.video), "Liked videos fetched successfully")
    );
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};