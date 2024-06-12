import express from "express";
import {getMyProfile,register,login,getProfile,followUser,updateProfile , profileImg} from "../controllers/userControllers.js";
import authenticateUser from "../middleware/authMiddleware.js";
import { uploadCloudinary } from "../middleware/valid.js";

const router = express.Router();

router.post("/register", register);

router.post("/login",login);

router.get('/myProfile', authenticateUser,getMyProfile);

router.get('/suggestedProfile', authenticateUser,getProfile);

router.patch('/follow',authenticateUser,followUser);

router.put('/update',authenticateUser,updateProfile);

router.post('/profileimg',authenticateUser ,uploadCloudinary.single('file'),profileImg);

export default router;