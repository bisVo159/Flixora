import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    const [totalVideos,totalViews ,totalPlaylists, totalSubscribers, totalLikes, totalLikesInVideos] = await Promise.all([
        Video.countDocuments({owner: userId}),
        Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(String(userId)) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]),
        Playlist.countDocuments({owner: userId}),
        Subscription.countDocuments({channel: userId}),
        Like.countDocuments({likedBy: userId}),
        Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(String(userId)) } },
            { $lookup: { from: "likes", localField: "_id", foreignField: "video", as: "likes" } },
            // { $unwind: "$likes" },
            // { $group: { _id: null, totalLikes: { $sum: 1 } } }
            { $addFields: { likesCount: { $size: "$likes" } } },
            { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } }
        ])
    ]);

    const channelStats = {
        totalVideos,
        totalViews: totalViews?.[0]?.totalViews || 0,
        totalPlaylists,
        totalSubscribers,
        totalLikes,
        totalLikesInVideos: totalLikesInVideos?.[0]?.totalLikes || 0
    }

    res.status(200).json(
        new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    const videos = await Video.find({owner: userId});

    res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
})

export {
    getChannelStats,
    getChannelVideos
};