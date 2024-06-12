import mongoose from "mongoose";
import validator from "email-validator";


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.validate, // Use email-validator's validate function
      message: "Invalid email address",
    },
  },
  accountType: {
    type: String,
    enum: ['committee', 'student'],
    required: true,
  }
  ,followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  profileImg: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    },
  ],
},{
  timestamps:true,
});

const User = mongoose.model("user", userSchema);
export {User};


    
