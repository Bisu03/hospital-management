// File: /models/User.js
import mongoose from "mongoose";

// Create the User schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Staff", // default role
    },
    pageAccess: {
      type: [Array], // List of accessible pages
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export User model
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
