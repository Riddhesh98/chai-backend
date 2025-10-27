import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controllers.js";

const router = Router();

// ✅ Get all videos (with query, pagination, etc.)
router
    .route("/")
    .get(getAllVideos) // Public access — you can wrap with verifyJWT if needed
    .post(
        verifyJWT, // Only logged-in users can publish
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishAVideo
    );


router.route("/:videoId").get(getVideoById);

// Update a video (title, desc, thumbnail, etc.)
router
    .route("/:videoId")
    .patch(
        verifyJWT,
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        updateVideo
    );

//  Delete a video
router.route("/:videoId").delete(verifyJWT, deleteVideo);

// Toggle publish/unpublish
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

export default router;
