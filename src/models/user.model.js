import mongoose from "mongoose";
import crypto from "crypto";
import {
  AUTH_PROVIDER,
  AUTH_PROVIDER_VALUES,
  GENDER_VALUES,
  STATUS,
  STATUS_VALUES,
  USER_ROLE,
  USER_ROLE_VALUES,
} from "../constants/index.js";

const UserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    countryCode: { type: String, default: "+91", trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    code: { type: String, default: "", trim: true },
    gst_number: { type: String, default: "", trim: true },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLE.USER,
      index: true,
    },
    status: {
      type: Number,
      enum: STATUS_VALUES,
      default: STATUS.ACTIVE,
    },
    googleId: { type: String, default: "", trim: true, index: true },
    facebookId: { type: String, default: "", trim: true, index: true },
    appleId: { type: String, default: "", trim: true, index: true },
    authProvider: {
      type: String,
      enum: AUTH_PROVIDER_VALUES,
      default: AUTH_PROVIDER.LOCAL,
      index: true,
    },
    profilePicture: { type: String, default: "" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "Hey there! I am using Chat." },
    gender: { type: String, enum: GENDER_VALUES, default: null },
    passwordHash: { type: String, default: "" },

    // **** Forgot-password OTP flow
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },

    // **** Twilio phone-login OTP (separate from email forgot-password OTP)
    loginTwilioOtp: { type: String, default: null },
    loginTwilioOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

export default User;
