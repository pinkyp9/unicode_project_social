import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
//import upload from '../middleware/multer.js';
import { uploadCloudinary } from "../middleware/valid.js";
import {commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getSavedPosts,
  getUserPosts,
  likeUnlikePost,
  saveUnsavePost,
} from "../controllers/postControllers.js";
import { replyToComment } from "../controllers/postControllers.js";

const router = express.Router();

router.get("/all", authenticateUser, getAllPosts);
router.get("/following", authenticateUser, getFollowingPosts);
router.get("/likes", authenticateUser, getLikedPosts);
router.get("/saved", authenticateUser, getSavedPosts);
router.get("/user", authenticateUser, getUserPosts);
router.post("/create", authenticateUser, uploadCloudinary.array('file', 10), createPost);
router.post("/likeunlike", authenticateUser, likeUnlikePost);
router.post("/saveunsave", authenticateUser, saveUnsavePost);
router.delete("/delete", authenticateUser, deletePost);
router.post("/comment", authenticateUser, commentOnPost);
router.post("/reply", authenticateUser, replyToComment);


export default router;