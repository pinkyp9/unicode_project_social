import { Post } from "../model/postModel.js";
import { User } from "../model/userModel.js";
import { cloudinary } from "../middleware/cloudinary.js";
import { Comment } from '../model/commentModel.js';
const createPost = async (req, res) => {
    try {
      const  author = req.userId;
      console.log(author);
      const {content} = req.body;
      const images = req.files.map(file => file.path); // Cloudinary stores the image URL in `file.path`
      console.log("hello world");
      const newPost = new Post({ content, images, author });
      await newPost.save();
      
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const deletePost = async (req, res) => {
    try {
      const { postId } = req.body;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.author.toString() !== req.userId) {
        return res.status(403).json({ message: "You are not authorized to delete this post" });
      }
  
      // Delete images from Cloudinary
      const imageDeletionPromises = post.images.map(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract the public ID from the URL
        await cloudinary.uploader.destroy(publicId);
      });
  
      await Promise.all(imageDeletionPromises);
  
      // Delete the post
      await post.deleteOne();
      res.status(200).json({ message: "Post and associated images deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
 


  const likeUnlikePost = async (req, res) => {
    try {
      const userId = req.userId;
      const { postId } = req.body;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const userLikedPost = post.likes.includes(userId);
  
      if (userLikedPost) {
        // Unlike the post
        post.likes.pull(userId);
        await User.findByIdAndUpdate(userId, {
          $pull: { likedPosts: postId }
        });
  
        await post.save();
  
        res.status(200).json({ message: "Post unliked successfully", likes: post.likes });
      } else {
        // Like the post
        post.likes.push(userId);
        await User.findByIdAndUpdate(userId, {
          $push: { likedPosts: postId }
        });
  
        await post.save();
  
        res.status(200).json({ message: "Post liked successfully", likes: post.likes });
      }
    } catch (error) {
      console.log("Error in likeUnlikePost controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const commentOnPost = async (req, res) => {
    try {
      const { postId, content } = req.body;
      const userId = req.userId;
  
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Create a new comment
      const newComment = new Comment({
        content,
        post: postId,
        author: userId
      });
  
      // Save the comment
      await newComment.save();
  
      // Update the post with the new comment
      post.comments.push(newComment._id);
      await post.save();
  
      res.status(201).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
      console.log("Error in commentOnPost controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const replyToComment = async (req, res) => {
    try {
      const { commentId, content } = req.body;
      const userId = req.userId;
  
      // Check if the comment exists
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
  
      // Create a new reply
      const newReply = new Comment({
        content,
        author: userId,
        post: parentComment.post,
        parentComment: commentId
      });
  
      // Save the reply
      await newReply.save();
  
      // Update the parent comment with the new reply
      parentComment.replies.push(newReply._id);
      await parentComment.save();
  
      res.status(201).json({ message: "Reply added successfully", reply: newReply });
    } catch (error) {
      console.log("Error in replyToComment controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const saveUnsavePost = async (req, res) => {
    try {
      const { postId } = req.body;
      const userId = req.userId;
  
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Check if the post is already saved by the user
      const user = await User.findById(userId);
  
      // If the post is already saved, unsave it; otherwise, save it
      if (user.savedPosts.includes(postId)) {
        // Remove the post from the user's saved posts
        user.savedPosts.pull(postId);
        await user.save();
        res.status(200).json({ message: "Post unsaved successfully" });
      } else {
        // Save the post for the user
        user.savedPosts.push(postId);
        await user.save();
        res.status(200).json({ message: "Post saved successfully" });
      }
    } catch (error) {
      console.log("Error in saveUnsavePost controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  const getLikedPosts = async (req, res) => {
    try {
      const userId = req.userId;
  
      // Find the user by ID and populate the likedPosts field
      const user = await User.findById(userId).populate('likedPosts');
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Extract the liked posts from the user document
      const likedPosts = user.likedPosts;
  
      res.status(200).json({ likedPosts });
    } catch (error) {
      console.log("Error in getLikedPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  const getSavedPosts = async (req, res) => {
    try {
      const userId = req.userId;
  
      // Find the user by ID and populate the savedPosts field
      const user = await User.findById(userId).populate('savedPosts');
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Extract the saved posts from the user document
      const savedPosts = user.savedPosts;
  
      res.status(200).json({ savedPosts });
    } catch (error) {
      console.log("Error in getSavedPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  const getAllPosts = async (req, res) => {
    try {
      // Retrieve all posts
      const posts = await Post.find();
  
      res.status(200).json({ posts });
    } catch (error) {
      console.log("Error in getAllPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };



  const getFollowingPosts = async (req, res) => {
    try {
      const userId = req.userId;
  
      // Find the current user
      const currentUser = await User.findById(userId);
  
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Retrieve the IDs of users that the current user is following
      const followingIds = currentUser.following;
  
      // Retrieve posts from users that the current user is following
      const followingPosts = await Post.find({ author: { $in: followingIds } }).sort({ createdAt: -1 });
  
      res.status(200).json({ followingPosts });
    } catch (error) {
      console.log("Error in getFollowingPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const getUserPosts = async (req, res) => {
    try {
      const { username } = req.body;
  
      // Find the user by their username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Retrieve posts from the user
      const userPosts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
  
      res.status(200).json({ userPosts });
    } catch (error) {
      console.log("Error in getUserPosts controller: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


export {
  createPost,
  deletePost,
  commentOnPost,
  replyToComment,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  getSavedPosts,
  saveUnsavePost,
};