import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10,query, sortBy = "createdAt", order = "desc" } = req.query;

    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    const pipeline=[
        { $match: { owner: new mongoose.Types.ObjectId.createFromHexString(userId) } },
        { $sort: { [sortBy]: order === "desc" ? -1 : 1 } },
    ]

    if (query) {
        pipeline.unshift({
            $match: {
                title: { $regex: query, $options: "i" }
            }
        });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos"
        }
    };

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    res.status(200).json(new ApiResponse(200,result, "Videos fetched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    if([title,description].some(field => !field || field.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnail = req.files?.thumbnail?.[0]?.path;

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const userId = req.user?.id;

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // const uploadedVideo = await uploadOnCloudinary(videoFile, "auto", "videos");
    // const uploadedThumbnail = await uploadOnCloudinary(thumbnail, "image", "thumbnails");

    const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        uploadOnCloudinary(videoFile, "auto", "videos"),
        uploadOnCloudinary(thumbnail, "image", "thumbnails")
    ]);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "Failed to upload video or thumbnail");
    }

    const newVideo = await Video.create({
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        title: title.trim(),
        description: description.trim(),
        duration: uploadedVideo.duration,
        owner: user._id
    });

    res.status(201).json(
        new ApiResponse(201,newVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId).populate("owner", "username fullName");
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(
        new ApiResponse(200,video, "Video fetched successfully")
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body;

    if([title,description].some(field => !field || field.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const userId = req.user?.id;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const thumbnail = req.file?.path;
    if(thumbnail){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail, "image", "thumbnails");
        if(!uploadedThumbnail){
            throw new ApiError(500, "Failed to upload thumbnail");
        }
        const isDeleted = await deleteFromCloudinary(video.thumbnail);
        if(!isDeleted){
            throw new ApiError(500, "Failed to delete old thumbnail from cloud");
        }
        video.thumbnail = uploadedThumbnail.secure_url;
    }

    video.title = title.trim();
    video.description = description.trim();
    await video.save();
    
    res.status(200).json(
        new ApiResponse(200,video, "Video updated successfully")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?.id;

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    const [videoDeleted, thumbnailDeleted] = await Promise.all([
        deleteFromCloudinary(video.videoFile),
        deleteFromCloudinary(video.thumbnail)
    ]);

    if(!videoDeleted || !thumbnailDeleted){
        throw new ApiError(500, "Failed to delete video or thumbnail from cloud");
    }
    await video.remove();
    res.status(200).json(
        new ApiResponse(200,null, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?.id;

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this video");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200).json(
        new ApiResponse(200,video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    );
})

export { 
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};

