import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {  uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";



const generateAcessAndRefreshToken = async (userId) => {
    try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave: false});

            return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Could not generate tokens, try again later");
    }
}

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
    const existedUser =  await User.findOne({
        $or : [{ email } , { username }],
    })

    if(existedUser){
        throw new ApiError(409, "User already exists, try logging in");
    }

    const avatarLocalPath = await req.files?.avatar[0]?.path;
    const coverImagePath="";  
    if (req.files?.coverImage?.length > 0) {
        // Safe to access req.files.coverImage[0]
        const coverImagePath = await req.files.coverImage[0].path;
      }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    // upload to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

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
       new ApiResponse(200,createdUser,"User created successfully")
    )

});


// req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

const loginUser = asyncHandler( async (req,res) => {
    const {username,email,password} = req.body;

    if(!(username || email) ){
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or : [ { username } , { email } ]
    })

    if(!user){
        throw new ApiError(404,"User not found, invalid login credentials");
    }

   const isPasswordValid=  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
     throw new ApiError(401,"Invalid login credentials");
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(500,"Could not login user, try again later");
    }

    const options = {
        httpOnly: true,
        secure : true,
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken , options)
    .cookie("accessToken", accessToken , options)
    .json(
        new ApiResponse(200, 
            {user : loggedInUser, accessToken 
                ,refreshToken
            },
             "User logged in successfully")
    );
})

    const logoutUser = asyncHandler ( async (req,res) => {
        // clear cookies
        // remove refresh token from db

        User.findByIdAndUpdate(
            req.user._id,
            {
                $set  :{
                    refreshToken : undefined,
                }

            },
            {
                new : true,
            }
        );


        const options = {
            httpOnly: true,
            secure : true,
        }


        return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json({
            new : ApiResponse(200, {}, "User logged out successfully")
        })    
    })


    const refreshAccessToken = asyncHandler ( async (req,res) => {

       const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;

         if(!incomingRefreshToken){
          throw new ApiError(401,"Refresh token missing, please login again");
         }

            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );

            const user = await User.findById(decodedToken?._id);

            if(!user ){
                throw new ApiError(401,"Invalid refresh token, please login again");
            }

            if(user.refreshToken !== incomingRefreshToken){
                throw new ApiError(401,"Refresh token mismatch, please login again");
            }
    
            const options = {
                httpOnly: true,
                secure : true,
            }

            const{
                accessToken,
                refreshToken
            } = await generateAcessAndRefreshToken(user._id);

            return res
            .status(200)
            .cookie("refreshToken", refreshToken , options)
            .cookie("accessToken", accessToken , options)
            .json(
                new ApiResponse(200,
                     { accessToken, refreshToken },
                      "Access token refreshed successfully")
            );
        })


        const changeCurrentPassword = asyncHandler ( async (req,res) => {
            const {oldPassword,newPassword} = req.body;

        const user=    await User.findById(req.user?._id)

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordCorrect){
            throw new ApiError(400,"Old password is incorrect");
        }   

        user.password = newPassword;
        await user.save({validateBeforeSave : false});

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Password changed successfully")
        ); 
        })

        const getCurrentUser = asyncHandler ( async (req,res) => {
            return res
            .status(200)
            .json(
                new ApiResponse(200, {user : req.user},"Current user fetched successfully")
            );
        })


        const updateAccountDetails = asyncHandler ( async (req,res) => {
            const {email , fullName} = req.body;

            if(!email || !fullName){
                throw new ApiError(400,"Email and full name are required");
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set : {
                        email,
                        fullName,
                    }
                },
                {
                    new : true,
                }
            ).select("-password")


            return res
            .status(200)
            .json(
                new ApiResponse(200, {user },"Account details updated successfully")
            );

            

        })

        const updateUserAvatar = asyncHandler ( async (req,res) => {  
                const avatarLocalPath = req.file?.path;
                if(!avatarLocalPath){
                    throw new ApiError(400,"Avatar image is required");
                }


                const avatar = await uploadOnCloudinary(avatarLocalPath);

                if(!avatar.url){
                    throw new ApiError(500,"Could not upload avatar, try again later");
                }

                await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set : {
                            avatar : avatar.url,
                        }
                    },
                    {
                        new : true,
                    }
                ).select("-password");
 
                
                return res
                .status(200)
                .json(
                    new ApiResponse(200, {avatar : avatar.url },"Avatar updated successfully")
                );
            })

            const updateUserCoverImage = asyncHandler ( async (req,res) => {   
                    const coverImageLocalPath = req.file?.path;

                    if(!coverImageLocalPath){
                        throw new ApiError(400,"Cover image is required");
                    }

                    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
                    
                    if(!coverImage.url){
                        throw new ApiError(500,"Could not upload coverImage, try again later");
                    }

                    await User.findByIdAndUpdate(
                        req.user._id,
                        {
                            $set : {
                                coverImage : coverImage.url,
                            }
                        },
                        {
                            new : true,
                        }
                    ).select("-password");
                    return res
                    .status(200)
                    .json(
                        new ApiResponse(200, {coverImage : coverImage.url },"Cover image updated successfully")
                    );

            })


export {registerUser , loginUser , logoutUser , refreshAccessToken
    ,changeCurrentPassword, getCurrentUser , updateAccountDetails
    , updateUserAvatar , updateUserCoverImage
}; 