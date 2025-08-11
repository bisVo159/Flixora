import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // const { username, email, fullName, avatar, coverImage, password } = req.body;

    // // Validate required fields
    // if (!username || !email || !fullName || !avatar || !password) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "All fields are required"
    //     });
    // }

    // // Check if user already exists
    // const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // if (existingUser) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Username or email already exists"
    //     });
    // }

    // // Create new user
    // const newUser = new User({
    //     username,
    //     email,
    //     fullName,
    //     avatar,
    //     coverImage,
    //     password
    // });

    // await newUser.save();

    // res.status(201).json({
    //     success: true,
    //     message: "User registered successfully",
    //     user: {
    //         id: newUser._id,
    //         username: newUser.username,
    //         email: newUser.email,
    //         fullName: newUser.fullName,
    //         avatar: newUser.avatar,
    //         coverImage: newUser.coverImage
    //     }
    // });
    // testing
    res.status(200).json({
        success: true,
        message: "User registration endpoint is working",
        data: null
    });
});

export { registerUser };