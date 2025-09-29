import mongoose, {isValidObjectId} from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?.id;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscription = await Subscription.findOne({subscriber: userId, channel: channelId});
    if(subscription){
        await subscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }else{
        await Subscription.create({subscriber: userId, channel: channelId});
        return res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }
    const subscribers = await Subscription.find({channel: channelId}).populate("subscriber", "username fullName avatar");

    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber ID");
    }
    const subscriptions = await Subscription.find({subscriber: subscriberId}).populate("channel", "username fullName avatar");

    res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};