import mongoose from "mongoose";
import { STATUS_TYPE, STATUS_TYPE_VALUES } from "../constants/index.js";

const { Schema, model } = mongoose;

const helpSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: STATUS_TYPE_VALUES,
      default: STATUS_TYPE.ACTIVE,
    },
  },
  { timestamps: true, versionKey: false },
);

const Help = model("Help", helpSchema);

export default Help;
