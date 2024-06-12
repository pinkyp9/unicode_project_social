import {User} from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { cloudinary } from "../middleware/cloudinary.js";
dotenv.config();

const register = async (req, res) => {
  try {
    const { username,password,email,accountType} = req.body;
    //console.log("hello");
    const registrationData = await User.findOne({email});
    if (registrationData) {
      return res.status(400).json({ error: "Registration already done" });
    };
    if(!username || !password || !email ){
      return res.status(400).json({error : "fill all the feilds"});
    }
  
    if (!registrationData) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const newUser = new User({ username, email ,accountType, password: hashedPassword, isVerified: true });
      await newUser.save();
      res.status(200).json({ message: "account registered" });
    } 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "registratoion failed" });
  }
};

const login = async (req,res)=>{
    try {
        const {email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d', 
        });

        res.status(200).json({userId: user._id, message: 'Login successful.', token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const getMyProfile = async(req,res)=>{
    try{
        
            const user = await User.findById(req.userId);
            res.status(200).json({message: 'Authenticated route', userId: req.userId, user});

        }
    catch(error){
        console.log(error);
        res.status(500).json({message:"error"})
    }
}

const getProfile = async (req, res) => {
    try {
      const users = await User.find({}, { username: 1 }); // Fetching only the username field
      res.status(200).json({ message: 'Authenticated route', users });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "error" });
    }
  }

  //remaining
  const updateProfile = async (req, res, next) => {
    try {
      const {
        username,
        email,
        description,
        currentPassword,
        newPassword,
            } = req.body;
  
      const userId = req.userId; 
  
      const user = await User.findById(userId);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Only one of currentPassword or newPassword should be present
      if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
        return res.status(400).json({
          error: "Please provide both current password and new password",
        });
      }
  
      // Updating password
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
  
        if (!isMatch)
          return res.status(400).json({ error: "Current password is incorrect" });
  
        // Hashing and updating the new password
        user.password = await bcrypt.hash(newPassword, 10);
      }
  
      // Update user fields
      user.email = email || user.email;
      user.username = username || user.username;
      user.description = description || user.description;
        
  
      await user.save();
      // Ensure password is not sent in response
      const finalUser = await User.findById(userId).select("-password");
  
      return res.status(200).json({ user: finalUser });
    } catch (error) {
      console.error("Error in updateProfile: ", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  


  const followUser = async (req, res) => {
    try {
      const { usernametofollow } = req.body;
  
      const userToFollow = await User.findOne({ username: usernametofollow });
      if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const currentUser = await User.findById(req.userId);
      if (!currentUser) {
        return res.status(404).json({ message: "Current user not found" });
      }
  
      // Check 
      const isFollowing = currentUser.following.includes(userToFollow.username);
  
      if (isFollowing) {
        // Unfollow the user
        currentUser.following = currentUser.following.filter(username => username !== userToFollow.username);
        userToFollow.followers = userToFollow.followers.filter(username => username !== currentUser.username);
  
        await currentUser.save();
        await userToFollow.save();
  
        res.status(200).json({ message: "You have unfollowed this user." });
      } else {
        // Follow the user
        currentUser.following.push(userToFollow.username);
        userToFollow.followers.push(currentUser.username);
  
        await currentUser.save();
        await userToFollow.save();
  
        res.status(200).json({ message: "You are now following this user." });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  const profileImg = async (req, res) => {
    try {
      const userId = req.userId;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // Upload the image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      // Update the user's profile image URL
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Remove the previous profile image from Cloudinary if it exists
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      user.profileImg = result.secure_url;
      await user.save();
      return res.status(200).json({ message: 'Profile image updated successfully', profileImg: user.profileImg });
    } catch (error) {
      console.error("Error in uploadProfileImage: ", error.message);
      res.status(500).json({ error: 'Failed to upload profile image' });
    }
  };
  
export {  register, login ,getProfile,getMyProfile,updateProfile,followUser , profileImg};