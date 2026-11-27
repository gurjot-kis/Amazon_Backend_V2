import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    store_name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },

    store_description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    store_logo: {
      type: String,
      default: "",
      trim: true,
    },

    store_banner: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      match: [/^$|^\S+@\S+\.\S+$/, "Invalid email address"],
    },

    countryCode: {
      type: String,
      default: "+91",
      trim: true,
      match: [/^\+\d{1,4}$/, "Invalid country code"],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      match: [/^$|^\+?[0-9\s\-()]{7,15}$/, "Invalid phone number"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    postal_code: {
      type: String,
      default: "",
      trim: true,
    },

    // GeoJSON Point: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: [true, "Store location is required"],
      },
      coordinates: {
        type: [Number],
        default: undefined,
        required: [true, "Store coordinates are required"],
        validate: {
          validator: (v) =>
            Array.isArray(v) &&
            v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 &&
            v[1] >= -90 &&
            v[1] <= 90,
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },

    gst_number: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      match: [
        /^$|^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/,
        "Invalid GST number",
      ],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    timings: {
      type: [
        {
          day: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            required: true,
          },

          is_closed: {
            type: Boolean,
            default: false,
          },

          open_time: {
            type: String,
            default: "",
            trim: true,
            match: [
              /^$|^([01]\d|2[0-3]):[0-5]\d$/,
              "open_time must be HH:MM (24h)",
            ],
          },

          close_time: {
            type: String,
            default: "",
            trim: true,
            match: [
              /^$|^([01]\d|2[0-3]):[0-5]\d$/,
              "close_time must be HH:MM (24h)",
            ],
          },
        },
      ],
      default: [],
      validate: {
        validator(arr) {
          const days = arr.map((t) => t.day);
          return new Set(days).size === days.length;
        },
        message: "Each day can appear only once in timings",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Geospatial index for nearby store and delivery calculations
StoreSchema.index({ location: "2dsphere" });

const Store = mongoose.model("Store", StoreSchema);

export default Store;
