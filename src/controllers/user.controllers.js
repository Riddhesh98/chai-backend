import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler ( async (req,res) => {
       // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName , email,username,password} = req.body;
    console.log("email:", email);


    if(
        [fullName , email,username,password].some((field) =>
        field?.trim() ===   "")
    ){
        throw new ApiError(400,"All fields are required");
        
    }

    // check if user already exists
    const existedUser = User.findOne({
        $or : [{ email } , { username }],
    })

    if(existedUser){
        throw new ApiError(409, "User already exists, try logging in");
    }

    const avtarLocalPath = req.files?.avatar[0]?.path;  
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    // upload to cloudinary

    const avatar = await uploadToCloudinary(avtarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500,"Could not upload avatar, try again later");
    }

     const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),

    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Could not create user, try again later");
    }

    return res.status(201).json(
        ApiResponse(200,createdUser,"User created successfully")
    )

});
export {registerUser}