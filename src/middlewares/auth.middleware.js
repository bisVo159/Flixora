import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
        if (!token) {
            throw new ApiError(401, "Unauthorized access, token is missing");
        }
    
        const decoded= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            throw new ApiError(401, "Unauthorized access, invalid token");
        }
    
        const user = await User.findById(decoded.id)
        .select("-password -refreshToken -watchHistory");
    
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access, token verification failed");
    }
});
