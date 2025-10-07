import {v2 as cloudinary} from "cloudinary";
import fs from "fs"



cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const uploadOnCloudinary = async (filePath) =>{
        try {
                if(!filePath) return null;
            //uploading a file on cloudinary
           const response= cloudinary.uploader.upload(filePath,{
                resource_type:"auto",
            })

            //sucessfully uploaded
            console.log("file uploaded on cloudinary ",response.url);
            return response;


        } catch (error) {
                fs.unlinkSync(filePath);//remove the locally
                //temp file which is saved in memory 
                // as upload failed


                console.log("error while uploading on cloudinary",error);
            }
  }
  

  export {uploadOnCloudinary};