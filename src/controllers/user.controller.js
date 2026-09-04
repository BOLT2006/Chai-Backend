import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { use } from "react";

const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateAccessToken();
    const accessToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong whilw generating refresh and access token"
    );
  }
};
// Register User
const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Get user details from frontend
  const { fullName, email, username, password } = req.body;

  // Step 2: Validation
  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3: Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Step 4: Get image paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Avatar is required
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Step 5: Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Check avatar upload
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Step 6: Create user in database
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Step 7: Remove password and refreshToken from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 8: Check user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  // Step 9: Send response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});
//Login User
const loginUser = asyncHandler(async (req, res) => {
  //req body se data le aau
  //username or email
  // find the  user
  //password check
  //access and refresh token
  // send cookies

  const { email, username, password } = req.body;

  // if username and email is not there --> throw error
  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
  .status(200)
  .clearCookie("accessToken" , options )
  .clearCookie("refreshToken" , options )
  .json(new ApiError(200 , {} , "User loggedout "))
});
export { registerUser, loginUser, logoutUser };
