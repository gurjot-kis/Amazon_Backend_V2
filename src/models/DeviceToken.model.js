import mongoose from "mongoose";
import { PLATFORM_VALUES } from "../constants/index.js";

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: PLATFORM_VALUES, required: true },
  },
  { timestamps: true, versionKey: false },
);

deviceTokenSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 270 },
);

export default mongoose.model("DeviceToken", deviceTokenSchema);
