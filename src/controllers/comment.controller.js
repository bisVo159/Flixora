import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const query = Comment.aggregate([
        {$match: {video: mongoose.Types.ObjectId(videoId)}},
        {$sort: {createdAt: -1}},
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {$unwind: "$owner"},
        {
            $project: {
                content: 1,
                video: 1,
                owner: {_id: 1, username: 1, fullName: 1, avatar: 1},
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalComments",
            docs: "comments"
        }
    };
    const result = await Comment.aggregatePaginate(query, options);

    res.status(200).json(
        new ApiResponse(200,result, "Comments fetched successfully")
    );
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    });
    res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.owner.toString() !== userId){
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();

    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};