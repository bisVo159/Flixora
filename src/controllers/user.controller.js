import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const avatarLocalPath = req.files?.avatar[0].path;
    const coverLocalPath = req.files?.coverImage[0].path;

    if( !avatarLocalPath ) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Upload images to Cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath, "auto" ,"avatars");

    const coverImage = coverLocalPath ? await uploadToCloudinary(coverLocalPath, "auto", "covers") : null;

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

export { registerUser };