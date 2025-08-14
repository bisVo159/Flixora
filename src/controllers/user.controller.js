import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (useId) => {
    try {
        const user =await User.findById(useId).select("-password -refreshToken");
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false 
        });
        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        throw ApiError(500, "Failed to generate tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    // Validate required fields
    if([username, email, fullName, password].some(
        field => field?.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // Handle file uploads if provided
    // console.log("FIles ",req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if( !avatarLocalPath ) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Upload images to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath, "auto" ,"avatars");

    const coverImage = coverLocalPath ? await uploadOnCloudinary(coverLocalPath, "auto", "covers") : null;

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    // Create new user
    const newUser = await User.create({
        username,
        email,
        fullName,
        password, 
        avatar : avatar.secure_url,
        coverImage : coverImage?.secure_url || ""
    });

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    res.status(201).json(
        new ApiResponse(201,createdUser, "User registered successfully")
    );
});

const loginUser=asyncHandler(async (req,res)=>{
    const { username, email, password } = req.body;

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user =await User.findOne({ $or: [
        { username: username?.trim() }, 
        { email: email?.trim() }
    ] }).select(
        "-refreshToken -watchHistory"   
    );
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid username or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -watchHistory"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    );
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: undefined }
        }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    );
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || 
    req.header("Authorization")?.replace("Bearer ", "") || 
    req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access, refresh token is missing");
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded) {
            throw new ApiError(401, "Unauthorized access, invalid refresh token");
        }
    
        const user = await User.findById(decoded.id).select("-password -watchHistory");
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        const { accessToken, refreshToken }=await generateAccessAndRefreshTokens(user._id);
    
        const options = {
            httpOnly: true,
            secure: true,
        };
        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken },
            "Access token refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access, token verification failed");
    }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
 };